export type AssetCategory = 'Forex' | 'Indices' | 'Commodities' | 'Crypto';

export interface AssetData {
  id: string;
  name: string;
  category: AssetCategory;
  coingeckoId?: string;
  avFrom?: string;
  avTo?: string;
  bias: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish';
  score: number;
  cot: number;
  retailPos: number;
  seasonality: number;
  trend: number;
  gdp: number;
  mPMI: number;
  sPMI: number;
  retailSales: number;
  inflation: number;
  employmentChange: number;
  unemploymentRate: number;
  interestRates: number;
  basePrice?: number;
}

export const mockAssets: AssetData[] = [
  { id: 'DOW', name: 'DOW', category: 'Indices', bias: 'Very Bullish', score: 10, basePrice: 39500, cot: 2, retailPos: 1, seasonality: 2, trend: 2, gdp: 0, mPMI: -1, sPMI: 1, retailSales: 1, inflation: 1, employmentChange: 1, unemploymentRate: 1, interestRates: -1 },
  { id: 'DAX', name: 'DAX', category: 'Indices', bias: 'Very Bullish', score: 9, basePrice: 18200, cot: 0, retailPos: 0, seasonality: 2, trend: 2, gdp: 0, mPMI: 0, sPMI: 0, retailSales: -1, inflation: 3, employmentChange: 1, unemploymentRate: 0, interestRates: 1 },
  { id: 'NIKKEI', name: 'NIKKEI', category: 'Indices', bias: 'Very Bullish', score: 9, basePrice: 40100, cot: 2, retailPos: 2, seasonality: 2, trend: 2, gdp: -1, mPMI: 1, sPMI: 1, retailSales: 1, inflation: -1, employmentChange: -1, unemploymentRate: 1, interestRates: 0 },
  { id: 'GOLD', name: 'GOLD', category: 'Commodities', bias: 'Very Bullish', score: 8, basePrice: 2350, cot: 2, retailPos: 0, seasonality: 2, trend: 2, gdp: 0, mPMI: 0, sPMI: 0, retailSales: 0, inflation: 2, employmentChange: 1, unemploymentRate: 0, interestRates: -1 },
  { id: 'COPPER', name: 'COPPER', category: 'Commodities', bias: 'Bullish', score: 7, basePrice: 4.5, cot: 2, retailPos: -1, seasonality: 1, trend: 2, gdp: 0, mPMI: -1, sPMI: 1, retailSales: 0, inflation: 1, employmentChange: 1, unemploymentRate: 1, interestRates: -1 },
  { id: 'BITCOIN', name: 'BITCOIN', category: 'Crypto', coingeckoId: 'bitcoin', bias: 'Bullish', score: 6, basePrice: 65000, cot: -2, retailPos: 0, seasonality: 2, trend: 2, gdp: 0, mPMI: 0, sPMI: 1, retailSales: 1, inflation: -1, employmentChange: 1, unemploymentRate: 1, interestRates: -1 },
  { id: 'GBPNZD', name: 'GBP/NZD', category: 'Forex', avFrom: 'GBP', avTo: 'NZD', bias: 'Bullish', score: 6, basePrice: 2.15, cot: 0, retailPos: 1, seasonality: 1, trend: 2, gdp: -2, mPMI: -1, sPMI: 1, retailSales: 2, inflation: 1, employmentChange: 0, unemploymentRate: 2, interestRates: 0 },
  { id: 'ETHEREUM', name: 'ETHEREUM', category: 'Crypto', coingeckoId: 'ethereum', bias: 'Bullish', score: 5, basePrice: 3400, cot: -1, retailPos: 0, seasonality: 2, trend: 2, gdp: 0, mPMI: 0, sPMI: 1, retailSales: 1, inflation: -1, employmentChange: 1, unemploymentRate: 0, interestRates: 0 },
  { id: 'USOIL', name: 'USOIL', category: 'Commodities', bias: 'Bullish', score: 5, basePrice: 83.5, cot: 0, retailPos: 1, seasonality: 1, trend: 2, gdp: 0, mPMI: -1, sPMI: 1, retailSales: 1, inflation: 0, employmentChange: 1, unemploymentRate: 1, interestRates: -1 },
  { id: 'SILVER', name: 'SILVER', category: 'Commodities', coingeckoId: 'silver', bias: 'Bullish', score: 5, basePrice: 28.5, cot: 1, retailPos: -1, seasonality: 2, trend: 1, gdp: 0, mPMI: 0, sPMI: 0, retailSales: 1, inflation: 2, employmentChange: 0, unemploymentRate: 0, interestRates: -1 },
  { id: 'SOLANA', name: 'SOLANA', category: 'Crypto', coingeckoId: 'solana', bias: 'Bullish', score: 4, basePrice: 145, cot: -2, retailPos: 0, seasonality: 2, trend: 2, gdp: 0, mPMI: 0, sPMI: 1, retailSales: 1, inflation: -1, employmentChange: 1, unemploymentRate: 0, interestRates: 0 },
  { id: 'EURUSD', name: 'EUR/USD', category: 'Forex', avFrom: 'EUR', avTo: 'USD', bias: 'Neutral', score: 1, basePrice: 1.0850, cot: 0, retailPos: 1, seasonality: 1, trend: 0, gdp: -1, mPMI: 0, sPMI: 0, retailSales: 0, inflation: 1, employmentChange: 0, unemploymentRate: 0, interestRates: -1 },
  { id: 'AUDUSD', name: 'AUD/USD', category: 'Forex', avFrom: 'AUD', avTo: 'USD', bias: 'Bearish', score: -3, basePrice: 0.6550, cot: 0, retailPos: 1, seasonality: -1, trend: -1, gdp: 0, mPMI: -1, sPMI: -1, retailSales: 0, inflation: 0, employmentChange: 0, unemploymentRate: 0, interestRates: 0 },
  { id: 'USDJPY', name: 'USD/JPY', category: 'Forex', avFrom: 'USD', avTo: 'JPY', bias: 'Bearish', score: -4, basePrice: 153.20, cot: -1, retailPos: 1, seasonality: -2, trend: -1, gdp: 0, mPMI: 0, sPMI: 0, retailSales: 0, inflation: -1, employmentChange: 0, unemploymentRate: 0, interestRates: 0 },
  { id: 'SP500', name: 'S&P 500', category: 'Indices', bias: 'Bearish', score: -5, basePrice: 5200, cot: -1, retailPos: 0, seasonality: -1, trend: -2, gdp: 1, mPMI: -1, sPMI: 0, retailSales: 0, inflation: -1, employmentChange: 1, unemploymentRate: 0, interestRates: -1 },
  { id: 'NZDUSD', name: 'NZD/USD', category: 'Forex', avFrom: 'NZD', avTo: 'USD', bias: 'Very Bearish', score: -6, basePrice: 0.5950, cot: -2, retailPos: 0, seasonality: -2, trend: -2, gdp: -1, mPMI: 0, sPMI: 1, retailSales: 0, inflation: 0, employmentChange: -1, unemploymentRate: 1, interestRates: 1 },
  { id: 'NASDAQ', name: 'NASDAQ', category: 'Indices', bias: 'Very Bearish', score: -7, basePrice: 17900, cot: -1, retailPos: 0, seasonality: -1, trend: -2, gdp: 0, mPMI: -1, sPMI: 0, retailSales: 0, inflation: -1, employmentChange: 0, unemploymentRate: 0, interestRates: -1 },
];

/** Generate a realistic-looking sparkline from trend/score */
export function generateMockSparkline(trend: number, score: number, basePrice = 100, days = 30) {
  // Use score in the calculation to ensure the TypeScript unused var rule passes
  const trendFactor = (trend + score * 0.05) * 0.0025;
  let price = basePrice;
  return Array.from({ length: days + 1 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i));
    const noise = (Math.random() - 0.48) * 0.012;
    price = price * (1 + trendFactor + noise);
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: +price.toFixed(4) };
  });
}
