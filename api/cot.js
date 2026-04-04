
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
      { id: 'GOLD', name: 'GOLD' },
      { id: 'SP500', name: 'S&P 500' },
      { id: 'NASDAQ', name: 'NASDAQ 100' },
      { id: 'DOW', name: 'DJIA' }
    ];

    const results = {};

    mappings.forEach(m => {
       const assetIndex = txt.indexOf(m.name);
       if (assetIndex !== -1) {
          // Extract a 1000-char block around the asset name to find the "Leverage Funds" section
          const block = txt.substring(assetIndex, assetIndex + 1500);
          
          // The report format has headers "Leveraged Funds" and columns for Long/Short
          // We look for the "Leveraged Funds" row numbers
          // Format sample: Leveraged Funds       123,456  23,456
          const leveragedRegex = /Leveraged Funds\s+([\d,]+)\s+([\d,]+)/;
          const match = block.match(leveragedRegex);
          
          if (match) {
             results[m.id] = {
                long: parseInt(match[1].replace(/,/g, '')),
                short: parseInt(match[2].replace(/,/g, '')),
                source: 'CFTC TFF Report'
             };
          }
       }
    });

    // 3. Fallback for commodities (Legacy Report) if TFF doesn't have it
    if (!results.GOLD) {
       const legacyRes = await axios.get('https://www.cftc.gov/dea/newcot/deafut.txt', { timeout: 5000 });
       const ltxt = legacyRes.data;
       const goldIdx = ltxt.indexOf('GOLD');
       if (goldIdx !== -1) {
          const gBlock = ltxt.substring(goldIdx, goldIdx + 1000);
          // Look for Non-Commercial row
          const gMatch = gBlock.match(/Non-Commercial\s+([\d,]+)\s+([\d,]+)/);
          if (gMatch) {
             results.GOLD = {
                long: parseInt(gMatch[1].replace(/,/g, '')),
                short: parseInt(gMatch[2].replace(/,/g, '')),
                source: 'CFTC Legacy Report'
             };
          }
       }
    }

    res.status(200).json({ success: true, cot: results });
  } catch (error) {
    console.error('[COT API] Error:', error.message);
    res.status(500).json({ success: false, error: 'Institutional Feed (CFTC) Timed Out' });
  }
}
