import axios from 'axios';

/**
 * Institutional Sentiment Aggregator 2.0
 * Merges COT positioning with Macro data
 * NO MOCKUP ALLOWED
 */
export default async function handler(req, res) {
    try {
        const cftcMap = {
            'US30': 'DJIA Consolidated',
            'SP500': 'E-MINI S&P 500',
            'NASDAQ': 'NASDAQ-100 Consolidated',
            'DAX': 'DAX-40 STOCK INDEX',
            'GOLD': 'GOLD',
            'SILVER': 'SILVER',
            'COPPER': 'COPPER-Grade #1',
            'USOIL': 'CRUDE OIL, LIGHT SWEET',
            'UKOIL': 'CRUDE OIL, LIGHT SWEET',
            'EURUSD': 'EURO FX',
            'GBPUSD': 'BRITISH POUND',
            'USDJPY': 'JAPANESE YEN',
            'AUDUSD': 'AUSTRALIAN DOLLAR',
            'USDCAD': 'CANADIAN DOLLAR',
            'USDCHF': 'SWISS FRANC',
            'NZDUSD': 'NEW ZEALAND DOLLAR',
            'BITCOIN': 'BITCOIN',
            'ETHEREUM': 'ETHER'
        };

        const INVERTED_COT_PAIRS = new Set(['USDJPY', 'USDCAD', 'USDCHF']);

        // Fetch COT data from the Volume-Prioritized handler or direct
        const cotUrl = `https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$limit=1000&$order=report_date_as_yyyy_mm_dd DESC`;
        const cotRes = await axios.get(cotUrl, { timeout: 10000 });
        const cotData = cotRes.data;

        const results = {};
        for (const [assetId, cftcName] of Object.entries(cftcMap)) {
            const matches = cotData.filter(row => row.market_and_exchange_names?.includes(cftcName));
            
            // Pick highest volume report for that asset
            const match = matches.sort((a, b) => {
                const volA = parseFloat(a.noncomm_positions_long_all || a.asset_mgr_positions_long_all || 0);
                const volB = parseFloat(b.noncomm_positions_long_all || b.asset_mgr_positions_long_all || 0);
                return volB - volA;
            })[0];

            if (match) {
                const ncLong = parseFloat(match.noncomm_positions_long_all || match.asset_mgr_positions_long_all || match.lev_money_positions_long_all) || 0;
                const ncShort = parseFloat(match.noncomm_positions_short_all || match.asset_mgr_positions_short_all || match.lev_money_positions_short_all) || 0;
                const total = ncLong + ncShort;
                const rawLongPct = total > 0 ? (ncLong / total) * 100 : 50;
                
                const longPct = INVERTED_COT_PAIRS.has(assetId) ? 100 - rawLongPct : rawLongPct;
                
                results[assetId] = {
                    longPct: +longPct.toFixed(1),
                    shortPct: +(100 - longPct).toFixed(1),
                    contractsLong: ncLong,
                    contractsShort: ncShort,
                    source: 'CFTC Institutional'
                };
            } else {
                results[assetId] = { longPct: 50, shortPct: 50, source: 'Sentiment Neutral (No Recent Report)' };
            }
        }

        res.status(200).json({ success: true, sentiment: results });
    } catch (error) {
        console.error('[Sentiment API] Error:', error.message);
        res.status(500).json({ success: false, error: 'Feed Failure' });
    }
}
