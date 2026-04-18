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
    // We query both datasets to be safe, filtering by market names
    const namesQuery = cftcNames.map(n => `market_and_exchange_names='${n}'`).join(' OR ');
    
    // TFF report for financials/currencies (dea3-kfc2)
    // Disaggregated for commodities/crypto (6dca-aqww)
    const [res1, res2] = await Promise.allSettled([
      axios.get(`https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$where=(${namesQuery})&$limit=52&$order=report_date_as_yyyy_mm_dd DESC`),
      axios.get(`https://publicreporting.cftc.gov/resource/6dca-aqww.json?$where=(${namesQuery})&$limit=52&$order=report_date_as_yyyy_mm_dd DESC`)
    ]);

    let rawData = [];
    if (res1.status === 'fulfilled') rawData.push(...res1.value.data);
    if (res2.status === 'fulfilled') rawData.push(...res2.value.data);

    // Sort by date descending
    rawData.sort((a, b) => new Date(b.report_date_as_yyyy_mm_dd).getTime() - new Date(a.report_date_as_yyyy_mm_dd).getTime());

    // Deduplicate dates (in case an asset appears in both datasets or has multiple entries)
    const seenDates = new Set();
    const history = rawData.filter(row => {
      if (seenDates.has(row.report_date_as_yyyy_mm_dd)) return false;
      seenDates.add(row.report_date_as_yyyy_mm_dd);
      return true;
    }).map((row, index, arr) => {
      const long = parseFloat(row.noncomm_positions_long_all) || 0;
      const short = parseFloat(row.noncomm_positions_short_all) || 0;
      const total = long + short;
      const longPct = total > 0 ? (long / total) * 100 : 50;
      
      // Calculate delta from previous week
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
