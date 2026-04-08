import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.body;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!tavilyKey) {
    return res.status(500).json({ error: 'Tavily API key not configured' });
  }

  try {
    // 1. Search the web for live sentiment and data
    const searchRes = await axios.post('https://api.tavily.com/search', {
      api_key: tavilyKey,
      query: query || "latest retail and institutional sentiment for major forex and stocks",
      search_depth: "advanced",
      include_answer: true,
      max_results: 5
    });

    const results = searchRes.data;

    // 2. Format the response for the Researcher UI
    return res.status(200).json({
      success: true,
      answer: results.answer,
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
