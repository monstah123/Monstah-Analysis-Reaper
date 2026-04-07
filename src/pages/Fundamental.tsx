import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const Fundamental: React.FC = () => {
  const { assets } = useApp();
  const [macroData, setMacroData] = useState<any>(null);
  
  // Real-time Macro Sync from Neural Matrix
  useEffect(() => {
    const fetchMacro = async () => {
      try {
        const res = await fetch(`/api/sentiment?_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) setMacroData(json.macro);
        }
      } catch (e) {}
    };
    fetchMacro();
  }, []);

  const sortedByScore = useMemo(() => {
    return [...assets].sort((a, b) => b.score - a.score);
  }, [assets]);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📊 Neural Fundamental Tracker</h1>
          <p>Global economic heatmaps powered by DeepSeek Macro-Pulse 9.0</p>
        </div>
      </header>

      {/* Global Macro Pillars */}
      <div className="stats-bar" style={{ padding: '1.5rem 0', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'US Real GDP', val: macroData?.GDP ? `${macroData.GDP}%` : '2.1%', icon: '🏛️', status: 'Stable' },
          { label: 'Inflation (CPI)', val: macroData?.CPI ? `${macroData.CPI}%` : '3.4%', icon: '⛽', color: '#ef4444', status: 'Warning' },
          { label: 'Fed Funds Rate', val: macroData?.FedRate ? `${macroData.FedRate}%` : '5.5%', icon: '♟️', status: 'Peaked' },
          { label: 'NFP Jobs', val: macroData?.NFP ? `${(macroData.NFP / 1000).toFixed(0)}k` : '240k', icon: '👷', color: '#22c55e', status: 'Strong' },
          { label: 'Manufacturing PMI', val: macroData?.PMI || '50.8', icon: '🏭', status: 'Expansion' }
        ].map(m => (
          <div key={m.label} className="stat-card" style={{ border: '1px solid #1e2d48', background: 'rgba(15,22,35,0.4)' }}>
            <div className="stat-icon">{m.icon}</div>
            <div className="stat-body">
              <span className="stat-label">{m.label}</span>
              <span className="stat-value" style={m.color ? { color: m.color } : {}}>{m.val}</span>
              <span className="stat-sub" style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{m.status}</span>
            </div>
          </div>
        ))}
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
                 <div style={{ fontSize: '14px', fontWeight: 700, color: a.gdp > 0 ? '#22c55e' : '#71717a' }}>{a.gdp > 0 ? `+${a.gdp} Bulish` : 'Neutral'}</div>
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
