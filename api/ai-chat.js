import axios from 'axios';

/**
 * Monstah AI Terminal - Specialized Chat Engine
 * This endpoint handles the conversation logic for the Trading AI Assistant.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { messages } = req.body;
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseUrl = 'https://api.deepseek.com/v1';

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'DeepSeek API Key missing. Please add it to your environment variables.' });
  }

  try {
    // Stage 1: Initial setup (General assistant for now, as requested)
    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: `You are the Monstah AI Terminal, a high-fidelity institutional trading intelligence engine. 
          
          STRICT OPERATING RULES:
          1. Only answer questions related to trading, finance, macro-economics, sentiment analysis, technical analysis, and global markets.
          2. Adhere to a professional, sophisticated, and direct "Institutional Desk" persona.
          3. If a user asks a non-trading or general knowledge question (e.g., about history, celebrities, or general science), politely but firmly decline and redirect them to market analysis. Use phrases like "This terminal is reserved for institutional intelligence" or "Neural focus restricted to global markets."
          4. You have access to the Monstah environment memory including COT data, retail sentiment, and yield spreads. Provide high-conviction insights.
          5. NEVER use markdown headers like #, ##, or ###. Use **BOLD ALL CAPS** for section headings instead.`
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
