const BASE = 'https://api.frankfurter.dev/v1';

export interface ForexRate {
  rate: number;
  change: number;
  changePct: number;
}

/** Fetch current exchange rate for a forex pair using Alpha Vantage (Live) or Frankfurter (Backup) */
export async function fetchForexRate(
  from: string,
  to: string,
  apiKey?: string,
): Promise<ForexRate> {
  // 1. Try Alpha Vantage (High Conviction Live Tick)
  if (apiKey) {
    try {
      const avUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
      const res = await fetch(avUrl);
      const json = await res.json();
      const rateStr = json['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
      if (rateStr) {
        return { rate: parseFloat(rateStr), change: 0, changePct: 0 };
      }
    } catch (e) {
      console.warn('[AV Proxy] Alpha Vantage failed, falling back to Frankfurter:', e);
    }
  }

  // 2. Fallback to Frankfurter (Institutional ECB Snapshot)
  const url = `${BASE}/latest?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forex Feed error ${res.status}`);
  const json = await res.json();
  const rate = json.rates?.[to];
  if (!rate) throw new Error('Forex Feed: no rate data');
  return { rate, change: 0, changePct: 0 };
}

/** Fetch daily FX history for sparkline (last N days) */
export async function fetchForexHistory(
  from: string,
  to: string,
  days = 30,
): Promise<{ date: string; value: number }[]> {
  const d = new Date();
  const endDate = d.toISOString().split('T')[0];
  d.setDate(d.getDate() - (days + 20)); // Buffer to get enough trading days
  const startDate = d.toISOString().split('T')[0];
  
  const url = `${BASE}/${startDate}..${endDate}?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frankfurter FX_DAILY error ${res.status}`);
  const json = await res.json();
  const series = json.rates ?? {};
  
  const entries = Object.entries(series);
  return entries
    .map(([date, rates]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: rates[to] as number,
    }));
}

export interface NewsHeadline {
  id: string;
  time: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sentiment: string;
  sentimentScore: number;
}

/** Fetch news sentiment via Alpha Vantage */
export async function fetchNewsSentiment(apiKey: string, limit = 20): Promise<NewsHeadline[]> {
  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=${limit}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`News Feed error ${res.status}`);
  const json = await res.json();
  const feed = json.feed ?? [];
  
  return feed.map((item: any, idx: number) => {
    // Parser for Alpha Vantage time: 20240404T133012 -> 13:30:12
    const rawTime = item.time_published ?? '';
    let timeDisplay = rawTime;
    if (rawTime.length >= 15) {
      const h = rawTime.substring(9, 11);
      const m = rawTime.substring(11, 13);
      const s = rawTime.substring(13, 15);
      timeDisplay = `${h}:${m}:${s}`;
    }
    
    return {
      id: `${idx}-${rawTime}`,
      time: timeDisplay,
      title: item.title,
      summary: item.summary,
      url: item.url,
      source: item.source,
      sentiment: item.overall_sentiment_label,
      sentimentScore: item.overall_sentiment_score,
    };
  });
}

/** Fetch live stock/index quote via Alpha Vantage */
export async function fetchStockQuote(symbol: string, apiKey: string): Promise<{ price: number; change24h: number; lastUpdated: number }> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stock Quote error ${res.status}`);
  const json = await res.json();
  const quote = json['Global Quote'];
  if (!quote) throw new Error('No data found for symbol ' + symbol);

  return {
    price: parseFloat(quote['05. price']),
    change24h: parseFloat(quote['10. change percent'].replace('%', '')),
    lastUpdated: Date.now()
  };
}
