import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Monstah AI Terminal - Live Data-Grounded Chat Engine
 *
 * ARCHITECTURE: Before every AI response, this handler fetches LIVE data from
 * the real CFTC COT API and FRED macro endpoints, then injects it into the
 * system prompt so DeepSeek answers from CURRENT institutional data — not its
 * stale training cutoff.
 */

// ─── LIVE WEB SEARCH FETCHER ──────────────────────────────────────────────────
async function fetchWebSearch(query) {
  try {
    // DuckDuckGo aggressively blocks automated Axios requests now.
    // Instead, we query Yahoo Finance RSS News Search to ensure reliable live data.
    const cleanQuery = query.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(w => w.length > 2).join('+');
    const url = `https://finance.yahoo.com/rss/headline?s=${cleanQuery}`;
    
    // We also pull the general market pulse if the specific ticker search fails
    const generalUrl = 'https://finance.yahoo.com/news/rssindex';

    // Try specific first, then general
    let res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }).catch(() => null);
    if (!res || !res.data || !res.data.includes('<item>')) {
        res = await axios.get(generalUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 });
    }

    const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const results = items.slice(0, 5).map(item => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
      const desc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
      return title.replace('<![CDATA[', '').replace(']]>', '') + ' - ' + desc.replace(/<[^>]+>/g, '').substring(0, 150);
    });

    return results.length > 0 ? results.join('\n\n') : 'No specific news found, rely on core macro and COT data.';
  } catch (e) {
    return 'Live web sync currently degraded. Refer strictly to real-time CFTC and FRED parameters.';
  }
}

// ─── LIVE COT FETCHER ────────────────────────────────────────────────────────
async function fetchLiveCOT() {
  try {
    const [res1, res2] = await Promise.allSettled([
      axios.get(
        'https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=500&$order=report_date_as_yyyy_mm_dd DESC',
        { timeout: 12000 }
      ),
      axios.get(
        'https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$limit=500&$order=report_date_as_yyyy_mm_dd DESC',
        { timeout: 12000 }
      )
    ]);

    const allRows = [];
    if (res1.status === 'fulfilled' && res1.value?.data) allRows.push(...res1.value.data);
    if (res2.status === 'fulfilled' && res2.value?.data) allRows.push(...res2.value.data);
    if (!allRows.length) return null;

    // Find the most recent report date present in the raw data
    const reportDates = allRows
      .map(r => r.report_date_as_yyyy_mm_dd)
      .filter(Boolean)
      .map(d => d.split('T')[0])
      .sort()
      .reverse();
    const mostRecentDate = reportDates[0] || 'Unknown';

    const cftcMap = {
      'EURO FX':                       'EUR/USD',
      'EURO CURRENCY':                  'EUR/USD',
      'BRITISH POUND':                  'GBP/USD',
      'BRITISH POUND STERLING':         'GBP/USD',
      'JAPANESE YEN':                   'USD/JPY',
      'CANADIAN DOLLAR':                'USD/CAD',
      'AUSTRALIAN DOLLAR':              'AUD/USD',
      'NEW ZEALAND DOLLAR':             'NZD/USD',
      'NZ DOLLAR':                      'NZD/USD',
      'SWISS FRANC':                    'USD/CHF',
      'E-MINI S&P 500':                 'S&P 500',
      'NASDAQ-100 Consolidated':        'NASDAQ-100',
      'DJIA Consolidated':              'DJIA/US30',
      'DOW JONES INDUSTRIAL AVG':       'DJIA/US30',
      'GOLD':                           'GOLD',
      'SILVER':                         'SILVER',
      'CRUDE OIL, LIGHT SWEET':         'WTI CRUDE OIL',
      'BITCOIN':                        'BITCOIN',
      'ETHER':                          'ETHEREUM'
    };

    const cotSummary = {};

    allRows.forEach(row => {
      for (const [cftcName, assetLabel] of Object.entries(cftcMap)) {
        if (
          row.market_and_exchange_names &&
          row.market_and_exchange_names.includes(cftcName) &&
          !cotSummary[assetLabel]
        ) {
          const rowDate = row.report_date_as_yyyy_mm_dd
            ? row.report_date_as_yyyy_mm_dd.split('T')[0]
            : 'Unknown';
          const l     = parseFloat(row.noncomm_positions_long_all)  || 0;
          const s     = parseFloat(row.noncomm_positions_short_all) || 0;
          const total = l + s;

          if (total > 0) {
            const longPct = Math.round((l / total) * 100);
            const bias    = longPct >= 60 ? 'BULLISH' : longPct <= 40 ? 'BEARISH' : 'NEUTRAL';
            cotSummary[assetLabel] = {
              date: rowDate,
              nonCommLong:  Math.round(l),
              nonCommShort: Math.round(s),
              longPct,
              shortPct: 100 - longPct,
              bias
            };
          }
        }
      }
    });

    return {
      mostRecentDate,
      cotSummary,
      fetchedAt: new Date().toISOString().split('T')[0]
    };
  } catch (err) {
    console.error('[COT Fetch Error]:', err.message);
    return null;
  }
}

// ─── LIVE MACRO FETCHER ───────────────────────────────────────────────────────
async function fetchLiveMacro() {
  const fredKey = process.env.FRED_KEY || 'a511ff61c8ca4177e733079ebec436d3';

  const getFred = async (series, units = 'lin') => {
    const url =
      `https://api.stlouisfed.org/fred/series/observations` +
      `?series_id=${series}&api_key=${fredKey}&file_type=json&limit=2&sort_order=desc&units=${units}`;
    const r   = await axios.get(url, { timeout: 10000 });
    const obs = (r.data.observations || []).filter(o => o.value !== '.');
    if (!obs.length) return null;
    return { value: parseFloat(obs[0].value), date: obs[0].date };
  };

  try {
    const [fedData, cpiData, nfpData, gdpData, y2Data, y10Data] = await Promise.allSettled([
      getFred('FEDFUNDS'),
      getFred('CPIAUCSL', 'pc1'),
      getFred('PAYEMS', 'chg'),
      getFred('A191RL1Q225SBEA'),
      getFred('DGS2'),
      getFred('DGS10')
    ]);

    return {
      fedFundsRate: fedData.status === 'fulfilled' ? fedData.value : null,
      cpiYoY:       cpiData.status === 'fulfilled' ? cpiData.value : null,
      nfpChange:    nfpData.status === 'fulfilled' ? nfpData.value : null,
      realGDP:      gdpData.status === 'fulfilled' ? gdpData.value : null,
      yield2yr:     y2Data.status  === 'fulfilled' ? y2Data.value  : null,
      yield10yr:    y10Data.status === 'fulfilled' ? y10Data.value : null
    };
  } catch (err) {
    console.error('[Macro Fetch Error]:', err.message);
    return null;
  }
}

// ─── BUILD SYSTEM-PROMPT CONTEXT BLOCK ───────────────────────────────────────
function buildLiveDataContext(cot, macro) {
  const now = new Date().toUTCString();
  let ctx = `CURRENT UTC TIME: ${now}\n\n`;

  ctx += `=== LIVE INSTITUTIONAL COT DATA (Source: CFTC Public API — fetched NOW) ===\n`;
  if (cot && cot.mostRecentDate) {
    ctx += `Most Recent CFTC Report Date: ${cot.mostRecentDate}\n`;
    ctx += `Data Fetched: ${cot.fetchedAt}\n\n`;

    if (Object.keys(cot.cotSummary).length > 0) {
      for (const [asset, d] of Object.entries(cot.cotSummary)) {
        ctx +=
          `${asset} (report date ${d.date}): ` +
          `Non-Commercial LONG ${d.nonCommLong.toLocaleString()} (${d.longPct}%) | ` +
          `SHORT ${d.nonCommShort.toLocaleString()} (${d.shortPct}%) → Bias: ${d.bias}\n`;
      }
    } else {
      ctx += `COT rows fetched but no recognized asset positions found.\n`;
    }
  } else {
    ctx += `COT data temporarily unavailable (CFTC API timeout — do not invent values).\n`;
  }

  ctx += `\n=== LIVE MACRO DATA (Source: FRED / St. Louis Federal Reserve) ===\n`;
  if (macro) {
    if (macro.fedFundsRate) ctx += `Fed Funds Rate: ${macro.fedFundsRate.value}% (as of ${macro.fedFundsRate.date})\n`;
    if (macro.cpiYoY)       ctx += `CPI YoY Inflation: ${macro.cpiYoY.value.toFixed(2)}% (as of ${macro.cpiYoY.date})\n`;
    if (macro.nfpChange)    ctx += `NFP Monthly Change: ${Math.round(macro.nfpChange.value).toLocaleString()}K jobs (as of ${macro.nfpChange.date})\n`;
    if (macro.realGDP)      ctx += `Real GDP Growth (Annualized): ${macro.realGDP.value}% (as of ${macro.realGDP.date})\n`;
    if (macro.yield2yr)     ctx += `2-Year Treasury Yield: ${macro.yield2yr.value}% (as of ${macro.yield2yr.date})\n`;
    if (macro.yield10yr)    ctx += `10-Year Treasury Yield: ${macro.yield10yr.value}% (as of ${macro.yield10yr.date})\n`;

    if (macro.yield2yr && macro.yield10yr) {
      const spread = (macro.yield10yr.value - macro.yield2yr.value).toFixed(2);
      ctx += `2s10s Yield Spread: ${spread}% (${parseFloat(spread) > 0 ? 'NORMAL / UNINVERTED' : 'INVERTED'})\n`;
    }
  } else {
    ctx += `Macro data temporarily unavailable — do not invent values.\n`;
  }

  ctx += `
=== GROUND RULES FOR THIS RESPONSE ===
- Base ALL COT and macro analysis EXCLUSIVELY on the live figures above.
- NEVER reference data from 2024 or any prior period from your training knowledge.
- Always cite the specific report date when discussing COT positioning.
- If a specific data point is missing above, say "data currently syncing" — never invent numbers.
- The live data above supersedes your training knowledge entirely for market figures.
`;

  return ctx;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { messages } = req.body;
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  const baseUrl = 'https://api.deepseek.com/v1';

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'DeepSeek API Key missing. Add DEEPSEEK_API_KEY to your environment variables.'
    });
  }

  // Determine if the user's latest query requires a web search
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const needsSearch = lastMsg.match(/search|news|latest|current|today|update|now/i);

  // Fetch live CFTC + FRED + Web Search IN PARALLEL
  const [cotResult, macroResult, webResult] = await Promise.allSettled([
    fetchLiveCOT(),
    fetchLiveMacro(),
    needsSearch ? fetchWebSearch(messages[messages.length - 1].content) : Promise.resolve(null)
  ]);

  const cotData   = cotResult.status   === 'fulfilled' ? cotResult.value   : null;
  const macroData = macroResult.status === 'fulfilled' ? macroResult.value : null;
  const webData   = webResult.status   === 'fulfilled' ? webResult.value   : null;
  
  let liveDataContext = buildLiveDataContext(cotData, macroData);
  if (webData) {
    liveDataContext += `\n\n--- LIVE WEB INTELLIGENCE SEARCH RESULTS ---\n${webData}\n\nUSE THESE ARTICLES TO ANSWER THE USER'S LATEST QUESTION.`;
  }

  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are the Monstah AI Terminal, a high-fidelity institutional trading intelligence engine.

STRICT OPERATING RULES:
1. Only answer questions related to trading, finance, macro-economics, sentiment analysis, technical analysis, and global markets.
2. Adhere to a professional, sophisticated, and direct "Institutional Desk" persona.
3. You HAVE access to LIVE external web search results which are injected below. You MUST use them if the user asks for current news, prices, or recent events. DO NOT DECLINE SEARCH REQUESTS.
4. NEVER use markdown headers like #, ##, or ###. Use **BOLD ALL CAPS** for section headings instead.
5. You have been injected with LIVE, REAL-TIME institutional data below. This is your ONLY source of truth for COT positioning and macro figures. Your training data is OVERRIDDEN for these specific numbers.

${liveDataContext}`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

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
