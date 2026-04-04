
import axios from 'axios';

/**
 * Institutional News Parser (DailyFX Proxy)
 * Scrapes the latest live institutional market narratives.
 * This is 100% free and does NOT require an Alpha Vantage key.
 */
export default async function handler(req, res) {
  try {
     // 1. Fetch live institutional feed from DailyFX (RSS)
     const response = await axios.get('https://www.dailyfx.com/feeds/forex-market-news', {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
     });
     
     const xml = response.data;
     const items = [];
     
     // 2. Ultra-light XML Parser (Regex based for zero-dep serverless execution)
     // We extract <item> blocks
     const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
     
     itemBlocks.slice(0, 15).forEach(block => {
        const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
        const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        
        if (titleMatch && linkMatch) {
           items.push({
              title: titleMatch[1].trim(),
              url: linkMatch[1].trim(),
              time: dateMatch ? dateMatch[1].trim() : 'Just now',
              source: 'DailyFX Institutional',
              // Quick sentiment heuristic (AI will refine this in the frontend)
              ticker: titleMatch[1].match(/[A-Z]{3}\/[A-Z]{3}|GOLD|OIL|BTC|SPX|DOW/i)?.[0] || 'Global'
           });
        }
     });

     res.status(200).json({ success: true, news: items });
  } catch (error) {
     console.error('[News API] Error:', error.message);
     res.status(500).json({ success: false, error: 'News Feed Timed Out' });
  }
}
