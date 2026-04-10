import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.body;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!tavilyKey) {
    return res.status(500).json({ error: 'Tavily API key not configured' });
  }

  try {
    // 1. Search the web using Tavily
    const searchRes = await axios.post('https://api.tavily.com/search', {
      api_key: tavilyKey,
      query: query || "latest retail and institutional sentiment for major forex and stocks",
      search_depth: "advanced",
      include_answer: false, // We'll do custom extraction to be safe
      max_results: 5
    });

    const results = searchRes.data;
    let rawText = results.results ? results.results.map(r => r.content).join(' || ') : "";
    let finalAnswer = "Analyzing raw institutional data...";

    // 2. Intelligent Extraction to determine Institutional Bias (LONG/SHORT)
    const aiKey = req.headers['x-api-key'] || process.env.VITE_OPENAI_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    const isDeepSeek = !req.headers['x-api-key'] && !process.env.VITE_OPENAI_KEY;
    const aiUrl = isDeepSeek ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions';

    if (aiKey && rawText) {
      try {
        const proofRes = await axios.post(aiUrl, {
          model: isDeepSeek ? 'deepseek-chat' : 'gpt-4o',
          messages: [
            { role: "system", content: "You are a Wall Street Quant Analyst. Analyze the provided news snippets. In 2 or 3 sentences, summarize the current market sentiment and explicitly state whether the Institutional Bias is LONG, SHORT, or NEUTRAL. CRITICAL: Use pure text only. Do NOT use markdown. Do NOT use asterisks. Ensure perfect spelling." },
            { role: "user", content: rawText.substring(0, 4000) }
          ],
          temperature: 0.7 // Standard entropy to prevent token looping/typos
        }, {
          headers: {
            'Authorization': `Bearer ${aiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (proofRes.data.choices?.[0]?.message?.content) {
          finalAnswer = proofRes.data.choices[0].message.content;
        }
      } catch (aiErr) {
        console.error('AI Research Extractor Error:', aiErr.message);
        finalAnswer = "Institutional Bias could not be computed at this time. Raw source data available below.";
      }
    } else {
      finalAnswer = "AI connection inactive. Please check your API keys.";
    }

    // 3. Format the final output
    return res.status(200).json({
      success: true,
      answer: finalAnswer,
      sources: results.results.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content
      }))
    });

  } catch (error) {
    console.error('Research Error:', error.message);
    return res.status(500).json({ error: 'Failed to crawl the web for intel' });
  }
}
