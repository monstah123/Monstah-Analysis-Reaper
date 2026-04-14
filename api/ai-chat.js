import axios from 'axios';

/**
 * Monstah AI Terminal - Specialized Chat Engine
 * This endpoint handles the conversation logic for the Trading AI Assistant.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { messages, context } = req.body;
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseUrl = 'https://api.deepseek.com/v1';

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'DeepSeek API Key missing.' });
  }

  // --- Monstah Context Injection ---
  const sessionBriefing = `
CURRENT TERMINAL CONTEXT:
- Timestamp: ${context?.timestampUTC || 'Unknown'}
- Active Market Sessions: ${context?.activeSessions || 'Monitoring...'}
- Market Phase: ${context?.marketPhase || 'Standard'}
- Real-Time Yields: ${context?.yields || 'N/A'}
- Institutional COT Extremes: ${context?.cotExtremes || 'N/A'}
`;

  try {
    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: `You are the Monstah AI Terminal, a high-fidelity institutional trading intelligence engine. 
          
          ${sessionBriefing}

          STRICT OPERATING RULES:
          1. Only answer questions related to trading, finance, macro-economics, sentiment analysis, technical analysis, and global markets.
          2. Adhere to a professional, sophisticated, and direct "Institutional Desk" persona.
          3. Use the CURRENT TERMINAL CONTEXT above to provide hyper-accurate advice tailored to the current session and positioning.
          4. If a user asks a non-trading question, politely but firmly decline.
          5. NEVER use markdown headers like # or ##. Use **BOLD ALL CAPS** for section headings.`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    return res.status(200).json({
      success: true,
      data: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('[AI Chat Error]:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to communicate with DeepSeek Intelligence engine.'
    });
  }
}
