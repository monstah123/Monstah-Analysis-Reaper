import axios from 'axios';

/**
 * Institutional COT History Engine
 * Fetches historical data for a specific asset from CFTC.gov
 */
export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const cftcMap = {
    'EURUSD': ['EURO FX', 'EURO CURRENCY'],
    'GBPUSD': ['BRITISH POUND', 'BRITISH POUND STERLING'],
    'USDJPY': ['JAPANESE YEN'],
    'USDCAD': ['CANADIAN DOLLAR'],
    'AUDUSD': ['AUSTRALIAN DOLLAR'],
    'NZDUSD': ['NEW ZEALAND DOLLAR', 'NZ DOLLAR'],
    'USDCHF': ['SWISS FRANC'],
    'SP500': ['E-MINI S&P 500', 'S&P 500 STOCK INDEX'],
    'NASDAQ': ['NASDAQ-100 Consolidated', 'NASDAQ 100 STOCK INDEX', 'E-MINI NASDAQ 100'],
    'US30': ['DJIA Consolidated', 'DOW JONES INDUSTRIAL AVG', 'DOW JONES INDUSTRIAL AVERAGE', 'E-MINI DOW JONES INDUSTRIAL AVERAGE'],
    'NIKKEI': ['NIKKEI STOCK AVERAGE YEN DENOM', 'NIKKEI 225 STOCK AVERAGE'],
    'GOLD': ['GOLD'],
    'SILVER': ['SILVER'],
    'COPPER': ['COPPER-Grade #1'],
    'USOIL': ['CRUDE OIL, LIGHT SWEET'],
    'BITCOIN': ['BITCOIN'],
    'ETHEREUM': ['ETHER']
  };

  const cftcNames = cftcMap[symbol.toUpperCase()];
  if (!cftcNames) return res.status(404).json({ success: false, error: 'Symbol not mapped for COT history' });

  try {
    // Fetch a large batch of recent records from both datasets
    const [res1, res2] = await Promise.allSettled([
      axios.get('https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$limit=2000&$order=report_date_as_yyyy_mm_dd DESC', { timeout: 15000 }),
      axios.get('https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=2000&$order=report_date_as_yyyy_mm_dd DESC', { timeout: 15000 })
    ]);

    let rawData = [];
    if (res1.status === 'fulfilled' && res1.value?.data) rawData.push(...res1.value.data);
    if (res2.status === 'fulfilled' && res2.value?.data) rawData.push(...res2.value.data);

    // Filter for the requested symbol's market names in JS (more robust than SoQL)
    const filtered = rawData.filter(row => 
      row.market_and_exchange_names && 
      cftcNames.some(name => row.market_and_exchange_names.includes(name))
    );

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.report_date_as_yyyy_mm_dd).getTime() - new Date(a.report_date_as_yyyy_mm_dd).getTime());

    // Deduplicate dates
    const seenDates = new Set();
    const history = filtered.filter(row => {
      const date = row.report_date_as_yyyy_mm_dd.split('T')[0];
      if (seenDates.has(date)) return false;
      seenDates.add(date);
      return true;
    }).map((row, index, arr) => {
      const long = parseFloat(row.noncomm_positions_long_all) || 0;
      const short = parseFloat(row.noncomm_positions_short_all) || 0;
      const total = long + short;
      const longPct = total > 0 ? (long / total) * 100 : 50;
      
      const nextRow = arr[index + 1];
      let deltaLong = 0;
      let deltaShort = 0;
      if (nextRow) {
        deltaLong = long - (parseFloat(nextRow.noncomm_positions_long_all) || 0);
        deltaShort = short - (parseFloat(nextRow.noncomm_positions_short_all) || 0);
      }

      return {
        date: row.report_date_as_yyyy_mm_dd.split('T')[0],
        long,
        short,
        longPct,
        shortPct: 100 - longPct,
        netPosition: long - short,
        deltaLong,
        deltaShort,
        netChangePct: nextRow ? longPct - ( (parseFloat(nextRow.noncomm_positions_long_all) || 0) / ( (parseFloat(nextRow.noncomm_positions_long_all) || 0) + (parseFloat(nextRow.noncomm_positions_short_all) || 0) ) * 100 ) : 0
      };
    });

    res.status(200).json({ success: true, symbol, history });
  } catch (error) {
    console.error('[COT History API] Error:', error.message);
    res.status(500).json({ success: false, error: 'Institutional Feed (CFTC) Failure' });
  }
}
