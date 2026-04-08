import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_OPENAI_KEY;
  if (!apiKey) { console.error("No API KEY"); return; }
  
  const isDeepSeek = apiKey.startsWith('sk-') && !apiKey.startsWith('sk-proj-');
  const baseUrl = isDeepSeek ? 'https://api.deepseek.com/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const model = isDeepSeek ? "deepseek-chat" : "gpt-4o-mini";
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = \`Return a strict JSON object with current LIVE Market Sentiment and US Macro Fundamentals. Date: \${dateStr}.
      Assets: GOLD, NASDAQ, SILVER, SP500, COPPER, DOW, USDJPY, DAX, USOIL, NIKKEI, GBPNZD, GBPJPY, BITCOIN, EURUSD, SOLANA, AUDUSD, NZDUSD, ETHEREUM, GBPUSD.
      Format: { "sentiment": { "ASSET_ID": { "iL": number, "rL": number } }, "macro": { "GDP": number, "NFP": number, "PMI": number } }
      Benchmarks: Provide Institutional (iL) COT Non-Commercial estimates and Retail (rL) Myfxbook estimates for these pairs. Also provide latest US GDP growth (%), NFP (raw number), and Manufacturing PMI. No markdown.\`;

  try {
    const res = await axios.post(baseUrl, {
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0
    }, {
      headers: { 'Authorization': \`Bearer \${apiKey}\`, 'Content-Type': 'application/json' }
    });
    console.log(JSON.stringify(JSON.parse(res.data.choices[0].message.content), null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
