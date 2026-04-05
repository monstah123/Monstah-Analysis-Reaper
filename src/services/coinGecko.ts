// Uses our internal /api/crypto proxy to avoid 429 errors from CoinGecko

export interface CoinPrice {
  usd: number;
  usd_24h_change: number;
}

/** Fetch current USD prices for multiple coin IDs */
export async function fetchCryptoPrices(ids: string[]): Promise<Record<string, CoinPrice>> {
  if (!ids.length) return {};
  const url = `/api/crypto?action=price&ids=${ids.join(',')}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko proxy error ${res.status}`);
  return res.json();
}

/** Fetch 30-day price history for a single coin */
export async function fetchCryptoPriceHistory(
  id: string,
  days = 30,
): Promise<{ date: string; value: number }[]> {
  const url = `/api/crypto?action=history&id=${id}&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko history proxy error ${res.status}`);
  
  const json = await res.json();
  const prices = json.prices ?? [];
  return prices.map(([timestamp, price]: [number, number]) => ({
    date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: +price.toFixed(2),
  }));
}
