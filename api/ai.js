// Vercel Serverless Function - Ultra-Stable AI Proxy (Zero Dependencies)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { model, messages, stream } = req.body;
  const apiKey = req.headers['x-api-key'] || process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY;
  const baseUrl = process.env.VITE_AI_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    return res.status(401).json({ error: 'AI API Key missing on server AND client.' });
  }

  try {
    const aiRes = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        stream: !!stream
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('AI Upstream Error:', errText);
      return res.status(aiRes.status).json({ error: errText });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = aiRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await aiRes.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('AI Proxy Critical Error:', error.message);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
