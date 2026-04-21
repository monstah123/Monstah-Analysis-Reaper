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
                const where = keywords.map(k => `upper(market_and_exchange_names) like '%25${k.toUpperCase().replace(/ /g, '%20').replace(/&/g, '%26')}%25'`).join(' or ');
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
        const allKeywords = [...financialKeywords, ...commodityKeywords];

        const [financials, legacy, physical, disaggAll, disaggFut] = await Promise.all([
            fetchTargeted('udgc-27he', financialKeywords), // TFF (Financial Futures)
            fetchTargeted('srt6-5q2f', allKeywords),       // Legacy (speculator flow)
            fetchTargeted('kh3c-gbw2', commodityKeywords),  // Disagg Physical (BRENT/WTI)
            fetchTargeted('rxbv-e226', allKeywords),       // Disaggregated All (Mixed Flow)
            fetchTargeted('72hh-3qpy', allKeywords)        // Disaggregated Futures Only (Pure Flow)
        ]);

        const rawData = [...financials, ...legacy, ...physical, ...disaggAll, ...disaggFut];

        const [resGdp, resCpi, resFed, resNfp, resY2, resY10, resY30, resY3M] = await Promise.allSettled([
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=PAYEMS&api_key=${fredKey}&file_type=json&sort_order=desc&limit=12`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS2&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS30&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`)
        ]);

        const results = {};
        
        for (const [assetId, config] of Object.entries(ASSET_REGISTER)) {
            let matches = rawData.filter(row => {
                const name = (row.market_and_exchange_names || row.market_name || row.contract_market_name || '').toUpperCase();
                return config.id.some(idPart => name.includes(idPart.toUpperCase()));
            });

            // --- Cross-Rate Exclusion (Surgical Filter) ---
            // For standalone currency pairs (e.g., GBPUSD searching for 'BRITISH POUND'),
            // exclude XRATE cross-rate contracts like 'EURO FX/BRITISH POUND XRATE'
            // which contaminate the data with unrelated cross positioning.
            if (config.category === 'Currency') {
                const standalone = matches.filter(row => {
                    const name = (row.market_and_exchange_names || '').toUpperCase();
                    return !name.includes('XRATE') && !name.includes('X-RATE') && !name.includes('/');
                });
                if (standalone.length > 0) matches = standalone;
            }

            // --- Micro Contract Deprioritization ---
            // For indices, prefer Consolidated or full-size contracts over Micro
            // since Micro contracts often report zeros for asset_mgr positions.
            if (config.category === 'Indices') {
                const fullSize = matches.filter(row => {
                    const name = (row.market_and_exchange_names || '').toUpperCase();
                    return !name.includes('MICRO');
                });
                if (fullSize.length > 0) matches = fullSize;
            }

            if (matches.length > 0) {
                // Priority Sort: 1. Date, 2. Combined/Consolidated, 3. Primary volume
                const match = matches.sort((a,b) => {
                    const dateA = new Date(a.report_date_as_yyyy_mm_dd).getTime();
                    const dateB = new Date(b.report_date_as_yyyy_mm_dd).getTime();
                    if (dateB !== dateA) return dateB - dateA;

                    // Dataset Priority Strike: Prefer modern Disaggregated or TFF reports over Legacy
                    const weightMap = {
                        '72hh-3qpy': 100, // Disagg Fut Only (High Fidelity)
                        'udgc-27he': 95,  // TFF (Financial Node)
                        'rxbv-e226': 90,  // Disagg All
                        'kh3c-gbw2': 80,  // Disagg Physical
                        'srt6-5q2f': 50   // Legacy (Fallback)
                    };
                    const weightA = weightMap[a._ds] || 0;
                    const weightB = weightMap[b._ds] || 0;
                    if (weightB !== weightA) return weightB - weightA;

                    // Prefer Consolidated reports
                    const nameA = (a.market_and_exchange_names || '').toUpperCase();
                    const nameB = (b.market_and_exchange_names || '').toUpperCase();
                    const consA = nameA.includes('CONSOLIDATED') || (a.futonly_or_combined || '').toUpperCase().includes('COMBINED');
                    const consB = nameB.includes('CONSOLIDATED') || (b.futonly_or_combined || '').toUpperCase().includes('COMBINED');
                    if (consA && !consB) return -1;
                    if (consB && !consA) return 1;

                    // Prefer higher institutional volume
                    const volA = parseInt(a.asset_mgr_positions_long || 0) + parseInt(a.asset_mgr_positions_short || 0) || parseInt(a.lev_money_positions_long || 0) || parseInt(a.noncomm_positions_long_all || 0);
                    const volB = parseInt(b.asset_mgr_positions_long || 0) + parseInt(b.asset_mgr_positions_short || 0) || parseInt(b.lev_money_positions_long || 0) || parseInt(b.noncomm_positions_long_all || 0);
                    return volB - volA;
                })[0];

                const instPatterns = ['asset_mgr', 'lev_money', 'managed_money', 'm_money', 'noncomm'];
                
                // Find the single best institutional category based on total volume
                let bestPrefix = '';
                let maxVol = -1;
                let cLong = 0;
                let cShort = 0;
                
                for (const p of instPatterns) {
                    let l = 0, s = 0;
                    for (const key of Object.keys(match)) {
                        const k = key.toLowerCase();
                        if (k.includes(p) && !k.includes('change') && !k.includes('pct') && !k.includes('spread') && !k.includes('traders') && !k.includes('_old') && !k.includes('_other')) {
                            const val = parseInt(match[key] || 0) || 0;
                            if (k.includes('long')) l = val;
                            if (k.includes('short')) s = val;
                        }
                    }
                    const vol = l + s;
                    if (vol > maxVol) {
                        maxVol = vol;
                        bestPrefix = p;
                        cLong = l;
                        cShort = s;
                    }
                }

                let long = cLong;
                let short = cShort;
                
                let changeLong = 0;
                let changeShort = 0;
                for (const key of Object.keys(match)) {
                    const k = key.toLowerCase();
                    if (k.includes(bestPrefix) && k.includes('change')) {
                        const val = parseFloat(match[key] || 0) || 0;
                        if (k.includes('long')) changeLong = val;
                        if (k.includes('short')) changeShort = val;
                    }
                }

                let total = long + short;
                let longPct = total > 0 ? (long / total) * 100 : 50;
                let shortPct = 100 - longPct;

                // Full Inversion for USD-Quote Pairs
                if (['USDJPY', 'USDCHF', 'USDCAD'].includes(assetId)) {
                    [longPct, shortPct] = [shortPct, longPct];
                    [long, short] = [short, long];
                    [changeLong, changeShort] = [changeShort, changeLong];
                }

                results[assetId] = {
                    longPct: +longPct.toFixed(1),
                    shortPct: +shortPct.toFixed(1),
                    contractsLong: long,
                    contractsShort: short,
                    changeLong: changeLong,
                    changeShort: changeShort,
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
            y30: resY30?.status === 'fulfilled' ? parseFloat(resY30.value.data.observations[0]?.value) : null,
            y3m: resY3M?.status === 'fulfilled' ? parseFloat(resY3M.value.data.observations[0]?.value) : null
        };

        res.status(200).json({ success: true, sentiment: results, macro, yields });
    } catch (error) {
        console.error('[CRITICAL]: Institutional Pipeline Burst:', error.message);
        res.status(200).json({ success: false, error: 'Institutional Pipeline Burst', detail: error.message });
    }
}
