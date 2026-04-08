import axios from 'axios';

export default async function handler(req, res) {
  const { asset, date } = req.body;
  const tavilyKey = process.env.TAVILY_API_KEY;
  const deepseekKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY;

  if (!tavilyKey || !deepseekKey) {
    return res.status(500).json({ error: 'API keys not configured' });
  }

  try {
    // 1. Search for historical context around that date
    // We use Tavily to find what the "narrative" was on that day
    const searchRes = await axios.post('https://api.tavily.com/search', {
      api_key: tavilyKey,
      query: `What was the market sentiment and price action for ${asset} on ${date}? Include retail sentiment and institutional news.`,
      search_depth: "advanced",
      max_results: 5
    });

    const context = searchRes.data.results.map(r => r.content).join("\n\n");

    // 2. Use the LLM to process this historical context into a Reaper Score
    const aiRes = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are the Monstah Reaper Backtest Engine. Analyze historical data and return a precise JSON report."
        },
        {
          role: "user",
          content: `Historical Context for ${asset} on ${date}:\n\n${context}\n\nBased on this information, provide:
          1. The approximate closing price that day.
          2. A Sentiment Score (0-100).
          3. A Macro Score (0-100).
          4. An Institutional Score (0-100).
          5. A final Reap Verdict (Buy, Sell, or Neutral).
          6. A brief explanation of why.
          
          Format the output as valid JSON:
          {
            "price": "string",
            "sentiment": number,
            "macro": number,
            "institutional": number,
            "verdict": "string",
            "reasoning": "string"
          }`
        }
      ],
      response_format: { type: "json_object" }
    }, {
      headers: { 'Authorization': `Bearer ${deepseekKey}` }
    });

    const report = JSON.parse(aiRes.data.choices[0].message.content);

    return res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Backtest Error:', error.message);
    return res.status(500).json({ error: 'Failed to reconstruct historical data' });
  }
}
