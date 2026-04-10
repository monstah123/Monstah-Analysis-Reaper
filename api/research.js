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
      include_answer: false, // Turn off AI generation to prevent token glitches
      max_results: 5
    });

    const results = searchRes.data;
    
    // 2. Bypass all AI generation and build the answer straight from pure source text
    let finalAnswer = "";
    if (results.results && results.results.length > 0) {
      // Grab the content of the top 2 articles directly to ensure human-written spelling
      finalAnswer = results.results.slice(0, 2).map((r, i) => `[Source ${i+1}]: ${r.content.trim()}`).join('\n\n');
    } else {
      finalAnswer = "No reliable institutional intel could be located for this query.";
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
