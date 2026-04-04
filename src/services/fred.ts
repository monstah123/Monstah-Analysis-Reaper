const BASE = 'https://api.stlouisfed.org/fred/series/observations';

/** Key FRED series IDs for US macro data */
export const FRED_SERIES = {
  GDP_GROWTH: 'A191RL1Q225SBEA',   // Real GDP Growth (quarterly)
  CPI: 'CPIAUCSL',                  // Consumer Price Index (monthly)
  UNEMPLOYMENT: 'UNRATE',           // Unemployment Rate (monthly)
  FED_FUNDS: 'FEDFUNDS',            // Federal Funds Rate (monthly)
  RETAIL_SALES: 'RSAFS',            // Advance Retail Sales (monthly)
  NONFARM_PAYROLLS: 'PAYEMS',       // Nonfarm Payroll Employment (monthly)
  // Institutional COT (Non-Commercial Speculative Positions)
  COT_EUR_L: 'CFTC_103601_F_L_NC', 
  COT_EUR_S: 'CFTC_103601_F_S_NC',
  COT_GBP_L: 'CFTC_133741_F_L_NC',
  COT_GBP_S: 'CFTC_133741_F_S_NC',
  COT_JPY_L: 'CFTC_097741_F_L_NC',
  COT_JPY_S: 'CFTC_097741_F_S_NC',
  COT_AUD_L: 'CFTC_232741_F_L_NC',
  COT_AUD_S: 'CFTC_232741_F_S_NC',
  COT_GOLD_L: 'CFTC_088691_F_L_NC',
  COT_GOLD_S: 'CFTC_088691_F_S_NC',
} as const;

export type FredSeriesKey = keyof typeof FRED_SERIES;

export interface FredObservation {
  date: string;
  value: number;
}

/** Fetch latest N observations for a FRED series */
export async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  limit = 2,
  units = 'lin' // 'lin' = levels, 'pc1' = % change from year ago
): Promise<FredObservation[]> {
  const url = `${BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}&units=${units}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED error ${res.status}`);
  const json = await res.json();
  return (json.observations ?? [])
    .filter((o: { value: string }) => o.value !== '.')
    .map((o: { date: string; value: string }) => ({
      date: o.date,
      value: parseFloat(o.value),
    }));
}

/** Fetch all tracked macro indicators in one call */
export async function fetchAllFredData(
  apiKey: string,
): Promise<Record<FredSeriesKey, FredObservation[]>> {
  const entries = await Promise.allSettled(
    (Object.entries(FRED_SERIES) as [FredSeriesKey, string][]).map(async ([key, id]) => {
      // For CPI, we typically want YoY inflation rate, so we request 'pc1'
      const units = key === 'CPI' ? 'pc1' : 'lin';
      const data = await fetchFredSeries(id, apiKey, 2, units);
      return [key, data] as const;
    }),
  );

  return Object.fromEntries(
    entries
      .filter((r): r is PromiseFulfilledResult<readonly [FredSeriesKey, FredObservation[]]> => r.status === 'fulfilled')
      .map((r) => r.value),
  ) as Record<FredSeriesKey, FredObservation[]>;
}
