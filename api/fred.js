import axios from 'axios';

// Reaper 12.0 - FRED Proxy
// NO FAKE FALLBACKS — if FRED fails, return error so UI shows null/syncing
// not stale hardcoded numbers

export default async function handler(req, res) {
  const { series_id, limit = 2, units = 'lin' } = req.query;
  const apiKey = process.env.FRED_KEY || 'a511ff61c8ca4177e733079ebec436d3';

  if (!series_id) {
    return res.status(400).json({ error: 'Missing series_id' });
  }

  try {
    const response = await axios.get(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}&units=${units}`,
      { timeout: 15000 }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`[FRED] Error fetching ${series_id}:`, error.message);
    // Return a real error — do NOT return fake data
    // The frontend reads null and shows "SYNC..." which is honest
    return res.status(503).json({ error: `FRED unavailable: ${error.message}`, series_id });
  }
}
