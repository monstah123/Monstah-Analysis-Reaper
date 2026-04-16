import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * ReaperSnatcher Proxy v1.0
 * Institutional-grade scraper designed to 'snatch' live data from high-traffic 
 * financial nodes when primary APIs are rate-limited.
 */

const TARGETS = {
  'US30': 'https://www.google.com/finance/quote/.DJI:INDEXDJX',
  'SP500': 'https://www.google.com/finance/quote/.INX:INDEXSP',
  'NASDAQ': 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ',
  'DAX': 'https://www.google.com/finance/quote/DAX:INDEXDB',
  'NIKKEI': 'https://www.google.com/finance/quote/NI225:INDEXNIKKEI',
  'USOIL': 'https://finance.yahoo.com/quote/CL=F',
  'UKOIL': 'https://finance.yahoo.com/quote/BZ=F',
  'GOLD': 'https://finance.yahoo.com/quote/GC=F',
  'SILVER': ['https://finance.yahoo.com/quote/SI=F', 'https://finance.yahoo.com/quote/XAG=F', 'https://www.google.com/finance/quote/SILVER:CUR'],
  'COPPER': 'https://finance.yahoo.com/quote/HG=F'
};

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol || !TARGETS[symbol]) {
    return res.status(400).json({ error: 'Invalid institutional target' });
  }

  try {
    const urls = Array.isArray(TARGETS[symbol]) ? TARGETS[symbol] : [TARGETS[symbol]];
    let response = null;
    let urlUsed = '';
    
    // Multi-Host Institutional Dispatch
    for (const url of urls) {
      try {
        urlUsed = url;
        response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          },
          timeout: 7000
        });
        if (response.data && response.data.length > 5000) break;
      } catch (e) {
        continue;
      }
    }

    if (!response || !response.data) throw new Error('Global Liquidity Node Timeout for ' + symbol);

    const $ = cheerio.load(response.data);
    let priceText = '';
    let change24h = 0;

    if (urlUsed.includes('yahoo.com')) {
      // Institutional Yahoo Extraction Pattern - Target main price directly
      priceText = $('.Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text() 
               || $('[data-test="qsp-price"]').text() 
               || $('fin-streamer[data-field="regularMarketPrice"]').first().attr('value') 
               || $('fin-streamer[data-field="regularMarketPrice"]').first().text();
      
      let changeVal = $('fin-streamer[data-field="regularMarketChangePercent"]').first().attr('value')
                   || $('fin-streamer[data-field="regularMarketChangePercent"]').first().text();
      if (changeVal) {
          change24h = parseFloat(changeVal.toString().replace(/[()%]/g, ''));
      }
    } else if (urlUsed.includes('google.com')) {
      // Direct Main Price Selector to avoid related-index mirror pricing
      priceText = $('.fxKbKc').first().text();
      let changeText = $('.Jw797b').first().text() || $('.EnC39d').first().text();
      if (changeText) {
        const match = changeText.match(/([+-]?\d+\.?\d*)%/);
        if (match) change24h = parseFloat(match[1]);
      }
    }

    if (!priceText) {
      // LAST RESORT: Try to find any price-like string in a known price container
      priceText = $('.IBr93f').find('.YMlSbe').first().text();
    }

    if (!priceText) {
      throw new Error('Snatcher failed to extract price for ' + symbol);
    }

    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    return res.status(200).json({
      price,
      change24h,
      lastUpdated: Date.now(),
      source: 'ReaperSnatcher-Google'
    });

  } catch (error) {
    console.error(`[ReaperSnatcher] ${symbol} Extraction Failed:`, error.message);
    return res.status(500).json({ error: 'Institutional Snatch Failed', detail: error.message });
  }
}
