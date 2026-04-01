const BASE = 'https://api.coingecko.com/api/v3';

export interface CoinPrice {
  usd: number;
  usd_24h_change: number;
}

/** Fetch current USD prices for multiple coin IDs */
export async function fetchCryptoPrices(ids: string[]): Promise<Record<string, CoinPrice>> {
  if (!ids.length) return {};
  const url = `${BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
  return res.json();
}

/** Fetch 30-day price history for a single coin */
export async function fetchCryptoPriceHistory(
  id: string,
  days = 30,
): Promise<{ date: string; value: number }[]> {
  const url = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko history error ${res.status}`);
  const json: { prices: [number, number][] } = await res.json();
  return json.prices.map(([ts, price]) => ({
    date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: +price.toFixed(2),
  }));
}
