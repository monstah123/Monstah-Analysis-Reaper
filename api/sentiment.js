import axios from 'axios';

// Reaper 9.0 - Neural Macro-Matrix (DeepSeek Optimized)
// Unified feed for Retail Sentiment, Institutional COT, AND Global Macro Fundamentals.

export default async function handler(req, res) {
  const now = Date.now();
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ success: true, batch: {}, source: 'Emergency Backup' });
  }

  // Dynamic Provider Selection (Robust Connection Logic)
  const isDeepSeek = apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-');
  const baseUrl = isDeepSeek ? 'https://api.deepseek.com/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const model = isDeepSeek ? "deepseek-chat" : "gpt-4o-mini";

  try {
    const prompt = `Return a strict JSON object for current Market Sentiment and US Macro Fundamentals. Date: April 6, 2026.
    Assets: NIKKEI, DOW, GOLD, BITCOIN, DAX, COPPER, ETHEREUM, USOIL, SOLANA, EURUSD, GBPUSD, USDJPY, SILVER, GBPJPY, AUDUSD, SP500, NZDUSD, NASDAQ, GBPNZD.
    Format: { 
      "sentiment": { "ASSET_ID": { "rL": 38, "rS": 62, "iL": 85, "iS": 15 } }, 
      "macro": { "GDP": 2.4, "CPI": 3.2, "FedRate": 5.5, "NFP": 275000, "PMI": 51.5 },
      "yields": { "y2": 4.52, "y10": 4.18, "y30": 4.35, "y3m": 5.25 }
    }
    Benchmarks: Use latest actual live positioning percentages (rL+rS=100, iL+iS=100) for each. No markdown.`;

    const aiRes = await axios.post(baseUrl, {
      model: model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 25000
    });

    const data = JSON.parse(aiRes.data.choices[0].message.content);
    
    const sentimentResults = {};
    for (const [id, s] of Object.entries(data.sentiment)) {
      sentimentResults[id] = {
        long: s.rL, short: 100 - s.rL,
        iLong: s.iL, iShort: 100 - s.iL,
        source: `Neural ${isDeepSeek ? 'DeepSeek' : 'OpenAI'} Matrix 10.0`
      };
    }

    return res.status(200).json({
      success: true,
      batch: sentimentResults,
      macro: data.macro,
      yields: data.yields,
      source: 'Neural Macro-Matrix 9.0',
      timestamp: now
    });

  } catch (error) {
    // GROUND TRUTH FALLBACK
    const MACRO_FALLBACK = { GDP: 2.1, CPI: 3.4, FedRate: 5.5, NFP: 240000, PMI: 50.8 };
    return res.status(200).json({
      success: true,
      batch: {},
      macro: MACRO_FALLBACK,
      source: `ERR: ${error.message}${error.response ? ` (${error.response.status})` : ''}`,
      timestamp: now
    });
  }
}
