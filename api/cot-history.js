import axios from 'axios';

/**
 * Institutional COT History Engine 2.0
 * Fetches deep historical data for a specific asset from CFTC.gov
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
    // Create SoQL multi-market filter for the symbol
    const nameFilter = cftcNames.map(n => `market_and_exchange_names LIKE '%${n}%'`).join(' OR ');
    const query = `$limit=5000&$where=(${encodeURIComponent(nameFilter)})&$order=report_date_as_yyyy_mm_dd DESC`;

    // Fetch from BOTH datasets with the specific symbol filter to ensure depth
    const [res1, res2] = await Promise.allSettled([
      axios.get(`https://publicreporting.cftc.gov/resource/6dca-aqww.json?${query}`, { timeout: 15000 }),
      axios.get(`https://publicreporting.cftc.gov/resource/dea3-kfc2.json?${query}`, { timeout: 15000 })
    ]);

    let rawData = [];
    if (res1.status === 'fulfilled' && res1.value?.data) rawData.push(...res1.value.data);
    if (res2.status === 'fulfilled' && res2.value?.data) rawData.push(...res2.value.data);

    // Filter to ensure exact matches
    const filtered = rawData.filter(row => 
      row.market_and_exchange_names && 
      cftcNames.some(name => row.market_and_exchange_names.includes(name))
    );

    filtered.sort((a, b) => new Date(b.report_date_as_yyyy_mm_dd).getTime() - new Date(a.report_date_as_yyyy_mm_dd).getTime());

    const seenDates = new Set();
    const history = filtered.filter(row => {
      const date = row.report_date_as_yyyy_mm_dd.split('T')[0];
      if (seenDates.has(date)) return false;
      seenDates.add(date);
      return true;
    }).map((row, index, arr) => {
      const ncLong = parseFloat(row.noncomm_positions_long_all || row.asset_mgr_positions_long_all || row.lev_money_positions_long_all) || 0;
      const ncShort = parseFloat(row.noncomm_positions_short_all || row.asset_mgr_positions_short_all || row.lev_money_positions_short_all) || 0;
      const cLong = parseFloat(row.comm_positions_long_all || row.dealer_positions_long_all) || 0;
      const cShort = parseFloat(row.comm_positions_short_all || row.dealer_positions_short_all) || 0;
      
      const total = ncLong + ncShort;
      const longPct = total > 0 ? (ncLong / total) * 100 : 50;
      
      const nextRow = arr[index + 1];
      let deltaLong = 0;
      let deltaShort = 0;
      let prevLongPct = 50;
      
      if (nextRow) {
        const nL = parseFloat(nextRow.noncomm_positions_long_all || nextRow.asset_mgr_positions_long_all || nextRow.lev_money_positions_long_all) || 0;
        const nS = parseFloat(nextRow.noncomm_positions_short_all || nextRow.asset_mgr_positions_short_all || nextRow.lev_money_positions_short_all) || 0;
        deltaLong = ncLong - nL;
        deltaShort = ncShort - nS;
        const nTotal = nL + nS;
        if (nTotal > 0) prevLongPct = (nL / nTotal) * 100;
      }

      return {
        date: row.report_date_as_yyyy_mm_dd.split('T')[0],
        long: ncLong,
        short: ncShort,
        nonCommLong: ncLong,
        nonCommShort: ncShort,
        commLong: cLong,
        commShort: cShort,
        longPct,
        shortPct: 100 - longPct,
        netPosition: ncLong - ncShort,
        deltaLong,
        deltaShort,
        netChangePct: longPct - prevLongPct
      };
    });

    res.status(200).json({ success: true, symbol, history });
  } catch (error) {
    console.error('[COT History API] Error:', error.message);
    res.status(500).json({ success: false, error: 'Institutional Feed (CFTC) Failure' });
  }
}
