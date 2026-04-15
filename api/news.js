import axios from 'axios';

/**
 * Institutional News Terminal (Real-Time Wire)
 * Pulls from Google News RSS (Macro) and Investing.com RSS (FX/Institutional)
 */
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
          
          const cleanTitle = title.replace('<![CDATA[', '').replace(']]>', '').split(' - ')[0].trim();
          
          return {
            title: cleanTitle,
            url: link.trim(),
            source: source.trim(),
            timestamp: new Date(pubDate).getTime(),
            time: new Date(pubDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            sentiment: cleanTitle.match(/Bullish|Positive|Up|Rise|Gain|Strong|Growth|Rally/i) ? 'Bullish' : 
                       cleanTitle.match(/Bearish|Negative|Down|Fall|Loss|Weak|Crisis|Crash/i) ? 'Bearish' : 
                       'Neutral'
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
        
        const cleanTitle = title.replace('<![CDATA[', '').replace(']]>', '').trim();
        
        return {
          title: cleanTitle,
          url: link.trim(),
          source: 'Investing.com',
          timestamp: new Date(pubDate).getTime(),
          time: new Date(pubDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          sentiment: cleanTitle.match(/Bullish|Positive|Up|Rise|Gain|Strong|Growth|Rally/i) ? 'Bullish' : 
                     cleanTitle.match(/Bearish|Negative|Down|Fall|Loss|Weak|Crisis|Crash/i) ? 'Bearish' : 
                     'Neutral'
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
      .slice(0, 18);

    return res.status(200).json({ success: true, news: finalNews });
  } catch (error) {
    console.error('Terminal News Core Failure:', error.message);
    res.status(500).json({ success: false, error: 'Institutional News Offline' });
  }
}
