import axios from 'axios';

// Vercel Serverless Function - Real-time Market Sentiment Engine
export default async function handler(req, res) {
  const { asset, category } = req.query;

  try {
    let result = { long: 50, short: 50, source: 'unknown' };

    // 1. LIVE CRYPTO SENTIMENT (Binance Global Long/Short Ratio)
    if (category === 'Crypto' && asset) {
      const binanceSym = asset.replace(/[^A-Z]/g, '') + 'USDT';
      const response = await axios.get(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio`, {
        params: { symbol: binanceSym, period: '1d', limit: 1 }
      });

      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        const longPct = (parseFloat(data.longAccount) * 100).toFixed(1);
        const shortPct = (parseFloat(data.shortAccount) * 100).toFixed(1);
        result = { long: parseFloat(longPct), short: parseFloat(shortPct), source: 'Binance Live Ticks' };
        return res.status(200).json(result);
      }
    } 

    // 2. LIVE FOREX/INDICES SENTIMENT (TradingView Technical Scanner)
    // This hits the TV scanning engine to get real-time Buy/Sell indicator balance (Free & Global)
    if (category === 'Forex' || category === 'Indices' || category === 'Commodities') {
      const tvMap = {
        'EURUSD': 'FX:EURUSD', 'GBPNZD': 'FX:GBPNZD', 'AUDUSD': 'FX:AUDUSD', 'USDJPY': 'FX:USDJPY', 'NZDUSD': 'FX:NZDUSD',
        'DOW': 'DJ:DJI', 'SP500': 'TVC:SPX', 'NASDAQ': 'TVC:NDX', 'DAX': 'XETR:DAX', 'NIKKEI': 'TVC:NI225',
        'GOLD': 'OANDA:XAUUSD', 'SILVER': 'OANDA:XAGUSD', 'USOIL': 'TVC:USOIL', 'COPPER': 'COMEX:HG1!'
      };
      
      const symbol = tvMap[asset] || (category === 'Forex' ? `FX:${asset}` : asset);
      const [exchange, pair] = symbol.split(':');

      const tvResponse = await axios.post('https://scanner.tradingview.com/forex/scan', {
        "symbols": { "tickers": [symbol], "query": { "types": [] } },
        "columns": ["Recommend.All", "buy", "sell", "neutral"]
      });

      if (tvResponse.data && tvResponse.data.data && tvResponse.data.data.length > 0) {
        const d = tvResponse.data.data[0].d;
        const buy = d[1] || 0;
        const sell = d[2] || 0;
        const total = buy + sell || 1;
        const long = Math.round((buy / total) * 100);
        const short = 100 - long;
        
        result = { long, short, source: 'TradingView Real-Time Scan' };
        return res.status(200).json(result);
      }
    }

    // Final fallback (Should not be hit if TV/Binance are up)
    res.status(200).json(result);
  } catch (error) {
    console.error('Sentiment Engine Error:', error.message);
    res.status(200).json({ long: 52, short: 48, source: 'Network Fallback (Live Unavailable)' });
  }
}
