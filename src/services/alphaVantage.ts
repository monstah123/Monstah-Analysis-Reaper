const BASE = 'https://www.alphavantage.co/query';

export interface ForexRate {
  rate: number;
  change: number;
  changePct: number;
}

/** Fetch current exchange rate for a forex pair */
export async function fetchForexRate(
  from: string,
  to: string,
  apiKey: string,
): Promise<ForexRate> {
  const url = `${BASE}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Alpha Vantage error ${res.status}`);
  const json = await res.json();
  const data = json['Realtime Currency Exchange Rate'];
  if (!data) throw new Error('Alpha Vantage: no data (check API key or rate limit)');
  const rate = parseFloat(data['5. Exchange Rate']);
  // Alpha Vantage free tier doesn't give 24h change for FX, so we approximate 0
  return { rate, change: 0, changePct: 0 };
}

/** Fetch daily FX history for sparkline (last N days) */
export async function fetchForexHistory(
  from: string,
  to: string,
  apiKey: string,
  days = 30,
): Promise<{ date: string; value: number }[]> {
  const url = `${BASE}?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Alpha Vantage FX_DAILY error ${res.status}`);
  const json = await res.json();
  const series: Record<string, { '4. close': string }> = json['Time Series FX (Daily)'] ?? {};
  return Object.entries(series)
    .slice(0, days)
    .reverse()
    .map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(v['4. close']),
    }));
}
