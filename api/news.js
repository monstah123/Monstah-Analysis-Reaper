import axios from 'axios';

/**
 * Institutional News Terminal (Real-Time Wire)
 * Pulls from Google News RSS (Macro) and Investing.com RSS (FX/Institutional)
 */

function decodeEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

function classifyHeadline(title) {
  const text = title.toLowerCase();
  const bullishTerms = [
    'bullish', 'positive', 'rise', 'rises', 'rising', 'gain', 'gains', 'surge',
    'surges', 'jump', 'jumps', 'strong', 'growth', 'rally', 'rallying',
    'rebound', 'recover', 'recovery', 'record high', 'beats', 'beat estimates',
    'outlook raised', 'rate cut', 'easing', 'stimulus', 'boost', 'advance', 'soar', 'soars'
  ];
  const bearishTerms = [
    'bearish', 'negative', 'fall', 'falls', 'falling', 'down', 'drop', 'drops',
    'plunge', 'plunges', 'loss', 'losses', 'weak', 'weakness', 'crisis', 'crash',
    'selloff', 'sell-off', 'decline', 'declines', 'recession', 'tariff', 'tariffs',
    'rate hike', 'cut forecast', 'downgrade', 'downgrades', 'slump', 'slumps',
    'warning', 'warns', 'tumble', 'tumbles'
  ];
  const bullishScore = bullishTerms.filter(term => text.includes(term)).length;
  const bearishScore = bearishTerms.filter(term => text.includes(term)).length;
  if (bullishScore > bearishScore) return 'Bullish';
  if (bearishScore > bullishScore) return 'Bearish';
  return 'Neutral';
}

export default async function handler(req, res) {
  try {
    // Queries
    const googleQuery = 'institutional+forex+macro+central+bank+news+when:1d';
    const googleUrl = `https://news.google.com/rss/search?q=${googleQuery}&hl=en-US&gl=US&ceid=US:en`;
    const bloombergUrl = `https://news.google.com/rss/search?q=site:bloomberg.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en`;
    const investingUrl = 'https://www.investing.com/rss/news_25.rss';

    // Fetch all feeds in parallel
    const [googleRes, investingRes, bloombergRes] = await Promise.allSettled([
      axios.get(googleUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }),
      axios.get(investingUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }),
      axios.get(bloombergUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 })
    ]);
    
    let combinedNews = [];

    // Process Feeds (Google News RSS Pattern)
    [googleRes, bloombergRes].forEach(res => {
      if (res.status === 'fulfilled' && res.value?.data) {
        const items = res.value.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
        const news = items.map(item => {
          const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
          const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '#';
          const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
          const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Institutional Wire';
          
          const cleanTitle = decodeEntities(title.replace('<![CDATA[', '').replace(']]>', '').split(' - ')[0].trim());
          
          return {
            title: cleanTitle,
            url: link.trim(),
            source: source.trim(),
            timestamp: new Date(pubDate).getTime(),
            time: new Date(pubDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            sentiment: classifyHeadline(cleanTitle)
          };
        });
        combinedNews.push(...news);
      }
    });

    // Process Investing.com
    if (investingRes.status === 'fulfilled' && investingRes.value?.data) {
      const items = investingRes.value.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
      const news = items.map(item => {
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
        const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '#';
        const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        
        const cleanTitle = decodeEntities(title.replace('<![CDATA[', '').replace(']]>', '').trim());
        
        return {
          title: cleanTitle,
          url: link.trim(),
          source: 'Investing.com',
          timestamp: new Date(pubDate).getTime(),
          time: new Date(pubDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          sentiment: classifyHeadline(cleanTitle)
        };
      });
      combinedNews.push(...news);
    }

    if (combinedNews.length === 0) {
      throw new Error('All News Feeds Offline');
    }

    // Sort by most recent and dedup by title
    const finalNews = combinedNews
      .sort((a, b) => b.timestamp - a.timestamp)
      .reduce((acc, curr) => {
        if (!acc.find(item => item.title === curr.title)) acc.push(curr);
        return acc;
      }, [])
      .filter(item => Number.isFinite(item.timestamp) && Date.now() - item.timestamp <= 36 * 60 * 60 * 1000)
      .slice(0, 18);

    return res.status(200).json({ success: true, news: finalNews });
  } catch (error) {
    console.error('Terminal News Core Failure:', error.message);
    res.status(500).json({ success: false, error: 'Institutional News Offline' });
  }
}
