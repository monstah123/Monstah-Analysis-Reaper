import axios from 'axios';

// Vercel Serverless Function - Advanced AI Insight Proxy (CORS Fix + Key Pass-through)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { model, messages, stream } = req.body;
  
  // Try server-side env vars FIRST, then look for a pass-through from the client headers
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY || req.headers['x-api-key'];
  const baseUrl = process.env.VITE_AI_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    return res.status(401).json({ error: 'AI API Key missing. Please set it in Settings [X-API-KEY].' });
  }

  try {
    const aiResponse = await axios({
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
        stream: !!stream
      },
      responseType: stream ? 'stream' : 'json'
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Native Node stream support for Vercel
      aiResponse.data.on('data', (chunk) => {
        res.write(chunk);
      });

      aiResponse.data.on('end', () => {
        res.end();
      });

      aiResponse.data.on('error', (err) => {
        console.error('Stream Read Error:', err);
        res.end();
      });
    } else {
      res.status(200).json(aiResponse.data);
    }
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: error.message };
    console.error(`AI Proxy Error [${status}]:`, data);
    res.status(status).json(data);
  }
}
