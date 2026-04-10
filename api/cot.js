
import axios from 'axios';

/**
 * Institutional COT (Commitment of Traders) Engine
 * Fetches the raw 'Financial' TFF report directly from CFTC.gov
 * This is the purest source of institutional (Leveraged Funds) positioning.
 */
export default async function handler(req, res) {
  try {
    // 1. Fetch live report from government servers (TFF report for Forex)
    const response = await axios.get('https://www.cftc.gov/dea/newcot/FinFut.txt', {
       timeout: 5000,
       headers: { 'User-Agent': 'Monstah-Analysis-Reaper/1.0' }
    });
    const txt = response.data;

    // 2. Parser Logic: Find Asset Blocks and Extract Speculative Longs/Shorts
    // We map the CFTC names to our frontend IDs
    const mappings = [
      { id: 'EURUSD', name: 'EURO CURRENCY' },
      { id: 'GBPUSD', name: 'BRITISH POUND' },
      { id: 'USDJPY', name: 'JAPANESE YEN' },
      { id: 'AUDUSD', name: 'AUSTRALIAN DOLLAR' },
      { id: 'USDCAD', name: 'CANADIAN DOLLAR' },
      { id: 'NZDUSD', name: 'NZ DOLLAR' },
      { id: 'SP500', name: 'S&P 500 STOCK INDEX' },
      { id: 'NASDAQ', name: 'NASDAQ 100 STOCK INDEX' },
      { id: 'DOW', name: 'DOW JONES INDUSTRIAL' }
    ];

    const results = {};

    mappings.forEach(m => {
       const uName = m.name.toUpperCase();
       const assetIndex = txt.toUpperCase().indexOf(uName);
       if (assetIndex !== -1) {
          const block = txt.substring(assetIndex, assetIndex + 2000);
          const lines = block.split('\n');
          
          // TFF Report (Financial) - Find the row that starts with 'Positions' (Case Insensitive)
          const posRow = lines.find(l => l.trim().toUpperCase().startsWith('POSITIONS'));
          if (posRow) {
             // Columns in TFF (approx): [POSITIONS] [OI] [AssetMgr L] [S] [LevFunds L] [S]
             // We need columns 4 and 5 (0-indexed: 4 and 5 if 1 is OI)
             const cols = posRow.trim().split(/\s+/);
             if (cols.length >= 6) {
                results[m.id] = {
                   long: parseInt(cols[4].replace(/,/g, '')),
                   short: parseInt(cols[5].replace(/,/g, '')),
                   source: 'CFTC TFF Report'
                };
             }
          }
       }
    });

    // 3. Fallback for commodities (Legacy Report) - GOLD, USOIL, UKOIL
    if (!results.GOLD || !results.USOIL || !results.UKOIL) {
       try {
          const legacyRes = await axios.get('https://www.cftc.gov/dea/newcot/deafut.txt', { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0' }
          });
          const ltxt = legacyRes.data;
          
          const parseLegacy = (assetName, retKey) => {
             const idx = ltxt.toUpperCase().indexOf(assetName);
             if (idx !== -1) {
                const block = ltxt.substring(idx, idx + 1500);
                const ncRow = block.split('\n').find(l => l.trim().toUpperCase().startsWith('NON-COMMERCIAL'));
                if (ncRow) {
                   const cols = ncRow.trim().split(/\s+/);
                   if (cols.length >= 3) {
                      results[retKey] = {
                         long: parseInt(cols[1].replace(/,/g, '')),
                         short: parseInt(cols[2].replace(/,/g, '')),
                         source: 'CFTC Legacy Report'
                      };
                   }
                }
             }
          };

          parseLegacy('GOLD', 'GOLD');
          parseLegacy('CRUDE OIL, LIGHT SWEET', 'USOIL');
          parseLegacy('BRENT CRUDE', 'UKOIL');

       } catch (e) {}
    }

    res.status(200).json({ success: true, cot: results });
  } catch (error) {
    console.error('[COT API] Error:', error.message);
    res.status(200).json({ success: false, error: 'Institutional Feed (CFTC) Timed Out or Blocked' });
  }
}
