import axios from 'axios';

let priceCache = null;
let priceCacheTime = 0;
const PRICE_CACHE_TTL = 30000; // 30 seconds cache for simple prices to avoid 429

// Memory cache for individual coin history to prevent UI spamming
const historyCache = {};
const HISTORY_CACHE_TTL = 60000 * 5; // 5 minutes

export default async function handler(req, res) {
  const { action, ids, id, days } = req.query;

  try {
    if (action === 'price') {
      // Return cached prices if active
      if (priceCache && (Date.now() - priceCacheTime) < PRICE_CACHE_TTL) {
        return res.status(200).json(priceCache);
      }

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const response = await axios.get(url, { timeout: 5000 });
      
      priceCache = response.data;
      priceCacheTime = Date.now();
      
      return res.status(200).json(priceCache);
    } 
    
    if (action === 'history') {
      const cacheKey = `${id}-${days}`;
      if (historyCache[cacheKey] && (Date.now() - historyCache[cacheKey].time) < HISTORY_CACHE_TTL) {
         return res.status(200).json(historyCache[cacheKey].data);
      }

      const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      historyCache[cacheKey] = {
        data: response.data,
        time: Date.now()
      };

      return res.status(200).json(response.data);
    }

    return res.status(400).json({ error: 'Invalid action' });
    
  } catch (error) {
    console.error(`[Crypto API Proxy] Error fetching ${action}:`, error.message);
    
    // Provide a graceful fallback to prevent frontend 500s during hard rate limits
    if (action === 'price') {
      if (priceCache) return res.status(200).json(priceCache);
      
      // Hard fallback if completely offline (prevents 429 UI crashes)
      const mockPrices = {
        'bitcoin': { usd: 65400, usd_24h_change: -1.2 },
        'ethereum': { usd: 3450, usd_24h_change: -2.1 },
        'solana': { usd: 145, usd_24h_change: 1.5 }
      };
      // Map to requested ids
      const result = {};
      (ids || '').split(',').forEach(coinId => {
         if (mockPrices[coinId]) result[coinId] = mockPrices[coinId];
      });
      return res.status(200).json(result);
    }
    
    if (action === 'history') {
      // Return empty array to default to dummy sparkline on client
      return res.status(200).json({ prices: [] });
    }
  }
}
