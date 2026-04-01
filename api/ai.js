// Vercel Serverless Function - Smart Dynamic AI Proxy (Sync/Stream)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { model, messages, stream, baseUrl: clientBaseUrl } = req.body;
    
    // Auth Priority: Header Key > Env DeepSeek > Env OpenAI
    const activeKey = req.headers['x-api-key'] || process.env.VITE_OPENAI_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    const activeBase = clientBaseUrl || 'https://api.openai.com/v1';

    if (!activeKey) {
      return res.status(401).json({ error: { message: 'AI API Key missing. Add it to Settings!' } });
    }

    const aiRes = await fetch(`${activeBase.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        stream: !!stream
      })
    });

    if (!aiRes.ok) {
      const errBody = await aiRes.json().catch(() => ({}));
      console.error('[Proxy] Upstream Error:', aiRes.status, errBody);
      return res.status(aiRes.status).json(errBody);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (!aiRes.body) throw new Error('Upstream provided no body for stream.');
      
      const reader = aiRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await aiRes.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('AI Proxy Critical Error:', error.message);
    res.status(500).json({ error: { message: error.message } });
  }
}
