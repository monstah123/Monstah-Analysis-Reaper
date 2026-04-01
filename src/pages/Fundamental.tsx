import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';

type MetricTab = 'gdp' | 'inflation' | 'employmentChange' | 'interestRates' | 'mPMI';

const METRIC_LABELS: Record<MetricTab, string> = {
  gdp: 'GDP Growth',
  inflation: 'Inflation (CPI)',
  employmentChange: 'Employment Change',
  interestRates: 'Interest Rates',
  mPMI: 'Manufacturing PMI'
};

const Fundamental: React.FC = () => {
  const { assets } = useApp();
  const [activeMetric, setActiveMetric] = useState<MetricTab>('gdp');

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => b[activeMetric] - a[activeMetric]);
  }, [assets, activeMetric]);

  const MetricPill = ({ val }: { val: number }) => {
    let colorClass = 'val-neutral';
    if (val >= 2) colorClass = 'val-pos-high';
    if (val === 1) colorClass = 'val-pos-mid';
    if (val <= -2) colorClass = 'val-neg-high';
    if (val === -1) colorClass = 'val-neg-mid';
    
    return (
      <span className={`metric-pill ${colorClass}`} style={{ minWidth: '80px', fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
        {val > 0 ? `+${val} Bullish` : val < 0 ? `${val} Bearish` : 'Neutral'}
      </span>
    );
  };

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📊 Fundamental Tracker</h1>
          <p>Global economic heatmaps based on central bank data (GDP, CPI, NFP)</p>
        </div>
      </header>

      <div className="filter-bar" style={{ padding: '1rem 0', marginTop: '1rem' }}>
        <div className="bias-filter-group" style={{ gap: '0.5rem' }}>
          {(Object.keys(METRIC_LABELS) as MetricTab[]).map((m) => (
            <button
              key={m}
              className={`bias-filter-btn ${activeMetric === m ? 'active' : ''}`}
              onClick={() => setActiveMetric(m)}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              {METRIC_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '1.25rem 1.5rem', width: '30%' }}>Asset</th>
              <th style={{ padding: '1.25rem 1.5rem', width: '20%' }}>Category</th>
              <th style={{ padding: '1.25rem 1.5rem', width: '50%', textAlign: 'left' }}>{METRIC_LABELS[activeMetric]} Impact Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', animation: `fadeInRow 0.3s ease forwards`, animationDelay: `${i*30}ms`, opacity: 0 }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{a.name}</td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{a.category}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <MetricPill val={a[activeMetric]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fundamental;
