
import axios from 'axios';

/**
 * Institutional Yield Curve Engine (FRED Proxy)
 * Fetches real-time US Treasury spreads (The #1 Recession Indicator).
 * Requires VITE_FRED_KEY.
 */
export default async function handler(req, res) {
  const apiKey = process.env.VITE_FRED_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ success: false, error: 'FRED Key Missing' });
  }

  try {
    const series = ['T10Y2Y', 'T10Y3M', 'DGS10', 'DGS2', 'DGS30'];
    const results = {};

    await Promise.all(series.map(async (sId) => {
       try {
         const response = await axios.get(`https://api.stlouisfed.org/fred/series/observations`, {
           params: {
             series_id: sId,
             api_key: apiKey,
             file_type: 'json',
             sort_order: 'desc',
             limit: 1
           }
         });
         
         const obs = response.data.observations?.[0];
         if (obs) {
           results[sId] = {
             value: parseFloat(obs.value).toFixed(2),
             date: obs.date
           };
         }
       } catch (innerE) {
         console.warn(`[Yield API] Failed series ${sId}:`, innerE.message);
       }
    }));

    res.status(200).json({ 
      success: true, 
      spreads: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'FRED Link Timed Out' });
  }
}
