import axios from 'axios';

// Vercel Serverless Function - AI Insight Proxy (Bypasses CORS for iPad/Strict Browsers)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { model, messages, stream } = req.body;
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY;
  const baseUrl = process.env.VITE_AI_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    return res.status(500).json({ error: 'AI API Key not found in server environment.' });
  }

  try {
    // If user requested a stream, we setup a direct pipe
    if (stream) {
      const response = await axios({
        method: 'POST',
        url: `${baseUrl.replace(/\/$/, '')}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        data: {
          model: model || 'deepseek-chat',
          messages,
          stream: true
        },
        responseType: 'stream'
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.data.pipe(res);
    } else {
      // Non-streaming fallback
      const response = await axios.post(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        model: model || 'deepseek-chat',
        messages,
        stream: false
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      });
      res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('AI Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal AI Error' });
  }
}
