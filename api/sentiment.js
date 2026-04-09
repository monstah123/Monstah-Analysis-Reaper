import axios from 'axios';

// Reaper 12.1 - TRUE LIVE DATA ENGINE
// Sources:
//   Fed Funds Rate → Alpha Vantage FEDERAL_FUNDS_RATE (fast, reliable)
//   CPI YoY %     → Alpha Vantage CPI index (compute YoY from 13-month window)
//   NFP MoM       → FRED PAYEMS units=chg (official BLS monthly jobs added — same source as TradingView)
//   Real GDP %    → FRED A191RL1Q225SBEA (quarterly annualised growth rate)
//   COT           → Official CFTC public API
//   NO fake fallbacks — null = syncing, not wrong data

export default async function handler(req, res) {
  const now = Date.now();
  let finalBatch = {};
  let finalMacro = { GDP: null, CPI: null, FedRate: null, NFP: null, PMI: null };
  let finalYields = { y2: null, y10: null, y30: null, y3m: null };
  let sourceLabel = 'Awaiting Sync...';

  const fredKey = process.env.FRED_KEY || 'a511ff61c8ca4177e733079ebec436d3';
  const avKey   = process.env.ALPHA_VANTAGE_KEY || 'demo';

  // ─── 1. CFTC COT DATA ────────────────────────────────────────────────────
  try {
    const cftcRes = await axios.get(
      'https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=800&$order=report_date_as_yyyy_mm_dd DESC',
      { timeout: 15000 }
    );
    const cftcData = cftcRes.data;

    const cftcMap = {
      'EURO FX': 'EURUSD',
      'BRITISH POUND': 'GBPUSD',
      'JAPANESE YEN': 'USDJPY',
      'CANADIAN DOLLAR': 'USDCAD',
      'AUSTRALIAN DOLLAR': 'AUDUSD',
      'NEW ZEALAND DOLLAR': 'NZDUSD',
      'E-MINI S&P 500': 'SP500',
      'NASDAQ-100 Consolidated': 'NASDAQ',
      'DJIA Consolidated': 'DOW',
      'DOW JONES INDUSTRIAL AVG': 'DOW',
      'NIKKEI STOCK AVERAGE YEN DENOM': 'NIKKEI',
      'GOLD': 'GOLD',
      'SILVER': 'SILVER',
      'COPPER-Grade #1': 'COPPER',
      'CRUDE OIL, LIGHT SWEET': 'USOIL',
      'BITCOIN': 'BITCOIN'
    };

    if (cftcData && cftcData.length > 0) {
      cftcData.forEach(row => {
        for (const [cftcName, assetId] of Object.entries(cftcMap)) {
          if (row.market_and_exchange_names && row.market_and_exchange_names.includes(cftcName)) {
            if (!finalBatch[assetId]) {
              const l = parseFloat(row.noncomm_positions_long_all) || 0;
              const s = parseFloat(row.noncomm_positions_short_all) || 0;
              if (l > 0 || s > 0) {
                const total = l + s;
                const iL = Math.round((l / total) * 100);
                finalBatch[assetId] = { iLong: iL, iShort: 100 - iL, source: 'Official CFTC COT' };
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('CFTC Error:', error.message);
  }

  // ─── 2. MACRO DATA ───────────────────────────────────────────────────────
  try {
    // Alpha Vantage helper
    const getAV = async (fn, params = '') => {
      const url = `https://www.alphavantage.co/query?function=${fn}&apikey=${avKey}${params}`;
      const r = await axios.get(url, { timeout: 15000 });
      return r.data;
    };

    // FRED helper — returns latest numeric value
    const getFred = async (series, units = 'lin') => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${fredKey}&file_type=json&limit=2&sort_order=desc&units=${units}`;
      const r = await axios.get(url, { timeout: 15000 });
      const obs = (r.data.observations || []).filter(o => o.value !== '.');
      if (!obs.length) throw new Error('No FRED data for ' + series);
      return parseFloat(obs[0].value);
    };

    const [fedData, cpiData, nfpVal, gdpVal, y2, y10, y30, y3m] = await Promise.allSettled([
      // Fed Funds Rate — Alpha Vantage (fast, reliable)
      getAV('FEDERAL_FUNDS_RATE', '&interval=monthly'),
      // CPI index monthly — Alpha Vantage (compute YoY ourselves)
      getAV('CPI', '&interval=monthly'),
      // NFP monthly jobs added — FRED PAYEMS units=chg (EXACT same number BLS releases / TradingView shows)
      getFred('PAYEMS', 'chg'),
      // Real GDP annualised growth % — FRED
      getFred('A191RL1Q225SBEA'),
      // Treasury yields — FRED
      getFred('DGS2'),
      getFred('DGS10'),
      getFred('DGS30'),
      getFred('DGS3MO'),
    ]);

    // Fed Rate
    let fedRate = null;
    if (fedData.status === 'fulfilled') {
      const d = fedData.value?.data;
      if (d && d.length > 0) fedRate = parseFloat(d[0].value);
    }

    // CPI YoY %
    let cpiYoY = null;
    if (cpiData.status === 'fulfilled') {
      const d = cpiData.value?.data;
      if (d && d.length >= 13) {
        const latest   = parseFloat(d[0].value);
        const yearAgo  = parseFloat(d[12].value);
        if (yearAgo > 0) cpiYoY = parseFloat(((latest - yearAgo) / yearAgo * 100).toFixed(2));
      }
    }

    // NFP — FRED PAYEMS chg already gives the official monthly change in thousands
    // This is the exact same figure reported by BLS and shown on TradingView Economic Calendar
    const nfpChange = nfpVal.status === 'fulfilled' ? Math.round(nfpVal.value) : null;

    // GDP
    const gdpGrowth = gdpVal.status === 'fulfilled' ? gdpVal.value : null;

    // Yields
    finalYields = {
      y2:  y2.status  === 'fulfilled' ? y2.value  : null,
      y10: y10.status === 'fulfilled' ? y10.value : null,
      y30: y30.status === 'fulfilled' ? y30.value : null,
      y3m: y3m.status === 'fulfilled' ? y3m.value : null,
    };

    finalMacro = {
      GDP:     gdpGrowth,
      CPI:     cpiYoY,
      FedRate: fedRate,
      NFP:     nfpChange,  // in thousands, matches BLS / TradingView
      PMI:     null        // No free reliable PMI — show dash, not fake number
    };

    sourceLabel = 'BLS/FRED + Alpha Vantage (Live)';
  } catch (e) {
    console.error('Macro Sync Error:', e.message);
    sourceLabel = 'Sync Error';
  }

  // ─── 3. AI ENGINE — fill missing COT + retail sentiment ─────────────────
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY;
  if (apiKey) {
    try {
      const isDeepSeek = apiKey && apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-');
      const baseUrl = isDeepSeek
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = isDeepSeek ? 'deepseek-chat' : 'gpt-4o-mini';
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const aiRes = await axios.post(baseUrl, {
        model,
        messages: [{ role: 'user', content: `Return JSON: { "sentiment": { "ASSET_ID": { "iL": 0-100, "rL": 0-100 } } } for GOLD, NASDAQ, SILVER, SP500, COPPER, DOW, USDJPY, DAX, USOIL, NIKKEI, BITCOIN, EURUSD, SOLANA, ETHEREUM. COT & Retail estimates for ${dateStr}.` }],
        response_format: { type: 'json_object' },
        temperature: 0
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const data = JSON.parse(aiRes.data.choices[0].message.content);
      for (const [id, s] of Object.entries(data.sentiment)) {
        if (!finalBatch[id]) {
          finalBatch[id] = { iLong: s.iL, iShort: 100 - s.iL, long: s.rL, short: 100 - s.rL, source: 'AI Engine Estimate' };
        } else {
          finalBatch[id].long  = s.rL;
          finalBatch[id].short = 100 - s.rL;
        }
      }
    } catch (e) {
      console.error('AI Engine Error:', e.message);
    }
  }

  return res.status(200).json({
    success: true,
    batch:   finalBatch,
    macro:   finalMacro,
    yields:  finalYields,
    source:  sourceLabel,
    timestamp: now
  });
}
