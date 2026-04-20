import axios from 'axios';

/**
 * Institutional COT History Engine 3.0 (Volume-Prioritized)
 * Fetches deep historical data for a specific asset from CFTC.gov
 * Prioritizes high-volume reports to ensure data authenticity.
 */
export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const cftcMap = {
    'EURUSD': ['EURO FX', 'CHICAGO MERCANTILE EXCHANGE'],
    'GBPUSD': ['BRITISH POUND', 'CHICAGO MERCANTILE EXCHANGE'],
    'USDJPY': ['JAPANESE YEN', 'CHICAGO MERCANTILE EXCHANGE'],
    'USDCAD': ['CANADIAN DOLLAR', 'CHICAGO MERCANTILE EXCHANGE'],
    'AUDUSD': ['AUSTRALIAN DOLLAR', 'CHICAGO MERCANTILE EXCHANGE'],
    'NZDUSD': ['NEW ZEALAND DOLLAR', 'CHICAGO MERCANTILE EXCHANGE'],
    'USDCHF': ['SWISS FRANC', 'CHICAGO MERCANTILE EXCHANGE'],
    'SP500': ['E-MINI S&P 500', 'CHICAGO MERCANTILE EXCHANGE'],
    'NASDAQ': ['E-MINI NASDAQ-100', 'CHICAGO MERCANTILE EXCHANGE'],
    'US30': ['E-MINI DOW JONES', 'CHICAGO BOARD OF TRADE'],
    'NIKKEI': ['NIKKEI 225', 'CHICAGO MERCANTILE EXCHANGE'],
    'DAX': ['E-MINI DAX', 'CHICAGO MERCANTILE EXCHANGE'],
    'GOLD': ['GOLD', 'COMMODITY EXCHANGE'],
    'SILVER': ['SILVER', 'COMMODITY EXCHANGE'],
    'COPPER': ['COPPER-GRADE #1', 'COMMODITY EXCHANGE'],
    'USOIL': ['CRUDE OIL, LIGHT SWEET', 'NEW YORK MERCANTILE EXCHANGE'],
    'UKOIL': ['BRENT', 'ICE FUTURES EUROPE'],
    'BITCOIN': ['BITCOIN', 'CHICAGO MERCANTILE EXCHANGE'],
    'ETHEREUM': ['ETHER', 'CHICAGO MERCANTILE EXCHANGE']
  };

  const cftcNames = cftcMap[symbol.toUpperCase()];
  if (!cftcNames) return res.status(404).json({ success: false, error: 'Symbol not mapped for COT history' });

  try {
    const nameFilter = cftcNames.map(n => `market_and_exchange_names LIKE '%${n}%'`).join(' AND ');
    const query = `$limit=5000&$where=(${encodeURIComponent(nameFilter)})&$order=report_date_as_yyyy_mm_dd DESC`;

    const [res1, res2, res3] = await Promise.allSettled([
      axios.get(`https://publicreporting.cftc.gov/resource/6dca-aqww.json?${query}`, { timeout: 15000 }),
      axios.get(`https://publicreporting.cftc.gov/resource/dea3-kfc2.json?${query}`, { timeout: 15000 }),
      axios.get(`https://publicreporting.cftc.gov/resource/gpe5-46if.json?${query}`, { timeout: 15000 })
    ]);

    let rawData = [];
    if (res1.status === 'fulfilled' && res1.value?.data) rawData.push(...res1.value.data);
    if (res2.status === 'fulfilled' && res2.value?.data) rawData.push(...res2.value.data);
    if (res3.status === 'fulfilled' && res3.value?.data) rawData.push(...res3.value.data);

    const filtered = rawData.filter(row => 
      row.market_and_exchange_names && 
      cftcNames.some(name => row.market_and_exchange_names.includes(name))
    );

    // Group by date and pick the one with the highest speculative volume to avoid "empty" secondary reports
    const groupedByDate = filtered.reduce((acc, row) => {
      const date = row.report_date_as_yyyy_mm_dd.split('T')[0];
      const currentVol = parseFloat(row.asset_mgr_positions_long_all || row.asset_mgr_positions_long || row.noncomm_positions_long_all || row.lev_money_positions_long_all || row.lev_money_positions_long || 0);
      
      if (!acc[date] || currentVol > acc[date].vol) {
        acc[date] = { row, vol: currentVol };
      }
      return acc;
    }, {});

    const history = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => {
        const row = groupedByDate[date].row;
        const index = Object.keys(groupedByDate).indexOf(date);
        const arr = Object.values(groupedByDate).map(v => v.row);

        const ncLong = parseFloat(row.asset_mgr_positions_long_all || row.asset_mgr_positions_long || row.noncomm_positions_long_all || row.lev_money_positions_long_all || row.lev_money_positions_long) || 0;
        const ncShort = parseFloat(row.asset_mgr_positions_short_all || row.asset_mgr_positions_short || row.noncomm_positions_short_all || row.lev_money_positions_short_all || row.lev_money_positions_short) || 0;
        const cLong = parseFloat(row.comm_positions_long_all || row.comm_positions_long || row.dealer_positions_long_all || row.dealer_positions_long) || 0;
        const cShort = parseFloat(row.comm_positions_short_all || row.comm_positions_short || row.dealer_positions_short_all || row.dealer_positions_short) || 0;
        
        const total = ncLong + ncShort;
        let longPct = total > 0 ? (ncLong / total) * 100 : 50;
        let shortPct = 100 - longPct;

        // Inversion Logic for USD-Quote pairs (Fixed Friday Pulse)
        if (['USDJPY', 'USDCHF', 'USDCAD'].includes(symbol.toUpperCase())) {
          [longPct, shortPct] = [shortPct, longPct];
        }
        
        const nextDate = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[index + 1];
        const nextRow = nextDate ? groupedByDate[nextDate].row : null;

        let deltaLong = 0;
        let deltaShort = 0;
        let prevLongPct = 50;
        
        if (nextRow) {
          const nL = parseFloat(nextRow.asset_mgr_positions_long_all || nextRow.asset_mgr_positions_long || nextRow.noncomm_positions_long_all || nextRow.lev_money_positions_long_all || nextRow.lev_money_positions_long) || 0;
          const nS = parseFloat(nextRow.asset_mgr_positions_short_all || nextRow.asset_mgr_positions_short || nextRow.noncomm_positions_short_all || nextRow.lev_money_positions_short_all || nextRow.lev_money_positions_short) || 0;
          deltaLong = ncLong - nL;
          deltaShort = ncShort - nS;
          const nTotal = nL + nS;
          if (nTotal > 0) {
            let pLP = (nL / nTotal) * 100;
            let pSP = 100 - pLP;
            if (['USDJPY', 'USDCHF', 'USDCAD'].includes(symbol.toUpperCase())) {
              [pLP, pSP] = [pSP, pLP];
            }
            prevLongPct = pLP;
          }
        }

        return {
          date,
          long: ncLong,
          short: ncShort,
          nonCommLong: ncLong,
          nonCommShort: ncShort,
          commLong: cLong,
          commShort: cShort,
          longPct,
          shortPct,
          netPosition: longPct > 50 ? (ncLong - ncShort) : (ncShort - ncLong), // Directional Net
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
