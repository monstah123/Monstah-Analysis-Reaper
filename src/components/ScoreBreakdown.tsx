import React from 'react';
import type { AssetData } from '../data/mockData';

const METRICS: { key: keyof AssetData; label: string }[] = [
  { key: 'cot', label: 'COT' },
  { key: 'retailPos', label: 'Retail Positioning' },
  { key: 'seasonality', label: 'Seasonality' },
  { key: 'trend', label: 'Trend' },
  { key: 'gdp', label: 'GDP' },
  { key: 'mPMI', label: 'Manufacturing PMI' },
  { key: 'sPMI', label: 'Services PMI' },
  { key: 'retailSales', label: 'Retail Sales' },
  { key: 'inflation', label: 'Inflation (CPI)' },
  { key: 'employmentChange', label: 'Employment Change' },
  { key: 'unemploymentRate', label: 'Unemployment Rate' },
  { key: 'interestRates', label: 'Interest Rates' },
];

const getBarColor = (v: number) => {
  if (v >= 2) return '#2563eb';
  if (v === 1) return '#3b82f6';
  if (v === -1) return '#ef4444';
  if (v <= -2) return '#dc2626';
  return '#374151';
};

const getLabel = (v: number) => {
  if (v >= 2) return 'Strong Bullish';
  if (v === 1) return 'Mild Bullish';
  if (v === -1) return 'Mild Bearish';
  if (v <= -2) return 'Strong Bearish';
  return 'Neutral';
};

const ScoreBreakdown: React.FC<{ asset: AssetData }> = ({ asset }) => (
  <div className="score-breakdown">
    {METRICS.map(({ key, label }) => {
      const v = asset[key] as number;
      const pct = ((v + 2) / 4) * 100; // -2..+2 → 0..100%
      const color = getBarColor(v);
      return (
        <div key={String(key)} className="breakdown-row">
          <span className="breakdown-label">{label}</span>
          <div className="breakdown-bar-track">
            <div
              className="breakdown-bar-fill"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          <span className="breakdown-value" style={{ color }}>
            {v > 0 ? `+${v}` : v}
          </span>
          <span className="breakdown-tag">{getLabel(v)}</span>
        </div>
      );
    })}
  </div>
);

export default ScoreBreakdown;
