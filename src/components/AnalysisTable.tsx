import React from 'react';
import type { AssetData } from '../data/mockData';

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

interface AnalysisTableProps {
  assets: AssetData[];
  onRowClick?: (asset: AssetData) => void;
}

const columns = [
  { key: 'cot', label: 'COT', hideMobile: false },
  { key: 'retailPos', label: 'Retail', hideMobile: false },
  { key: 'seasonality', label: 'Season', hideMobile: false },
  { key: 'trend', label: 'Trend', hideMobile: false },
  { key: 'gdp', label: 'GDP', hideMobile: true },
  { key: 'mPMI', label: 'mPMI', hideMobile: true },
  { key: 'sPMI', label: 'sPMI', hideMobile: true },
  { key: 'retailSales', label: 'R.Sales', hideMobile: true },
  { key: 'inflation', label: 'CPI', hideMobile: true },
  { key: 'employmentChange', label: 'Employ.', hideMobile: true },
  { key: 'unemploymentRate', label: 'Unemp.', hideMobile: true },
  { key: 'interestRates', label: 'Rates', hideMobile: true },
];

const getScoreColor = (score: number): string => {
  if (score >= 8) return '#22c55e'; // Green for Very Bullish (Monstah Style)
  if (score >= 5) return '#4ade80'; 
  if (score >= 2) return '#84cc16';
  if (score >= -1) return '#94a3b8';
  if (score >= -5) return '#f9b17a';
  return '#ef4444'; // Red for Bearish
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
                <th key={col.key} className={`th-metric ${col.hideMobile ? 'hide-mobile' : ''}`}>
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
                    <span className={`asset-name ${asset.score > 0 ? 'text-pos' : asset.score < 0 ? 'text-neg' : ''}`}>
                      {asset.name}
                    </span>
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
                  <td key={col.key} className={`metric-cell ${col.hideMobile ? 'hide-mobile' : ''}`}>
                    <span className={`metric-pill ${getValueClass(asset[col.key as keyof AssetData] as number)}`}>
                      {(asset[col.key as keyof AssetData] as number) > 0 ? `+${asset[col.key as keyof AssetData]}` : asset[col.key as keyof AssetData]}
                    </span>
                  </td>
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
