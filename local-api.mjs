import http from 'http';
import https from 'https';
import zlib from 'zlib';
import fs from 'fs';

const PORT = 4318;

const envPath = new URL('./.env.local', import.meta.url);
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const separator = line.indexOf('=');
        if (separator > 0) {
            const key = line.slice(0, separator).trim();
            const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = value;
        }
    }
}

const FRED_KEY = process.env.FRED_KEY || process.env.VITE_FRED_KEY || '';

async function fetchJson(url, headers = {}, retries = 2, timeout = 10000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                const reqHeaders = { ...headers, 'Accept-Encoding': 'gzip, deflate, br' };
                const req = https.get(url, { headers: reqHeaders }, res => {
                    const encoding = res.headers['content-encoding'];
                    const chunks = [];
                    
                    res.on('data', chunk => chunks.push(chunk));
                    res.on('end', () => {
                        try {
                            let data = Buffer.concat(chunks);
                            
                            if (encoding === 'gzip') {
                                data = zlib.gunzipSync(data);
                            } else if (encoding === 'deflate') {
                                data = zlib.inflateSync(data);
                            } else if (encoding === 'br') {
                                data = zlib.brotliDecompressSync(data);
                            }
                            
                            const str = data.toString('utf8');
                            resolve(JSON.parse(str));
                        } catch (e) {
                            reject(new Error(`Invalid JSON: ${e.message}`));
                        }
                    });
                });
                req.on('error', reject);
                req.setTimeout(timeout, () => req.destroy(new Error('Request timeout')));
            });
        } catch (e) {
            if (attempt === retries) throw e;
            console.log(`[fetchJson] Retry ${attempt + 1}/${retries} for ${url}: ${e.message}`);
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
    }

}

async function fetchText(url, headers = {}, timeout = 10000) {
    return await new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', ...headers } }, res => {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
        req.on('error', reject);
        req.setTimeout(timeout, () => req.destroy(new Error('Request timeout')));
    });
}

async function fetchCOT() {
    // Corrected CFTC market names: 'NZ DOLLAR' (not 'NEW ZEALAND DOLLAR'),
    // 'SOL - ' for Solana futures, 'MSCI EAFE' as the DAX proxy (no CFTC DAX contract exists).
    const BASE_KEYWORDS = ['DJIA', 'S&P 500', 'NASDAQ', 'MSCI EAFE', 'NIKKEI', 'EURO FX', 'BRITISH POUND', 'JAPANESE YEN', 'AUSTRALIAN DOLLAR', 'NZ DOLLAR', 'CANADIAN DOLLAR', 'SWISS FRANC', 'GOLD', 'SILVER', 'COPPER', 'BITCOIN', 'ETHER', 'SOL -'];
    const COMMODITY_KEYWORDS = [...BASE_KEYWORDS, 'BRENT', 'CRUDE OIL', 'WTI'];
    const datasets = [
        { id: 'udgc-27he', keywords: BASE_KEYWORDS },
        { id: 'srt6-5q2f', keywords: COMMODITY_KEYWORDS },
        { id: 'kh3c-gbw2', keywords: ['BRENT', 'CRUDE OIL', 'WTI'] },
        { id: 'rxbv-e226', keywords: COMMODITY_KEYWORDS },
        { id: '72hh-3qpy', keywords: COMMODITY_KEYWORDS }
    ];

    const results = [];
    const cutoff = new Date(Date.now() - 28 * 864e5).toISOString().split('T')[0];
    for (const ds of datasets) {
        const keywordFilter = ds.keywords.map(k => `upper(market_and_exchange_names) like '%25${k.toUpperCase().replace(/ /g, '%20').replace(/&/g, '%26')}%25'`).join(' or ');
        const where = `(${keywordFilter}) and report_date_as_yyyy_mm_dd >= '${cutoff}'`;
        const url = `https://publicreporting.cftc.gov/resource/${ds.id}.json?$where=${where}&$limit=1500&$order=report_date_as_yyyy_mm_dd DESC`;
        try {
            const data = await fetchJson(url);
            if (Array.isArray(data)) results.push(...data.map(r => ({ ...r, _ds: ds.id })));
        } catch (e) {
            console.error(`[COT] ${ds.id}:`, e.message);
        }
    }
    return results;
}

const ASSET_REGISTER = {
    'US30': { id: ['DJIA CONSOLIDATED', 'DJIA', 'DOW JONES'], category: 'Indices' },
    'SP500': { id: ['S&P 500', 'SPX', 'E-MINI S&P'], category: 'Indices' },
    'NASDAQ': { id: ['NASDAQ', 'NDX', 'E-MINI NASDAQ'], category: 'Indices' },
    'DAX': { id: ['MSCI EAFE'], category: 'Indices' },
    'NIKKEI': { id: ['NIKKEI'], category: 'Indices' },
    'GOLD': { id: ['GOLD'], category: 'Commodities' },
    'SILVER': { id: ['SILVER'], category: 'Commodities' },
    'COPPER': { id: ['COPPER'], category: 'Commodities' },
    'USOIL': { id: ['WTI', 'CRUDE OIL'], category: 'Commodities' },
    'UKOIL': { id: ['BRENT LAST DAY', 'BRENT CRUDE OIL', 'BRENT'], category: 'Commodities' },
    'EURUSD': { id: ['EURO FX'], category: 'Currency' },
    'GBPUSD': { id: ['BRITISH POUND'], category: 'Currency' },
    'USDJPY': { id: ['JAPANESE YEN'], category: 'Currency' },
    'AUDUSD': { id: ['AUSTRALIAN DOLLAR'], category: 'Currency' },
    'NZDUSD': { id: ['NZ DOLLAR', 'NEW ZEALAND DOLLAR'], category: 'Currency' },
    'USDCAD': { id: ['CANADIAN DOLLAR'], category: 'Currency' },
    'USDCHF': { id: ['SWISS FRANC'], category: 'Currency' },
    'BITCOIN': { id: ['BITCOIN'], category: 'Crypto' },
    'ETHEREUM': { id: ['ETHER', 'ETHEREUM'], category: 'Crypto' },
    'SOLANA': { id: ['SOL - ', 'SOLANA'], category: 'Crypto' }
};

async function processCOT(rawData) {
    const results = {};
    for (const [assetId, config] of Object.entries(ASSET_REGISTER)) {
        let matches = rawData.filter(row => {
            const name = (row.market_and_exchange_names || row.market_name || row.contract_market_name || '').toUpperCase();
            return config.id.some(idPart => name.includes(idPart.toUpperCase()));
        });

        if (config.category === 'Currency') {
            const standalone = matches.filter(row => {
                const name = (row.market_and_exchange_names || '').toUpperCase();
                return !name.includes('XRATE') && !name.includes('X-RATE') && !name.includes('/');
            });
            if (standalone.length > 0) matches = standalone;
        }

        if (config.category === 'Indices') {
            const fullSize = matches.filter(row => {
                const name = (row.market_and_exchange_names || '').toUpperCase();
                return !name.includes('MICRO');
            });
            if (fullSize.length > 0) matches = fullSize;
        }

        if (matches.length > 0) {
            const match = matches.sort((a,b) => {
                const dateA = new Date(a.report_date_as_yyyy_mm_dd).getTime();
                const dateB = new Date(b.report_date_as_yyyy_mm_dd).getTime();
                if (dateB !== dateA) return dateB - dateA;

                const weightMap = { '72hh-3qpy': 100, 'udgc-27he': 95, 'rxbv-e226': 90, 'kh3c-gbw2': 80, 'srt6-5q2f': 50 };
                const weightA = weightMap[a._ds] || 0;
                const weightB = weightMap[b._ds] || 0;
                if (weightB !== weightA) return weightB - weightA;

                const getVol = (r) => (parseInt(r.asset_mgr_positions_long || 0) + parseInt(r.asset_mgr_positions_short || 0)) ||
                    (parseInt(r.lev_money_positions_long || 0) + parseInt(r.lev_money_positions_short || 0)) ||
                    (parseInt(r.m_money_positions_long_all || 0) + parseInt(r.m_money_positions_short_all || 0)) ||
                    (parseInt(r.noncomm_positions_long_all || 0) + parseInt(r.noncomm_positions_short_all || 0)) ||
                    (parseInt(r.other_rept_positions_long || 0) + parseInt(r.other_rept_positions_short || 0)) || 0;
                const volA = getVol(a);
                const volB = getVol(b);
                if (volB !== volA) return volB - volA;

                const nameA = (a.market_and_exchange_names || '').toUpperCase();
                const nameB = (b.market_and_exchange_names || '').toUpperCase();
                const consA = nameA.includes('CONSOLIDATED') || (a.futonly_or_combined || '').toUpperCase().includes('COMBINED');
                const consB = nameB.includes('CONSOLIDATED') || (b.futonly_or_combined || '').toUpperCase().includes('COMBINED');
                if (consA && !consB) return -1;
                if (consB && !consA) return 1;
            })[0];

            const instPatterns = ['asset_mgr', 'lev_money', 'managed_money', 'm_money', 'noncomm', 'other_rept'];
            let bestPrefix = '', maxVol = -1, cLong = 0, cShort = 0;

            for (const p of instPatterns) {
                let l = 0, s = 0;
                for (const key of Object.keys(match)) {
                    const k = key.toLowerCase();
                    if (k.includes(p) && !k.includes('change') && !k.includes('pct') && !k.includes('spread') && !k.includes('traders') && !k.includes('_old') && !k.includes('_other')) {
                        const val = parseInt(match[key] || 0) || 0;
                        if (k.includes('long') && l === 0) l = val;
                        if (k.includes('short') && s === 0) s = val;
                    }
                }
                const vol = l + s;
                if (vol > maxVol) { maxVol = vol; bestPrefix = p; cLong = l; cShort = s; }
            }

            let long = cLong, short = cShort, changeLong = 0, changeShort = 0;
            for (const key of Object.keys(match)) {
                const k = key.toLowerCase();
                if (k.includes(bestPrefix) && k.includes('change')) {
                    const val = parseFloat(match[key] || 0) || 0;
                    if (k.includes('long') && changeLong === 0) changeLong = val;
                    if (k.includes('short') && changeShort === 0) changeShort = val;
                }
            }

            let total = long + short;
            let longPct = total > 0 ? (long / total) * 100 : 50;
            let shortPct = 100 - longPct;

            if (['USDJPY', 'USDCHF', 'USDCAD'].includes(assetId)) {
                [longPct, shortPct] = [shortPct, longPct];
                [long, short] = [short, long];
                [changeLong, changeShort] = [changeShort, changeLong];
            }

            results[assetId] = {
                longPct: +longPct.toFixed(1),
                shortPct: +shortPct.toFixed(1),
                contractsLong: long,
                contractsShort: short,
                changeLong,
                changeShort,
                source: `CFTC ${match._ds} (${match.report_date_as_yyyy_mm_dd?.split('T')[0] || 'Recent'})`
            };
        }
    }
    return results;
}

async function getMacro() {
    const filterValid = obs => (obs || []).filter(o => o.value !== '.' && o.value !== null && o.value !== undefined);

    console.log('[Macro] Fetching FRED data...');
    const results = await Promise.allSettled([
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=2`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=2&units=pch`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=PAYEMS&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=2`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS2&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS30&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`),
        fetchJson(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`)
    ]);

    const [gdpRes, cpiRes, fedRes, nfpRes, y2Res, y10Res, y30Res, y3mRes] = results;

    console.log('[Macro] Results:', results.map((r, i) => `${i}: ${r.status}${r.status === 'rejected' ? ' - ' + r.reason?.message : ''}`).join(', '));

    const gdpObs = filterValid(gdpRes.value?.observations);
    const cpiObs = filterValid(cpiRes.value?.observations);
    const nfpObs = filterValid(nfpRes.value?.observations);
    const fedObs = filterValid(fedRes.value?.observations);

    return {
        GDP: gdpRes.status === 'fulfilled' && gdpObs.length > 1
            ? +((Math.pow(parseFloat(gdpObs[0].value) / parseFloat(gdpObs[1].value), 4) - 1) * 100).toFixed(2)
            : null,
        CPI: cpiRes.status === 'fulfilled' && cpiObs.length > 0
            ? +parseFloat(cpiObs[0].value).toFixed(2)
            : null,
        FedRate: fedRes.status === 'fulfilled' && fedObs.length > 0 ? parseFloat(fedObs[0].value) : null,
        NFP: nfpRes.status === 'fulfilled' && nfpObs.length > 1 ? parseFloat(nfpObs[0].value) - parseFloat(nfpObs[1].value) : null,
        yields: {
            y2: y2Res.status === 'fulfilled' ? parseFloat(y2Res.value.observations[0]?.value) : null,
            y10: y10Res.status === 'fulfilled' ? parseFloat(y10Res.value.observations[0]?.value) : null,
            y30: y30Res.status === 'fulfilled' ? parseFloat(y30Res.value.observations[0]?.value) : null,
            y3m: y3mRes.status === 'fulfilled' ? parseFloat(y3mRes.value.observations[0]?.value) : null
        }
    };
}

async function readRequestBody(req) {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
        return body ? JSON.parse(body) : {};
    } catch {
        return {};
    }
}

function decodeNewsEntities(text) {
    return text
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/â/g, "'")
        .replace(/â/g, '—')
        .replace(/â/g, '–')
        .replace(/â¦/g, '...')
        .replace(/Â/g, '')
        .trim();
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.writeHead(204).end();

    if (req.url.startsWith('/api/sentiment')) {
        try {
            console.log('[API] Fetching COT and Macro...');
            const [rawCot, macroData] = await Promise.all([fetchCOT(), getMacro()]);
            const cotData = await processCOT(rawCot);
            console.log('[API] COT keys:', Object.keys(cotData || {}));
            
            const gbp = cotData['GBPUSD'];
            const jpy = cotData['USDJPY'];
            if (gbp && jpy) {
                cotData['GBPJPY'] = {
                    longPct: +((gbp.longPct + jpy.longPct) / 2).toFixed(1),
                    shortPct: +((gbp.shortPct + jpy.shortPct) / 2).toFixed(1),
                    source: 'Institutional Cross Synthesis'
                };
            }

            // GBP/NZD has no direct CFTC contract — synthesize from GBP and NZD legs.
            const nzd = cotData['NZDUSD'];
            if (gbp && nzd) {
                const synthLong = +((gbp.longPct + nzd.longPct) / 2).toFixed(1);
                cotData['GBPNZD'] = {
                    longPct: synthLong,
                    shortPct: +(100 - synthLong).toFixed(1),
                    source: 'Institutional Cross Synthesis'
                };
            }

            // Match original API format: yields at top level
            const { yields, ...macro } = macroData;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, sentiment: cotData, macro, yields }));
        } catch (e) {
            console.error('[API Error]', e.stack || e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
    } else if (req.url.startsWith('/api/news')) {
        try {
            const feeds = [
                'https://news.google.com/rss/search?q=institutional+forex+macro+central+bank+news+when:1d&hl=en-US&gl=US&ceid=US:en',
                'https://news.google.com/rss/search?q=site:bloomberg.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en',
                'https://www.investing.com/rss/news_25.rss'
            ];

            const responses = await Promise.allSettled(feeds.map(url => fetchText(url)));
            const combined = [];

            for (const response of responses) {
                if (response.status !== 'fulfilled') continue;
                const items = response.value.match(/<item>([\s\S]*?)<\/item>/g) || [];
                for (const item of items) {
                    const rawTitle = item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
                    const title = decodeNewsEntities(rawTitle);
                    const urlMatch = item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '';
                    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '';
                    const source = decodeNewsEntities(item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || 'Institutional Wire');
                    if (!title) continue;

                    const timestamp = Date.parse(pubDate) || Date.now();
                    let sentiment = 'Neutral';
                    const bullishTerms = [
                        'bullish', 'positive', 'rise', 'rises', 'rising', 'gain', 'gains',
                        'surge', 'surges', 'jump', 'jumps', 'strong', 'growth', 'rally',
                        'rallying', 'rebound', 'recover', 'recovery', 'record high',
                        'beats', 'beat estimates', 'outlook raised', 'rate cut',
                        'easing', 'stimulus', 'boost', 'advance', 'soar', 'soars'
                    ];
                    const bearishTerms = [
                        'bearish', 'negative', 'fall', 'falls', 'falling', 'down', 'drop',
                        'drops', 'plunge', 'plunges', 'loss', 'losses', 'weak', 'weakness',
                        'crisis', 'crash', 'selloff', 'sell-off', 'decline', 'declines',
                        'recession', 'crisis', 'tariff', 'tariffs', 'rate hike',
                        'cut forecast', 'downgrade', 'downgrades', 'slump', 'slumps',
                        'warning', 'warns', 'tumble', 'tumbles'
                    ];
                    const lowerTitle = title.toLowerCase();
                    const bullishScore = bullishTerms.filter(term => lowerTitle.includes(term)).length;
                    const bearishScore = bearishTerms.filter(term => lowerTitle.includes(term)).length;
                    if (bullishScore > bearishScore) sentiment = 'Bullish';
                    if (bearishScore > bullishScore) sentiment = 'Bearish';

                    combined.push({
                        title,
                        url: decodeNewsEntities(urlMatch),
                        source,
                        timestamp,
                        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        sentiment
                    });
                }
            }

            const news = combined
                .sort((a, b) => b.timestamp - a.timestamp)
                .filter((item, index, rows) => rows.findIndex(row => row.title === item.title) === index)
                .filter(item => Number.isFinite(item.timestamp) && Date.now() - item.timestamp <= 36 * 60 * 60 * 1000)
                .slice(0, 18);

            if (!news.length) throw new Error('All News Feeds Offline');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, news }));
        } catch (e) {
            console.error('[News] Live feed failure:', e.message);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Institutional News Offline' }));
        }
    } else if (req.url === '/api/ai-chat' && req.method === 'POST') {
        try {
            const body = await readRequestBody(req);
            const messages = Array.isArray(body.messages) ? body.messages : [];
            const openAiKey = req.headers['x-api-key'] || process.env.VITE_OPENAI_KEY;
            const deepSeekKey = process.env.VITE_DEEPSEEK_API_KEY;
            const apiKey = openAiKey || deepSeekKey;
            if (!apiKey) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'AI API key missing' }));
            }

            const useOpenAi = Boolean(openAiKey);
            const baseUrl = useOpenAi
                ? 'https://api.openai.com/v1'
                : (process.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/$/, '');
            const model = useOpenAi ? 'gpt-4o-mini' : (process.env.VITE_AI_MODEL || 'deepseek-chat');
            const aiRes = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model, messages, temperature: 0.7 })
            });
            const aiData = await aiRes.json();
            if (!aiRes.ok) throw new Error(aiData?.error?.message || `AI provider returned ${aiRes.status}`);

            const content = aiData?.choices?.[0]?.message?.content;
            if (!content) throw new Error('AI provider returned no response');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: content }));
        } catch (e) {
            console.error('[AI Chat] Failure:', e.message);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
        }
    } else if (req.url.startsWith('/api/fred')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const series_id = url.searchParams.get('series_id');
        const limit = url.searchParams.get('limit') || '2';
        const units = url.searchParams.get('units') || 'lin';
        const FRED_KEY = process.env.FRED_KEY || process.env.VITE_FRED_KEY || '';

        if (!series_id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing series_id' }));
        }

        try {
            const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=${limit}&units=${units}`;
            const data = await fetchJson(fredUrl);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) {
            console.error(`[FRED] Error fetching ${series_id}:`, e.message);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `FRED unavailable: ${e.message}`, series_id }));
        }
    } else if (req.url.startsWith('/api/snatcher')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const symbol = url.searchParams.get('symbol');
        
        const TICKERS = {
            'US30': '%5EDJI', 'SP500': '%5EGSPC', 'NASDAQ': '%5EIXIC',
            'DAX': '%5EGDAXI', 'NIKKEI': '%5EN225',
            'USOIL': 'CL=F', 'UKOIL': 'BZ=F', 'GOLD': 'GC=F',
            'SILVER': 'SI=F', 'COPPER': 'HG=F',
            'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'AUDUSD': 'AUDUSD=X',
            'USDJPY': 'USDJPY=X', 'USDCAD': 'USDCAD=X', 'USDCHF': 'USDCHF=X',
            'GBPJPY': 'GBPJPY=X', 'GBPNZD': 'GBPNZD=X', 'NZDUSD': 'NZDUSD=X'
        };
        
        const BASELINES = {
            'GOLD': [2000, 7000], 'SILVER': [20, 150], 'USOIL': [40, 250], 'UKOIL': [40, 250],
            'COPPER': [1, 15], 'US30': [30000, 70000], 'SP500': [4000, 12000],
            'NASDAQ': [15000, 40000], 'DAX': [15000, 40000], 'NIKKEI': [35000, 85000],
            'EURUSD': [0.8, 1.5], 'GBPUSD': [0.9, 1.8], 'AUDUSD': [0.4, 1.0],
            'USDJPY': [70, 200], 'USDCAD': [1.1, 1.6], 'USDCHF': [0.7, 1.2],
            'GBPJPY': [150, 250], 'GBPNZD': [1.5, 2.8], 'NZDUSD': [0.4, 0.9]
        };

        if (!symbol || !TICKERS[symbol]) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid Institutional Target' }));
        }

        const ticker = TICKERS[symbol];
        
        try {
            // Stage 1: Absolute JSON Ingestion
            const yahooUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`;
            const response = await fetchJson(yahooUrl, { 'User-Agent': 'Mozilla/5.0' });
            const data = response.quoteSummary?.result?.[0]?.price;
            
            if (!data) throw new Error('No price data in response');
            
            const price = data.regularMarketPrice?.raw;
            const change24h = data.regularMarketChangePercent?.raw * 100;
            
            if (price === undefined) throw new Error('Price undefined');
            
            // Stage 2: Sentinel Audit
            const range = BASELINES[symbol];
            if (range && (price < range[0] || price > range[1])) {
                throw new Error(`Sentinel: 2026 Parity Break for ${symbol} @ ${price}`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                price,
                change24h,
                lastUpdated: Date.now(),
                source: 'Institutional-JSON-V24'
            }));

        } catch (error) {
            console.error(`[ReaperSnatcher] ${symbol} Blackout:`, error.message);
            
            // Stage 3: Secondary Node Fallback
            try {
                const altUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
                const altRes = await fetchJson(altUrl, { 'User-Agent': 'Mozilla/5.0' });
                const meta = altRes.chart?.result?.[0]?.meta;
                
                if (!meta) throw new Error('No meta in fallback response');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    price: meta.regularMarketPrice,
                    change24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                    lastUpdated: Date.now(),
                    source: 'Institutional-JSON-Fallback'
                }));
            } catch (e2) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Global Blackout', detail: 'Primary and Secondary nodes failed to synchronize.' }));
            }
        }
    } else if (req.url.startsWith('/api/crypto')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const action = url.searchParams.get('action') || 'price';

        // CoinGecko's free tier rate-limits aggressively; cache to protect the UI.
        const cryptoPriceCache = globalThis.__cryptoPriceCache || (globalThis.__cryptoPriceCache = { data: null, ts: 0 });
        const cryptoHistoryCache = globalThis.__cryptoHistoryCache || (globalThis.__cryptoHistoryCache = new Map());

        // Yahoo fallback keeps prices live when CoinGecko returns 429.
        const YAHOO_CRYPTO = {
            'bitcoin': 'BTC-USD',
            'ethereum': 'ETH-USD',
            'solana': 'SOL-USD',
            'pax-gold': 'GC=F'
        };

        async function yahooCryptoPrice(id) {
            const symbol = YAHOO_CRYPTO[id];
            if (!symbol) return null;
            try {
                const data = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`, { 'User-Agent': 'Mozilla/5.0' });
                const meta = data.chart?.result?.[0]?.meta;
                if (!meta || typeof meta.regularMarketPrice !== 'number') return null;
                const prev = meta.chartPreviousClose ?? meta.previousClose;
                return {
                    usd: meta.regularMarketPrice,
                    usd_24h_change: typeof prev === 'number' && prev > 0 ? ((meta.regularMarketPrice - prev) / prev) * 100 : 0
                };
            } catch (e) {
                return null;
            }
        }

        try {
            if (action === 'price') {
                const ids = (url.searchParams.get('ids') || 'bitcoin,ethereum,solana,pax-gold')
                    .split(',').map(s => s.trim()).filter(Boolean);

                if (cryptoPriceCache.data && (Date.now() - cryptoPriceCache.ts) < 30000) {
                    const cached = {};
                    for (const id of ids) if (cryptoPriceCache.data[id]) cached[id] = cryptoPriceCache.data[id];
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify(cached));
                }

                let prices = {};
                try {
                    prices = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=usd&include_24hr_change=true`, { 'accept': 'application/json', 'User-Agent': 'Mozilla/5.0' });
                } catch (cgError) {
                    console.error('[Crypto] CoinGecko price failed:', cgError.message);
                }

                for (const id of ids) {
                    if (!prices[id]) {
                        const fallback = await yahooCryptoPrice(id);
                        if (fallback) prices[id] = fallback;
                    }
                }

                if (Object.keys(prices).length === 0) throw new Error('All crypto price sources failed');

                cryptoPriceCache.data = { ...(cryptoPriceCache.data || {}), ...prices };
                cryptoPriceCache.ts = Date.now();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(prices));
            } else if (action === 'history') {
                const id = url.searchParams.get('id') || 'bitcoin';
                const days = url.searchParams.get('days') || '30';
                const cacheKey = `${id}-${days}`;
                const cached = cryptoHistoryCache.get(cacheKey);
                if (cached && (Date.now() - cached.ts) < 300000) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify(cached.data));
                }

                let data;
                try {
                    data = await fetchJson(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`, { 'accept': 'application/json', 'User-Agent': 'Mozilla/5.0' });
                } catch (cgError) {
                    console.error('[Crypto] CoinGecko history failed:', cgError.message);
                    const symbol = YAHOO_CRYPTO[id];
                    if (!symbol) throw cgError;
                    const yahoo = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${encodeURIComponent(days)}d`, { 'User-Agent': 'Mozilla/5.0' });
                    const result = yahoo.chart?.result?.[0];
                    const timestamps = result?.timestamp || [];
                    const closes = result?.indicators?.quote?.[0]?.close || [];
                    data = {
                        prices: timestamps
                            .map((ts, i) => [ts * 1000, closes[i]])
                            .filter(pair => typeof pair[1] === 'number')
                    };
                }

                cryptoHistoryCache.set(cacheKey, { ts: Date.now(), data });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid action' }));
            }
        } catch (e) {
            console.error('[Crypto] Error:', e.message);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Crypto feed unavailable', detail: e.message }));
        }
    } else if (req.url.startsWith('/api/polymarket')) {
        try {
            const polymarketUrl = 'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=60';
            const data = await fetchJson(polymarketUrl, { 
                'User-Agent': 'Mozilla/5.0', 
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br'
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (e) {
            console.error('[Polymarket] Error:', e.message);
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Polymarket API unavailable', detail: e.message }));
        }
    } else if (req.url.startsWith('/api/cot-history')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const symbol = url.searchParams.get('symbol');
        
        if (!symbol) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Symbol required' }));
        }

        const cftcMap = {
            'EURUSD': ['EURO FX', 'CHICAGO MERCANTILE EXCHANGE'],
            'GBPUSD': ['BRITISH POUND', 'CHICAGO MERCANTILE EXCHANGE'],
            'USDJPY': ['JAPANESE YEN', 'CHICAGO MERCANTILE EXCHANGE'],
            'USDCAD': ['CANADIAN DOLLAR', 'CHICAGO MERCANTILE EXCHANGE'],
            'AUDUSD': ['AUSTRALIAN DOLLAR', 'CHICAGO MERCANTILE EXCHANGE'],
            'NZDUSD': ['NEW ZEALAND DOLLAR', 'CHICAGO MERCANTILE EXCHANGE'],
            'USDCHF': ['SWISS FRANC', 'CHICAGO MERCANTILE EXCHANGE'],
            'SP500': ['E-MINI S&P 500', 'CHICAGO MERCANTILE EXCHANGE'],
            'NASDAQ': ['E-MINI NASDAQ-100', 'CHICAGO MERCANTILE EXCHANGE'],
            'US30': ['E-MINI DOW JONES', 'CHICAGO BOARD OF TRADE'],
            'NIKKEI': ['NIKKEI 225', 'CHICAGO MERCANTILE EXCHANGE'],
            'DAX': ['E-MINI DAX', 'CHICAGO MERCANTILE EXCHANGE'],
            'GOLD': ['GOLD', 'COMMODITY EXCHANGE'],
            'SILVER': ['SILVER', 'COMMODITY EXCHANGE'],
            'COPPER': ['COPPER-GRADE #1', 'COMMODITY EXCHANGE'],
            'USOIL': ['CRUDE OIL, LIGHT SWEET', 'NEW YORK MERCANTILE EXCHANGE'],
            'UKOIL': ['BRENT', 'ICE FUTURES EUROPE'],
            'BITCOIN': ['BITCOIN', 'CHICAGO MERCANTILE EXCHANGE'],
            'ETHEREUM': ['ETHER', 'CHICAGO MERCANTILE EXCHANGE']
        };

        const cftcNames = cftcMap[symbol.toUpperCase()];
        if (!cftcNames) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Symbol not mapped for COT history' }));
        }

        try {
            const nameFilter = cftcNames.map(n => `market_and_exchange_names LIKE '%${n}%'`).join(' AND ');
            const query = `$limit=5000&$where=(${encodeURIComponent(nameFilter)})&$order=report_date_as_yyyy_mm_dd DESC`;

            const datasets = [
                '6dca-aqww',
                'dea3-kfc2',
                'gpe5-46if'
            ];

            const allResults = await Promise.allSettled(
                datasets.map(ds => fetchJson(`https://publicreporting.cftc.gov/resource/${ds}.json?${query}`))
            );

            let rawData = [];
            for (const result of allResults) {
                if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                    rawData.push(...result.value);
                }
            }

            const filtered = rawData.filter(row => 
                row.market_and_exchange_names && 
                cftcNames.some(name => row.market_and_exchange_names.includes(name))
            );

            // Group by date and pick the one with the highest speculative volume
            const groupedByDate = filtered.reduce((acc, row) => {
                const date = row.report_date_as_yyyy_mm_dd.split('T')[0];
                const currentVol = parseFloat(
                    row.asset_mgr_positions_long_all || 
                    row.asset_mgr_positions_long || 
                    row.noncomm_positions_long_all || 
                    row.lev_money_positions_long_all || 
                    row.lev_money_positions_long || 0
                );
                
                if (!acc[date] || currentVol > acc[date].vol) {
                    acc[date] = { row, vol: currentVol };
                }
                return acc;
            }, {});

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
            const history = sortedDates.map((date, index) => {
                const row = groupedByDate[date].row;

                const ncLong = parseFloat(
                    row.asset_mgr_positions_long_all || 
                    row.asset_mgr_positions_long || 
                    row.noncomm_positions_long_all || 
                    row.lev_money_positions_long_all || 
                    row.lev_money_positions_long
                ) || 0;
                const ncShort = parseFloat(
                    row.asset_mgr_positions_short_all || 
                    row.asset_mgr_positions_short || 
                    row.noncomm_positions_short_all || 
                    row.lev_money_positions_short_all || 
                    row.lev_money_positions_short
                ) || 0;
                const cLong = parseFloat(
                    row.comm_positions_long_all || 
                    row.comm_positions_long || 
                    row.dealer_positions_long_all || 
                    row.dealer_positions_long
                ) || 0;
                const cShort = parseFloat(
                    row.comm_positions_short_all || 
                    row.comm_positions_short || 
                    row.dealer_positions_short_all || 
                    row.dealer_positions_short
                ) || 0;
                
                const total = ncLong + ncShort;
                let longPct = total > 0 ? (ncLong / total) * 100 : 50;
                let shortPct = 100 - longPct;

                // Inversion Logic for USD-Quote pairs
                if (['USDJPY', 'USDCHF', 'USDCAD'].includes(symbol.toUpperCase())) {
                    [longPct, shortPct] = [shortPct, longPct];
                }
                
                const nextDate = sortedDates[index + 1];
                const nextRow = nextDate ? groupedByDate[nextDate].row : null;

                let deltaLong = 0;
                let deltaShort = 0;
                let prevLongPct = 50;
                
                if (nextRow) {
                    const nL = parseFloat(
                        nextRow.asset_mgr_positions_long_all || 
                        nextRow.asset_mgr_positions_long || 
                        nextRow.noncomm_positions_long_all || 
                        nextRow.lev_money_positions_long_all || 
                        nextRow.lev_money_positions_long
                    ) || 0;
                    const nS = parseFloat(
                        nextRow.asset_mgr_positions_short_all || 
                        nextRow.asset_mgr_positions_short || 
                        nextRow.noncomm_positions_short_all || 
                        nextRow.lev_money_positions_short_all || 
                        nextRow.lev_money_positions_short
                    ) || 0;
                    deltaLong = ncLong - nL;
                    deltaShort = ncShort - nS;
                    const nTotal = nL + nS;
                    if (nTotal > 0) {
                        let pLP = (nL / nTotal) * 100;
                        let pSP = 100 - pLP;
                        if (['USDJPY', 'USDCHF', 'USDCAD'].includes(symbol.toUpperCase())) {
                            [pLP, pSP] = [pSP, pLP];
                        }
                        prevLongPct = pLP;
                    }
                }

                return {
                    date,
                    long: ncLong,
                    short: ncShort,
                    nonCommLong: ncLong,
                    nonCommShort: ncShort,
                    commLong: cLong,
                    commShort: cShort,
                    longPct,
                    shortPct,
                    netPosition: longPct > 50 ? (ncLong - ncShort) : (ncShort - ncLong),
                    deltaLong,
                    deltaShort,
                    netChangePct: longPct - prevLongPct
                };
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, symbol, history }));
        } catch (error) {
            console.error('[COT History API] Error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Institutional Feed (CFTC) Failure' }));
        }
    } else {
        res.writeHead(404).end();
    }
});

server.listen(PORT, () => console.log(`Local API server running on http://localhost:${PORT}`));