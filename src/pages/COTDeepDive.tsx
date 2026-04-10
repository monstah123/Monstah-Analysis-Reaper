import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const COTDeepDive: React.FC = () => {
  const { assets } = useApp();

  // Reaper 11.0 - Institutional Engine
  const analysisData = useMemo(() => {
    return [...assets].map(a => {
      // Pulling direct from live COT data
      const cLong = a.cotLong || 0;
      const cShort = a.cotShort || 0;
      const total = cLong + cShort;
      
      // Calculate real percentage (Handle edge case where total is 0)
      const longPct = total > 0 ? Math.round((cLong / total) * 100) : 50;
      
      // Institutional Positioning formula based on normalized 0-100
      const instSentiment = longPct >= 60 ? 'Bullish' : longPct <= 40 ? 'Bearish' : 'Neutral';
      
      let signal = 'Neutral Positioning';
      let signalClass = 'val-neutral';
      
      if (instSentiment === 'Bullish') {
        signal = '🏦 Smart Money Accumulation';
        signalClass = 'bias-bullish';
      } else if (instSentiment === 'Bearish') {
        signal = '🏚️ Smart Money Distribution';
        signalClass = 'bias-bearish';
      }

      return { ...a, longPct, signal, signalClass };
    }).sort((a, b) => {
        // Sort by Extremeness of Positioning
        const aExt = Math.abs((a.longPct || 50) - 50);
        const bExt = Math.abs((b.longPct || 50) - 50);
        return bExt - aExt;
    });
  }, [assets]);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>🏛️ Institutional Positioning Deep-Dive</h1>
          <p>Analyzing "Smart Money" Accumulation and Distribution via live COT data.</p>
        </div>
      </header>

      <div className="settings-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem', border: '1px solid #1e2d48' }}>
        <div className="table-scroll">
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #1e2d48' }}>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '12px', color: '#71717a' }}>ASSET</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '12px', color: '#71717a' }}>INSTITUTIONAL (COT)</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '12px', color: '#71717a' }}>INSTITUTIONAL ACTION</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((a, i) => (
                <tr key={a.id} style={{ 
                  borderBottom: '1px solid #1e2d48', 
                  animation: `fadeInRow 0.3s ease forwards`, 
                  animationDelay: `${i*30}ms`, 
                  opacity: 0,
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                }}>
                  <td style={{ padding: '1.5rem', fontWeight: 800 }}>
                    <div style={{ fontSize: '1.1rem' }}>{a.name}</div>
                    <div style={{ fontSize: '10px', color: '#71717a' }}>{a.id}</div>
                  </td>
                  
                  {/* Institutional Bar */}
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ width: '180px', height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ width: `${a.longPct}%`, background: '#22c55e', height: '100%', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }} />
                         <div style={{ width: `${100 - a.longPct}%`, background: '#ef4444', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{a.longPct}% Institutional Long</span>
                    </div>
                  </td>

                  {/* Institutional Action Signal */}
                  <td style={{ padding: '1.5rem' }}>
                     <div className={`bias-badge ${a.signalClass}`} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', borderRadius: '4px', letterSpacing: '0.02em', display: 'inline-block' }}>
                       {a.signal}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="settings-card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid #1e2d48' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#f8fafc' }}>🧬 The Reaper Institutional Strategy</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              <p><strong>Smart Money Accumulation:</strong> When banks and hedge funds (via COT data) are heavily long, the trend has significant structural support. We look for these setups to align our trades with the institutions.</p>
              <p><strong>Smart Money Distribution:</strong> Conversely, when institutions are overwhelmingly short, it signals distribution and upcoming downside moves.</p>
              <p><strong>Sorting Mechanism:</strong> This list automatically sorts by the extremeness of institutional positioning, displaying the assets with the most distinct institutional bias at the top.</p>
          </div>
      </div>
    </div>
  );
};

export default COTDeepDive;
