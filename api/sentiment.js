
import axios from 'axios';
import https from 'https';

/**
 * LIVE Retail Sentiment Engine (Myfxbook Community Outlook)
 * ...
 */

const httpsAgent = new https.Agent({ keepAlive: true });

// In-memory cache
let cachedSession = null;
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

// Symbol map ...
const SYMBOL_MAP = {
  'EURUSD': 'EURUSD',
  'GBPJPY': 'GBPJPY',
  'USDJPY': 'USDJPY',
  'AUDUSD': 'AUDUSD',
  'NZDUSD': 'NZDUSD',
  'GBPNZD': 'GBPNZD',
  'XAUUSD': 'GOLD',
  'XAGUSD': 'SILVER',
  'XTIUSD': 'USOIL',
  'USOIL':  'USOIL',
  'WTI':    'USOIL',
  'US30':   'DOW',
  'SPX500': 'SP500',
  'US500':  'SP500',
  'NAS100': 'NASDAQ',
  'USTEC':  'NASDAQ',
  'DE30':   'DAX',
  'GER40':  'DAX',
  'JP225':  'NIKKEI',
  'BTCUSD': 'BITCOIN',
  'ETHUSD': 'ETHEREUM',
  'SOLUSD': 'SOLANA',
  'COPPER': 'COPPER',
  'GOLD':   'GOLD',
  'SILVER': 'SILVER',
};

async function getSession() {
  if (cachedSession) return cachedSession;

  const email = process.env.MYFXBOOK_EMAIL;
  const password = process.env.MYFXBOOK_PASSWORD;

  if (!email || !password) {
    throw new Error('MYFXBOOK_EMAIL and MYFXBOOK_PASSWORD env vars required');
  }

  const res = await axios.get('https://www.myfxbook.com/api/login.json', {
    params: { email, password },
    timeout: 8000,
    httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    }
  });

  if (res.data.error) {
    throw new Error(`Myfxbook login failed: ${res.data.message}`);
  }

  cachedSession = res.data.session;
  console.log('[Sentiment] Myfxbook session acquired.');
  return cachedSession;
}

async function fetchLiveOutlook() {
  // Return cached data if fresh
  if (cachedData && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return { data: cachedData, fromCache: true };
  }

  const session = await getSession();

  const res = await axios.get('https://www.myfxbook.com/api/get-community-outlook.json', {
    params: { session },
    timeout: 8000,
    httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    }
  });

  if (res.data.error) {
    // Session expired — clear and retry once
    cachedSession = null;
    const newSession = await getSession();
    const retry = await axios.get('https://www.myfxbook.com/api/get-community-outlook.json', {
      params: { session: newSession },
      timeout: 8000,
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      }
    });
    if (retry.data.error) throw new Error(`Myfxbook outlook failed after re-auth: ${retry.data.message}`);
    cachedData = retry.data;
    cacheTimestamp = Date.now();
    return { data: retry.data, fromCache: false };
  }

  if (res.data.error) throw new Error(`Myfxbook outlook failed: ${res.data.message}`);

  cachedData = res.data;
  cacheTimestamp = Date.now();
  return { data: res.data, fromCache: false };
}

function mapOutlookToAssets(outlookData) {
  const result = {};
  const symbols = outlookData.symbols || [];

  symbols.forEach(sym => {
    // Normalize: remove "/" and spaces, uppercase
    const rawName = (sym.name || '').replace(/[\/\s]/g, '').toUpperCase();
    const mappedId = SYMBOL_MAP[rawName];

    if (mappedId && !result[mappedId]) {
      result[mappedId] = {
        long: Math.round(sym.longPercentage || 50),
        short: Math.round(sym.shortPercentage || 50),
        longVolume: sym.longVolume || 0,
        shortVolume: sym.shortVolume || 0,
        totalPositions: (sym.longPositions || 0) + (sym.shortPositions || 0),
        source: 'Myfxbook (Live)',
      };
    }
  });

  return result;
}

export default async function handler(req, res) {
  const { asset, batch } = req.query;

  try {
    // 1. Batch Mode — returns all mapped assets at once
    if (batch === 'true') {
      const { data, fromCache } = await fetchLiveOutlook();
      const mapped = mapOutlookToAssets(data);

      return res.status(200).json({
        success: true,
        batch: mapped,
        source: 'Myfxbook Community Outlook',
        cached: fromCache,
        symbolCount: Object.keys(mapped).length,
      });
    }

    // 2. Individual Asset Mode
    if (!asset) {
      return res.status(400).json({ success: false, error: 'Asset required' });
    }

    const { data } = await fetchLiveOutlook();
    const mapped = mapOutlookToAssets(data);
    const assetData = mapped[asset.toString().toUpperCase()];

    if (!assetData) {
      return res.status(404).json({ success: false, error: `No sentiment data for ${asset}` });
    }

    res.status(200).json(assetData);
  } catch (error) {
    console.error('[Sentiment API] Error:', error.message);

    // Graceful degradation — return cached data if available
    if (cachedData) {
      const mapped = mapOutlookToAssets(cachedData);
      return res.status(200).json({
        success: true,
        batch: batch === 'true' ? mapped : undefined,
        source: 'Myfxbook (Stale Cache)',
        cached: true,
        warning: 'Using stale cache due to API error',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Sentiment feed offline',
      hint: !process.env.MYFXBOOK_EMAIL ? 'MYFXBOOK_EMAIL is missing' : !process.env.MYFXBOOK_PASSWORD ? 'MYFXBOOK_PASSWORD is missing' : 'Credentials are set but login failed — check email/password',
    });
  }
}
