import axios from 'axios';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    // THE INSTITUTIONAL REGISTER (v21.0 Absolute Parity)
    const ASSET_REGISTER = {
        'US30': { id: ['DJIA CONSOLIDATED', 'DJIA', 'DOW JONES'], category: 'Indices' },
        'SP500': { id: ['S&P 500', 'SPX', 'E-MINI S&P'], category: 'Indices' },
        'NASDAQ': { id: ['NASDAQ', 'NDX', 'E-MINI NASDAQ'], category: 'Indices' },
        'DAX': { id: ['DAX', 'GERMANY', 'MSCI'], category: 'Indices' },
        'NIKKEI': { id: ['NIKKEI'], category: 'Indices' },
        'GOLD': { id: ['GOLD'], category: 'Commodities' },
        'SILVER': { id: ['SILVER'], category: 'Commodities' },
        'COPPER': { id: ['COPPER'], category: 'Commodities' },
        'USOIL': { id: ['WTI', 'CRUDE OIL'], category: 'Commodities' },
        'UKOIL': { id: ['BRENT CRUDE OIL', 'BRENT'], category: 'Commodities' },
        'EURUSD': { id: ['EURO FX'], category: 'Currency' },
        'GBPUSD': { id: ['BRITISH POUND'], category: 'Currency' },
        'USDJPY': { id: ['JAPANESE YEN'], category: 'Currency' },
        'AUDUSD': { id: ['AUSTRALIAN DOLLAR'], category: 'Currency' },
        'NZDUSD': { id: ['NEW ZEALAND DOLLAR', 'NZ DOLLAR'], category: 'Currency' },
        'USDCAD': { id: ['CANADIAN DOLLAR'], category: 'Currency' },
        'USDCHF': { id: ['SWISS FRANC'], category: 'Currency' },
        'BITCOIN': { id: ['BITCOIN'], category: 'Crypto' },
        'ETHEREUM': { id: ['ETHER', 'ETHEREUM'], category: 'Crypto' }
    };

    const fredKey = process.env.FRED_KEY || process.env.VITE_FRED_KEY || '';

    try {
        const fetchTargeted = async (datasetId, keywords) => {
            try {
                const where = keywords.map(k => `upper(market_and_exchange_names) like '%25${k.toUpperCase().replace(/ /g, '%20')}%25'`).join(' or ');
                const url = `https://publicreporting.cftc.gov/resource/${datasetId}.json?$where=${where}&$limit=100&$order=report_date_as_yyyy_mm_dd DESC`;
                const response = await axios.get(url, { timeout: 9500 });
                return Array.isArray(response.data) ? response.data.map(r => ({ ...r, _ds: datasetId })) : [];
            } catch (e) {
                console.error(`[SODA FAILED] ${datasetId}:`, e.message);
                return [];
            }
        };

        // Precision Strike: Full Registry Coverage
        const financialKeywords = [
            'DJIA', 'S&P 500', 'NASDAQ', 'DAX', 'NIKKEI', 
            'EURO FX', 'BRITISH POUND', 'JAPANESE YEN', 
            'AUSTRALIAN DOLLAR', 'NEW ZEALAND DOLLAR', 'CANADIAN DOLLAR', 'SWISS FRANC',
            'GOLD', 'SILVER', 'COPPER', 'BITCOIN', 'ETHER'
        ];
        const commodityKeywords = ['BRENT', 'CRUDE OIL', 'WTI'];

        const [financials, legacy, physical] = await Promise.all([
            fetchTargeted('udgc-27he', financialKeywords), // TFF
            fetchTargeted('srt6-5q2f', financialKeywords), // Legacy
            fetchTargeted('kh3c-gbw2', commodityKeywords)  // Disagg Physical
        ]);

        const rawData = [...financials, ...legacy, ...physical];

        const [resGdp, resCpi, resFed, resNfp, resY2, resY10, resY30] = await Promise.allSettled([
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=PAYEMS&api_key=${fredKey}&file_type=json&sort_order=desc&limit=12`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS2&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS30&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`)
        ]);

        const results = {};
        
        for (const [assetId, config] of Object.entries(ASSET_REGISTER)) {
            const matches = rawData.filter(row => {
                const name = (row.market_and_exchange_names || row.market_name || row.contract_market_name || '').toUpperCase();
                return config.id.some(idPart => name.includes(idPart.toUpperCase()));
            });

            if (matches.length > 0) {
                // Priority Sort: 1. Date, 2. Combined Coverage, 3. Relevance
                const match = matches.sort((a,b) => {
                    const dateA = new Date(a.report_date_as_yyyy_mm_dd).getTime();
                    const dateB = new Date(b.report_date_as_yyyy_mm_dd).getTime();
                    if (dateB !== dateA) return dateB - dateA;

                    const typeA = (a.futonly_or_combined || '').toUpperCase();
                    const typeB = (b.futonly_or_combined || '').toUpperCase();
                    if (typeA.includes('COMBINED') && !typeB.includes('COMBINED')) return -1;
                    if (typeB.includes('COMBINED') && !typeA.includes('COMBINED')) return 1;

                    return (a.market_and_exchange_names || '').length - (b.market_and_exchange_names || '').length;
                })[0];

                const getVal = (patterns, direction) => {
                    let maxVal = 0;
                    for (const p of patterns) {
                        for (const key of Object.keys(match)) {
                            const k = key.toLowerCase();
                            if (k.includes(p) && k.includes(direction)) {
                                if (k.includes('change') || k.includes('pct') || k.includes('spread')) continue;
                                const val = parseInt(match[key] || 0);
                                if (!isNaN(val) && val > maxVal) maxVal = val;
                            }
                        }
                    }
                    return maxVal;
                };

                const instPatterns = ['asset_mgr', 'm_money', 'managed_money', 'lev_money', 'noncomm'];
                const long = getVal(instPatterns, 'long');
                const short = getVal(instPatterns, 'short');
                
                const total = long + short;
                let longPct = total > 0 ? (long / total) * 100 : 50;
                let shortPct = 100 - longPct;

                if (['USDJPY', 'USDCHF', 'USDCAD'].includes(assetId)) {
                    [longPct, shortPct] = [shortPct, longPct];
                }

                results[assetId] = {
                    longPct: +longPct.toFixed(1),
                    shortPct: +shortPct.toFixed(1),
                    contractsLong: long,
                    contractsShort: short,
                    changeLong: parseFloat(match.change_in_noncomm_long_all || match.change_in_lev_money_long_all || match.change_in_asset_mgr_long || 0),
                    changeShort: parseFloat(match.change_in_noncomm_short_all || match.change_in_lev_money_short_all || match.change_in_asset_mgr_short || 0),
                    source: `CFTC ${match._ds} (${match.report_date_as_yyyy_mm_dd?.split('T')[0] || 'Recent'})`
                };
            }
        }

        // Final Synthesis for GBP/JPY Cross
        const gbp = results['GBPUSD'];
        const jpy = results['USDJPY'];
        if (gbp && jpy) {
            results['GBPJPY'] = {
                longPct: +((gbp.longPct + jpy.longPct) / 2).toFixed(1),
                shortPct: +((gbp.shortPct + jpy.shortPct) / 2).toFixed(1),
                source: 'Institutional Cross Synthesis'
            };
        }

        const macro = {
            GDP: resGdp.status === 'fulfilled' ? parseFloat(resGdp.value.data.observations[0]?.value) : null,
            CPI: resCpi.status === 'fulfilled' ? parseFloat(resCpi.value.data.observations[0]?.value) : null,
            FedRate: resFed.status === 'fulfilled' ? parseFloat(resFed.value.data.observations[0]?.value) : null,
            NFP: resNfp.status === 'fulfilled' && resNfp.value.data.observations.length > 1 
                ? (parseFloat(resNfp.value.data.observations[0].value) - parseFloat(resNfp.value.data.observations[1].value)) * 1000
                : null
        };

        const yields = {
            y2: resY2?.status === 'fulfilled' ? parseFloat(resY2.value.data.observations[0]?.value) : null,
            y10: resY10?.status === 'fulfilled' ? parseFloat(resY10.value.data.observations[0]?.value) : null,
            y30: resY30?.status === 'fulfilled' ? parseFloat(resY30.value.data.observations[0]?.value) : null
        };

        res.status(200).json({ success: true, sentiment: results, macro, yields });
    } catch (error) {
        console.error('[CRITICAL]: Institutional Pipeline Burst:', error.message);
        res.status(200).json({ success: false, error: 'Institutional Pipeline Burst', detail: error.message });
    }
}
