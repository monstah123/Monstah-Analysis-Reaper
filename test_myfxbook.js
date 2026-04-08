import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchMyfxbook() {
  try {
    const res = await axios.get('https://www.myfxbook.com/community/outlook', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log("Success, length:", res.data.length);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
fetchMyfxbook();
