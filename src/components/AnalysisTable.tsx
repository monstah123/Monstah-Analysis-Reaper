import React from 'react';
import type { AssetData } from '../data/mockData';

interface MetricCellProps {
  value: number;
}

const getValueClass = (value: number): string => {
  if (value >= 2) return 'val-pos-high';
  if (value === 1) return 'val-pos-mid';
  if (value === -1) return 'val-neg-mid';
  if (value <= -2) return 'val-neg-high';
  return 'val-neutral';
};

const getBiasClass = (bias: AssetData['bias']): string => {
  const map: Record<AssetData['bias'], string> = {
    'Very Bullish': 'bias-very-bullish',
    Bullish: 'bias-bullish',
    Neutral: 'bias-neutral',
    Bearish: 'bias-bearish',
    'Very Bearish': 'bias-very-bearish',
  };
  return map[bias];
};

const MetricCell: React.FC<MetricCellProps> = ({ value }) => (
  <td className="metric-cell">
    <span className={`metric-pill ${getValueClass(value)}`}>
      {value > 0 ? `+${value}` : value}
    </span>
  </td>
);

interface AnalysisTableProps {
  assets: AssetData[];
  onRowClick?: (asset: AssetData) => void;
}

const columns = [
  { key: 'cot', label: 'COT' },
  { key: 'retailPos', label: 'Retail' },
  { key: 'seasonality', label: 'Season' },
  { key: 'trend', label: 'Trend' },
  { key: 'gdp', label: 'GDP' },
  { key: 'mPMI', label: 'mPMI' },
  { key: 'sPMI', label: 'sPMI' },
  { key: 'retailSales', label: 'R.Sales' },
  { key: 'inflation', label: 'CPI' },
  { key: 'employmentChange', label: 'Employ.' },
  { key: 'unemploymentRate', label: 'Unemp.' },
  { key: 'interestRates', label: 'Rates' },
];

const getScoreColor = (score: number): string => {
  if (score >= 8) return '#3b82f6';
  if (score >= 5) return '#6366f1';
  if (score >= 2) return '#84cc16';
  if (score >= -1) return '#94a3b8';
  if (score >= -5) return '#f97316';
  return '#ef4444';
};

const AnalysisTable: React.FC<AnalysisTableProps> = ({ assets, onRowClick }) => {
  return (
    <div className="table-container">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="th-asset">Asset</th>
              <th className="th-bias">Bias</th>
              <th className="th-score">Score</th>
              {columns.map((col) => (
                <th key={col.key} className="th-metric">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.id} className="table-row" style={{ animationDelay: `${index * 60}ms`, cursor: onRowClick ? 'pointer' : 'default' }} onClick={() => onRowClick?.(asset)}>
                <td className="td-asset">
                  <div className="asset-info">
                    <span className="asset-rank">#{index + 1}</span>
                    <span className="asset-name">{asset.name}</span>
                  </div>
                </td>
                <td className="td-bias">
                  <span className={`bias-badge ${getBiasClass(asset.bias)}`}>
                    {asset.bias}
                  </span>
                </td>
                <td className="td-score">
                  <span
                    className="score-pill"
                    style={{ '--score-color': getScoreColor(asset.score) } as React.CSSProperties}
                  >
                    {asset.score > 0 ? `+${asset.score}` : asset.score}
                  </span>
                </td>
                {columns.map((col) => (
                  <MetricCell key={col.key} value={asset[col.key as keyof AssetData] as number} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalysisTable;
