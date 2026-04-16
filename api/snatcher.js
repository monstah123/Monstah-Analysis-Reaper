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
  'USOIL': 'https://www.google.com/finance/quote/CLW00:NYMEX',
  'UKOIL': 'https://www.google.com/finance/quote/BZW00:NYMEX', // Corrected Brent
  'GOLD': 'https://www.google.com/finance/quote/GCW00:COMEX',
  'SILVER': ['https://www.google.com/finance/quote/SIW00:COMEX', 'https://finance.yahoo.com/quote/SI=F'],
  'COPPER': 'https://www.google.com/finance/quote/HGW00:COMEX'
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
    
    // Try each URL until one hits
    for (const url of urls) {
      try {
        urlUsed = url;
        response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 10000
        });
        if (response.data) break;
      } catch (e) {
        continue;
      }
    }

    if (!response || !response.data) throw new Error('All institutional nodes failed for ' + symbol);

    const $ = cheerio.load(response.data);
    let priceText = '';
    let change24h = 0;

    if (urlUsed.includes('google.com')) {
      // Google Finance Extraction logic
      priceText = $('.fxKbKc').first().text();
      if (!priceText) priceText = $('[data-last-price]').first().attr('data-last-price');
      if (!priceText) priceText = $('.q7vM6c .fxKbKc').text() || $('.YMlSbe.fxKbKc').text();
      
      let changeText = $('.Jw797b').first().text() || $('.EnC39d').first().text() || $('.VfPpkd-vQzf8d').text();
      if (changeText) {
        const match = changeText.match(/([+-]?\d+\.?\d*)%/);
        if (match) change24h = parseFloat(match[1]);
      }
    } else if (urlUsed.includes('yahoo.com')) {
      // Yahoo Finance Extraction logic (High-fidelity fallback)
      priceText = $('[data-test="qsp-price"]').text() || $('fin-streamer[data-field="regularMarketPrice"]').first().text();
      let changeText = $('fin-streamer[data-field="regularMarketChangePercent"]').first().text();
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
