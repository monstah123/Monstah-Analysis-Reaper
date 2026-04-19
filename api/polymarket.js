import axios from 'axios';

export default async function handler(req, res) {
  try {
    const url = 'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=60';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[Polymarket API Error]:', error.message);
    return res.status(500).json({ error: 'Failed to fetch Polymarket data' });
  }
}
