// Vercel Serverless Function - Smart Dynamic AI Proxy (Sync Mode)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Now we accept baseUrl and apiKey passed dynamically from the frontend settings
  const { model, messages, stream, baseUrl: clientBaseUrl } = req.body;
  const apiKey = req.headers['x-api-key'] || process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY;
  const baseUrl = clientBaseUrl || process.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    return res.status(401).json({ error: 'AI API Key missing. Add it to your Settings!' });
  }

  try {
    const aiRes = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o', 
        messages,
        stream: !!stream
      })
    });

    if (!aiRes.ok) {
      // 400 errors come from here - now we surface exactly WHAT the AI is mad about (e.g. Model Name)
      const errData = await aiRes.json().catch(() => ({ error: 'Unknown Upstream Error' }));
      return res.status(aiRes.status).json(errData);
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
    res.status(500).json({ error: error.message });
  }
}
