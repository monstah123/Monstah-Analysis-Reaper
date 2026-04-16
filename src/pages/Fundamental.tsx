import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const Fundamental: React.FC = () => {
  const { assets, macroData } = useApp();

  const getStatus = (label: string, val: number | null) => {
    if (val === null) {
      return { text: 'Syncing...', color: '#71717a' };
    }

    if (label === 'US Real GDP') {
      if (val >= 2.5) return { text: 'Robust', color: '#22c55e' };
      if (val >= 1.5) return { text: 'Stable', color: '#3b82f6' };
      if (val >= 0) return { text: 'Slowdown', color: '#f59e0b' };
      return { text: 'Contraction', color: '#ef4444' };
    }
    if (label === 'Inflation (CPI)') {
      if (val >= 3.5) return { text: 'Hot', color: '#ef4444' };
      if (val >= 2.5) return { text: 'Sticky', color: '#f59e0b' };
      if (val >= 1.8) return { text: 'Target', color: '#22c55e' };
      return { text: 'Disinflationary', color: '#3b82f6' };
    }
    if (label === 'Fed Funds Rate') {
      if (val >= 5.0) return { text: 'Restrictive', color: '#ef4444' };
      if (val >= 3.5) return { text: 'Neutral', color: '#3b82f6' };
      return { text: 'Accommodative', color: '#22c55e' };
    }
    if (label === 'Non-Farm Payrolls') {
      if (val >= 250) return { text: 'Hot', color: '#ef4444' };
      if (val >= 150) return { text: 'Robust', color: '#22c55e' };
      if (val >= 50) return { text: 'Cooling', color: '#f59e0b' };
      return { text: 'Weak', color: '#ef4444' };
    }

    return { text: 'Live', color: '#71717a' };
  };

  const sortedByScore = useMemo(() => {
    return [...assets].sort((a, b) => b.score - a.score);
  }, [assets]);

  const pillars = [
    { label: 'US Real GDP', val: macroData?.GDP ?? null, unit: '%', icon: '🏛️' },
    { label: 'Inflation (CPI)', val: macroData?.CPI ?? null, unit: '%', icon: '⛽' },
    { label: 'Fed Funds Rate', val: macroData?.FedRate ?? null, unit: '%', icon: '♟️' },
    { label: 'Non-Farm Payrolls', val: macroData?.NFP ?? null, unit: 'k', icon: '👷' },
  ];

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📊 Institutional Fundamental Matrix</h1>
          <p>Global economic pillars synchronized via BLS & FRED</p>
        </div>
      </header>

      <div className="stats-bar" style={{ padding: '1.5rem 0', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {pillars.map(p => {
          const status = getStatus(p.label, p.val);
          return (
            <div key={p.label} className="stat-card" style={{ border: '1px solid #1e2d48', background: 'rgba(15,22,35,0.4)', transition: 'all 0.3s ease' }}>
              <div className="stat-icon">{p.icon}</div>
              <div className="stat-body">
                <span className="stat-label" style={{ opacity: 0.6 }}>{p.label}</span>
                <span className="stat-value" style={{ color: p.val === null ? '#3f3f46' : status.color }}>
                  {p.val === null ? 'SYNC...' : `${p.val}${p.unit}`}
                </span>
                <span className="stat-sub" style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 700, color: status.color }}>
                  {status.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="settings-row-2" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {sortedByScore.slice(0, 12).map((a, i) => (
          <div key={a.id} className="settings-card" style={{ 
            animation: `fadeInRow 0.5s ease forwards`, 
            animationDelay: `${i*100}ms`, opacity: 0,
            background: 'linear-gradient(135deg, #111827 0%, #0f1623 100%)',
            border: '1px solid #1e2d48',
            transition: 'transform 0.3s ease, border-color 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{a.category === 'Crypto' ? '🪙' : a.category === 'Indices' ? '📉' : '🏦'}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{a.name}</h3>
                  <span style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>{a.id} • {a.category}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: a.score > 0 ? '#22c55e' : a.score < 0 ? '#ef4444' : '#71717a' }}>{a.score > 0 ? `+${a.score}` : a.score}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a' }}>REAPER SCORE</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#141b2d', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '4px' }}>GROWTH IMPACT</div>
                 <div style={{ fontSize: '14px', fontWeight: 700, color: a.gdp > 0 ? '#22c55e' : '#71717a' }}>{a.gdp > 0 ? `+${a.gdp} Bullish` : 'Neutral'}</div>
              </div>
              <div style={{ background: '#141b2d', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '4px' }}>INFLATION DRIVER</div>
                 <div style={{ fontSize: '14px', fontWeight: 700, color: a.inflation < 0 ? '#ef4444' : '#71717a' }}>{a.inflation < 0 ? `${a.inflation} Bearish` : 'Neutral'}</div>
              </div>
              <div style={{ background: '#141b2d', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '4px' }}>RATES SENSITIVITY</div>
                 <div style={{ fontSize: '14px', fontWeight: 700, color: a.interestRates < 0 ? '#ef4444' : '#71717a' }}>{a.interestRates < 0 ? `${a.interestRates} Bearish` : 'Neutral'}</div>
              </div>
              <div style={{ background: '#141b2d', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '4px' }}>EMPLOYMENT BIAS</div>
                 <div style={{ fontSize: '14px', fontWeight: 700, color: a.employmentChange > 0 ? '#22c55e' : '#71717a' }}>{a.employmentChange > 0 ? `+${a.employmentChange} Bullish` : 'Neutral'}</div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#71717a' }}>
              Institutional Focus: {a.cotLong}% Long / {a.cotShort}% Short
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fundamental;
