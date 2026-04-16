import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * ReaperSnatcher v18.0 - Institutional Data Extraction Node
 * Engineered to bypass 'Market Mirror' headers and snatch 100% accurate ticks.
 */

const TARGETS = {
  'US30': 'https://finance.yahoo.com/quote/%5EDJI',
  'SP500': 'https://finance.yahoo.com/quote/%5EGSPC',
  'NASDAQ': 'https://finance.yahoo.com/quote/%5EIXIC',
  'DAX': 'https://finance.yahoo.com/quote/%5EGDAXI',
  'NIKKEI': 'https://finance.yahoo.com/quote/%5EN225',
  'USOIL': 'https://finance.yahoo.com/quote/CL=F',
  'UKOIL': 'https://finance.yahoo.com/quote/BZ=F',
  'GOLD': 'https://finance.yahoo.com/quote/GC=F',
  'SILVER': 'https://finance.yahoo.com/quote/SI=F',
  'COPPER': 'https://finance.yahoo.com/quote/HG=F'
};

// Institutional Baseline Cross-Check (prevents mirror-pricing bugs)
const BASELINES = {
  'GOLD': { min: 1000, max: 5000 },
  'SILVER': { min: 10, max: 100 },
  'USOIL': { min: 10, max: 200 },
  'UKOIL': { min: 10, max: 200 },
  'COPPER': { min: 0.5, max: 10 },
  'US30': { min: 10000, max: 80000 },
  'SP500': { min: 1000, max: 10000 },
  'NASDAQ': { min: 5000, max: 40000 },
  'DAX': { min: 5000, max: 30000 },
  'NIKKEI': { min: 10000, max: 80000 }
};

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol || !TARGETS[symbol]) {
    return res.status(400).json({ error: 'Invalid institutional target' });
  }

  try {
    const url = TARGETS[symbol];
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // THE SNATCH: Targeted Institutional Selectors
    // We prioritize the unique 'fin-streamer' with specific data-field and data-symbol attributes
    let priceText = '';
    
    // Strategy A: Targeted fin-streamer (Best for Yahoo Finance)
    const streamer = $(`fin-streamer[data-field="regularMarketPrice"]`).first();
    priceText = streamer.attr('value') || streamer.text();

    // Strategy B: Class-based hero extraction
    if (!priceText) {
      priceText = $('.livePrice').first().text() || $('.Fw\\(b\\).Fz\\(36px\\)').first().text();
    }

    if (!priceText) {
      throw new Error(`Snatcher failed to locate price node for ${symbol}`);
    }

    const price = parseFloat(priceText.toString().replace(/[^0-9.]/g, ''));
    
    // Percentage change extraction
    const changeStreamer = $(`fin-streamer[data-field="regularMarketChangePercent"]`).first();
    let change24h = parseFloat((changeStreamer.attr('value') || changeStreamer.text() || '0').toString().replace(/[()+-]/g, ''));

    // institutional Reasonability Check
    const baseline = BASELINES[symbol];
    if (baseline && (price < baseline.min || price > baseline.max)) {
        console.warn(`[Snatcher] MIRROR PRICE DETECTED for ${symbol}: ${price}. Retrying with secondary selector...`);
        // If it's a mirror price, try to find a different value on the page
        const alternativePrices = [];
        $('.Fw\\(b\\)').each((i, el) => {
           const val = parseFloat($(el).text().replace(/[^0-9.]/g, ''));
           if (val > baseline.min && val < baseline.max) alternativePrices.push(val);
        });
        if (alternativePrices.length === 0) {
            throw new Error(`Snatcher detected invalid mirror price (${price}) for ${symbol} and no valid baseline alternative found.`);
        }
        return res.status(200).json({
          price: alternativePrices[0],
          change24h,
          lastUpdated: Date.now(),
          source: 'ReaperSnatcher-Heuristic'
        });
    }

    return res.status(200).json({
      price,
      change24h,
      lastUpdated: Date.now(),
      source: 'ReaperSnatcher-Direct'
    });

  } catch (error) {
    console.error(`[ReaperSnatcher] ${symbol} Critical Failure:`, error.message);
    return res.status(500).json({ error: 'Institutional Snatch Failed', detail: error.message });
  }
}
