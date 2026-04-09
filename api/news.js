
import axios from 'axios';

/**
 * Institutional News Terminal (Real-Time Wire)
 * Pulls directly from live institutional RSS feeds (MarketWatch / Yahoo Finance)
 */
export default async function handler(req, res) {
  try {
    // 1. Primary Wire: MarketWatch MarketPulse (Institutional Grade)
    try {
      const mwRes = await axios.get('http://feeds.marketwatch.com/marketwatch/marketpulse/', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 4000
      });
      
      const items = mwRes.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
      if (items.length > 0) {
        const news = items.slice(0, 10).map(item => {
          const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Institutional Event';
          const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '#';
          const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || 'Just Now';
          
          return {
            title: title.replace('<![CDATA[', '').replace(']]>', '').trim(),
            url: link.trim(),
            source: 'MarketWatch Pulse',
            time: new Date(pubDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            sentiment: title.match(/Bullish|Positive|Up|Rise|Gain/i) ? 'Bullish' : title.match(/Bearish|Negative|Down|Fall|Loss/i) ? 'Bearish' : 'Neutral'
          };
        });
        return res.status(200).json({ success: true, news });
      }
    } catch (e) {
      console.warn('MarketWatch Wire failed, falling back...');
    }

    // 2. Secondary Wire: Yahoo Finance (Broad Market)
    const yfRes = await axios.get('https://finance.yahoo.com/news/rssindex', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 4000
    });
    
    const items = yfRes.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const news = items.slice(0, 10).map(item => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Market Update';
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '#';
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || 'Just Now';
      
      return {
        title: title.replace('<![CDATA[', '').replace(']]>', '').trim(),
        url: link.trim(),
        source: 'Yahoo Finance',
        time: new Date(pubDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sentiment: 'Neutral'
      };
    });

    res.status(200).json({ success: true, news });
  } catch (error) {
    console.error('All News Wires Failed:', error.message);
    res.status(500).json({ success: false, error: 'Institutional Feed Offline' });
  }
}
