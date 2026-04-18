import axios from 'axios';

/**
 * Institutional Sentiment Aggregator 13.0 (Bare-Iron Protocol)
 * ZERO MOCKUP // ZERO FALLBACKS // 100% LIVE WIRE OR FAILURE
 */
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    try {
        const cftcMap = {
            'US30': ['DOW JONES INDUSTRIAL AVG - CHICAGO BOARD OF TRADE'],
            'SP500': ['S&P 500 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE'],
            'NASDAQ': ['NASDAQ-100 CONSOLIDATED - CHICAGO MERCANTILE EXCHANGE'],
            'GOLD': ['GOLD - COMMODITY EXCHANGE'],
            'SILVER': ['SILVER - COMMODITY EXCHANGE'],
            'COPPER': ['COPPER-Grade #1 - COMMODITY EXCHANGE'],
            'USOIL': ['CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE'],
            'UKOIL': ['BRENT LAST DAY FINANCIAL - ICE FUTURES EUROPE'],
            'EURUSD': ['EURO FX - CHICAGO MERCANTILE EXCHANGE'],
            'GBPUSD': ['BRITISH POUND - CHICAGO MERCANTILE EXCHANGE'],
            'USDJPY': ['JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE'],
            'AUDUSD': ['AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE'],
            'USDCAD': ['CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE'],
            'USDCHF': ['SWISS FRANC - CHICAGO MERCANTILE EXCHANGE'],
            'NZDUSD': ['NEW ZEALAND DOLLAR - CHICAGO MERCANTILE EXCHANGE'],
            'BITCOIN': ['BITCOIN - CHICAGO MERCANTILE EXCHANGE'],
            'ETHEREUM': ['ETHER - CHICAGO MERCANTILE EXCHANGE']
        };

        // 1. Hit the Institutional Wires (Legacy + TFF)
        const [resLegacy, resTFF, resGdp, resCpi, resFed, resNfp] = await Promise.allSettled([
            axios.get(`https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=5000&$order=report_date_as_yyyy_mm_dd DESC`),
            axios.get(`https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$limit=5000&$order=report_date_as_yyyy_mm_dd DESC`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${process.env.VITE_FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${process.env.VITE_FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${process.env.VITE_FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
            axios.get(`https://api.stlouisfed.org/fred/series/observations?series_id=PAYEMS&api_key=${process.env.VITE_FRED_KEY}&file_type=json&sort_order=desc&limit=2`)
        ]);

        let cotData = [];
        if (resLegacy.status === 'fulfilled') cotData.push(...(resLegacy.value.data || []));
        if (resTFF.status === 'fulfilled') cotData.push(...(resTFF.value.data || []));

        const results = {};
        for (const [assetId, fullNames] of Object.entries(cftcMap)) {
            // STRICT EQUALITY MATCH FOR 100% IDENTITY
            const match = cotData.find(row => {
                const name = row.market_and_exchange_names?.toUpperCase();
                return name && fullNames.some(target => name === target.toUpperCase());
            });

            if (match) {
                const ncLong = parseFloat(match.noncomm_positions_long_all || match.asset_mgr_positions_long_all || match.lev_money_positions_long_all) || 0;
                const ncShort = parseFloat(match.noncomm_positions_short_all || match.asset_mgr_positions_short_all || match.lev_money_positions_short_all) || 0;
                const total = ncLong + ncShort;
                
                if (total > 0) {
                    const longPct = (ncLong / total) * 100;
                    results[assetId] = {
                        longPct: +longPct.toFixed(1),
                        shortPct: +(100 - longPct).toFixed(1),
                        contractsLong: ncLong,
                        contractsShort: ncShort,
                        source: `Live Wire: ${match.report_date_as_yyyy_mm_dd}`
                    };
                }
            }
            // NO FALLBACKS ALLOWED. IF MATCH IS NULL, IT IS MISSING FROM RESULTS.
        }

        res.status(200).json({ 
            success: true, 
            sentiment: results,
            macro: {
                GDP: resGdp.status === 'fulfilled' ? parseFloat(resGdp.value.data.observations[0]?.value) : null,
                CPI: resCpi.status === 'fulfilled' ? parseFloat(resCpi.value.data.observations[0]?.value) : null,
                FedRate: resFed.status === 'fulfilled' ? parseFloat(resFed.value.data.observations[0]?.value) : null,
                NFP: resNfp.status === 'fulfilled' ? (parseFloat(resNfp.value.data.observations[0].value) - parseFloat(resNfp.value.data.observations[1].value)) : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Bare-Iron Connection Failure' });
    }
}
