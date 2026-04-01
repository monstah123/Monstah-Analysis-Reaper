const BASE = 'https://api.frankfurter.app';

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
    .slice(-days)
    .map(([date, rates]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: rates[to] as number,
    }));
}
