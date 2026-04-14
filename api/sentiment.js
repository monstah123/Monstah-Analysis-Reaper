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

  // ─── 1. CFTC COT DATA ────────────────────────────────────────────────────
  try {
    // We must query BOTH the Disaggregated format (Commodities/Crypto) AND the Legacy format (Currencies/Financials)
    const [cftcRes1, cftcRes2] = await Promise.allSettled([
      axios.get('https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=800&$order=report_date_as_yyyy_mm_dd DESC', { timeout: 15000 }),
      axios.get('https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$limit=800&$order=report_date_as_yyyy_mm_dd DESC', { timeout: 15000 })
    ]);

    const cftcData = [];
    if (cftcRes1.status === 'fulfilled' && cftcRes1.value?.data) cftcData.push(...cftcRes1.value.data);
    if (cftcRes2.status === 'fulfilled' && cftcRes2.value?.data) cftcData.push(...cftcRes2.value.data);

    const cftcMap = {
      'EURO FX': 'EURUSD',
      'EURO CURRENCY': 'EURUSD',
      'BRITISH POUND': 'GBPUSD',
      'BRITISH POUND STERLING': 'GBPUSD',
      'JAPANESE YEN': 'USDJPY',
      'CANADIAN DOLLAR': 'USDCAD',
      'AUSTRALIAN DOLLAR': 'AUDUSD',
      'NEW ZEALAND DOLLAR': 'NZDUSD',
      'NZ DOLLAR': 'NZDUSD',
      'SWISS FRANC': 'USDCHF',
      'E-MINI S&P 500': 'SP500',
      'NASDAQ-100 Consolidated': 'NASDAQ',
      'DJIA Consolidated': 'US30',
      'DOW JONES INDUSTRIAL AVG': 'US30',
      'NIKKEI STOCK AVERAGE YEN DENOM': 'NIKKEI',
      'GOLD': 'GOLD',
      'SILVER': 'SILVER',
      'COPPER-Grade #1': 'COPPER',
      'CRUDE OIL, LIGHT SWEET': 'USOIL',
      'BITCOIN': 'BITCOIN',
      'ETHER': 'ETHEREUM'
    };

    if (cftcData && cftcData.length > 0) {
      cftcData.forEach(row => {
        for (const [cftcName, assetId] of Object.entries(cftcMap)) {
          if (row.market_and_exchange_names && row.market_and_exchange_names.includes(cftcName)) {
            if (!finalBatch[assetId]) {
              const l = parseFloat(row.noncomm_positions_long_all) || 0;
              const s = parseFloat(row.noncomm_positions_short_all) || 0;
              const rL = parseFloat(row.nonreport_positions_long_all) || 0;
              const rS = parseFloat(row.nonreport_positions_short_all) || 0;

              if (l > 0 || s > 0) {
                const total = l + s;
                const iL = Math.round((l / total) * 100);
                
                const rTotal = rL + rS;
                const rLPct = rTotal > 0 ? Math.round((rL / rTotal) * 100) : 50;

                finalBatch[assetId] = { 
                  iLong: iL, 
                  iShort: 100 - iL, 
                  long: rLPct, 
                  short: 100 - rLPct,
                  source: 'Official CFTC COT' 
                };
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

    // FRED helper — returns latest numeric value
    const getFred = async (series, units = 'lin') => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${fredKey}&file_type=json&limit=2&sort_order=desc&units=${units}`;
      const r = await axios.get(url, { timeout: 15000 });
      const obs = (r.data.observations || []).filter(o => o.value !== '.');
      if (!obs.length) throw new Error('No FRED data for ' + series);
      return parseFloat(obs[0].value);
    };

    const [fedData, cpiData, nfpVal, gdpVal, y2, y10, y30, y3m] = await Promise.allSettled([
      // Fed Funds Rate — FRED (fast, reliable)
      getFred('FEDFUNDS'),
      // CPI index YoY % — FRED (direct percent change from year ago)
      getFred('CPIAUCSL', 'pc1'),
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
    const fedRate = fedData.status === 'fulfilled' ? fedData.value : null;

    // CPI YoY %
    const cpiYoY = cpiData.status === 'fulfilled' ? parseFloat(cpiData.value.toFixed(2)) : null;

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

    sourceLabel = 'BLS/FRED (Live)';
  } catch (e) {
    console.error('Macro Sync Error:', e.message);
    sourceLabel = 'Sync Error';
  }

  // AI ENGINE PURGED - 100% Institutional Data Only

  return res.status(200).json({
    success: true,
    batch:   finalBatch,
    macro:   finalMacro,
    yields:  finalYields,
    source:  sourceLabel,
    timestamp: now
  });
}
