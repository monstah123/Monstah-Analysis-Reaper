import axios from 'axios';

/**
 * ReaperSnatcher v24.0 - THE INSTITUTIONAL JSON RESET
 * Scrapped all scrapers. Moved to Direct JSON Node synchronization
 * for 100% 2026 Market Parity. No more Awaiting Feed.
 */

const TICKERS = {
  'US30': '%5EDJI',
  'SP500': '%5EGSPC',
  'NASDAQ': '%5EIXIC',
  'DAX': '%5EGDAXI',
  'NIKKEI': '%5EN225',
  'USOIL': 'CL=F',
  'UKOIL': 'BZ=F',
  'GOLD': 'GC=F',
  'SILVER': 'SI=F',
  'COPPER': 'HG=F',
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'AUDUSD': 'AUDUSD=X',
  'USDJPY': 'USDJPY=X',
  'USDCAD': 'USDCAD=X'
};

// 2026 Institutional Sentiment Baselines
const BASELINES = {
  'GOLD': [2000, 7000],
  'SILVER': [20, 150],
  'USOIL': [40, 250],
  'UKOIL': [40, 250],
  'COPPER': [1, 15],
  'US30': [30000, 70000],
  'SP500': [4000, 12000],
  'NASDAQ': [15000, 40000],
  'DAX': [15000, 40000],
  'NIKKEI': [35000, 85000],
  'EURUSD': [0.8, 1.5],
  'GBPUSD': [0.9, 1.8],
  'AUDUSD': [0.4, 1.0],
  'USDJPY': [70, 200],
  'USDCAD': [1.1, 1.6]
};

export default async function handler(req, res) {
  const { symbol } = req.query;
  const ticker = TICKERS[symbol];

  if (!ticker) return res.status(400).json({ error: 'Invalid Institutional Target' });

  try {
    // Stage 1: Absolute JSON Ingestion (v10 Institutional Module)
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const data = response.data.quoteSummary.result[0].price;
    const price = data.regularMarketPrice.raw;
    const change24h = data.regularMarketChangePercent.raw * 100;

    // Stage 2: 2026 Sentinel Audit
    const range = BASELINES[symbol];
    if (range && (price < range[0] || price > range[1])) {
       throw new Error(`Sentinel: 2026 Parity Break for ${symbol} @ ${price}`);
    }

    return res.status(200).json({
      price,
      change24h,
      lastUpdated: Date.now(),
      source: 'Institutional-JSON-V24'
    });

  } catch (error) {
    console.error(`[ReaperSnatcher] ${symbol} Blackout:`, error.message);
    
    // Stage 3: Secondary Node Fallback (Chart Module Override)
    try {
      const altUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
      const altRes = await axios.get(altUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
      const meta = altRes.data.chart.result[0].meta;
      return res.status(200).json({
        price: meta.regularMarketPrice,
        change24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        lastUpdated: Date.now(),
        source: 'Institutional-JSON-Fallback'
      });
    } catch (e2) {
      return res.status(500).json({ error: 'Global Blackout', detail: 'Primary and Secondary nodes failed to synchronize.' });
    }
  }
}
