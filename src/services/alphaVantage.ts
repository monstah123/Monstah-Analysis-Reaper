const BASE = 'https://api.frankfurter.app';

export interface ForexRate {
  rate: number;
  change: number;
  changePct: number;
}

/** Fetch current exchange rate for a forex pair using Frankfurter (No API Key Required) */
export async function fetchForexRate(
  from: string,
  to: string,
): Promise<ForexRate> {
  const url = `${BASE}/latest?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frankfurter error ${res.status}`);
  const json = await res.json();
  const rate = json.rates[to];
  if (!rate) throw new Error('Frankfurter: no rate data');
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
  
  return Object.entries(series)
    .slice(-days)
    .map(([date, rates]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: rates[to] as number,
    }));
}
