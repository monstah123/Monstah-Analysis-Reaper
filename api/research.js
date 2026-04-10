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
      include_answer: true,
      max_results: 5
    });

    const results = searchRes.data;
    let finalAnswer = results.answer;

    // 2. Intelligent Auto-Correction / Proofreading via DeepSeek (or fallback to OpenAI)
    const aiKey = req.headers['x-api-key'] || process.env.VITE_OPENAI_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    const isDeepSeek = !req.headers['x-api-key'] && !process.env.VITE_OPENAI_KEY;
    const aiUrl = isDeepSeek ? 'https://api.deepseek.com/chat/completions' : 'https://api.openai.com/v1/chat/completions';

    if (aiKey && finalAnswer) {
      try {
        const proofRes = await axios.post(aiUrl, {
          model: isDeepSeek ? 'deepseek-chat' : 'gpt-4o',
          messages: [
            { role: "system", content: "You are a professional Wall Street Quant Analyst. Your job is to take the following raw web search summary and rewrite it into a highly professional, typo-free, concise Institutional Intelligence Report. Fix any egregious spelling errors. Keep it strictly factual." },
            { role: "user", content: finalAnswer }
          ],
          temperature: 0.1
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
        console.error('DeepSeek Proofreading Error (falling back to raw answer):', aiErr.message);
      }
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
