import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const COTDeepDive: React.FC = () => {
  const { assets } = useApp();

  // Reaper 11.0 - Neural Divergence Engine
  const analysisData = useMemo(() => {
    return [...assets].map(a => {
      // Pulling direct from Neural Matrix 10.0
      const cotLong = a.cotLong || 50;
      const retailLong = a.retailLong || 50;
      
      // Institutional Divergence formula (Absolute Parity)
      // Signal = Institutional Strength - Retail Weakness
      const instSentiment = cotLong > 65 ? 'Bullish' : cotLong < 35 ? 'Bearish' : 'Neutral';
      const retailSentiment = retailLong > 65 ? 'Bullish' : retailLong < 35 ? 'Bearish' : 'Neutral';
      
      let signal = 'Accumulation';
      let signalClass = 'val-neutral';
      
      if (instSentiment === 'Bullish' && retailSentiment === 'Bearish') {
        signal = '💎 DIAMOND LONG (Confluence)';
        signalClass = 'bias-very-bullish';
      } else if (instSentiment === 'Bearish' && retailSentiment === 'Bullish') {
        signal = '🩸 BLOOD SHORT (Divergence)';
        signalClass = 'bias-very-bearish';
      } else if (instSentiment === 'Bullish') {
        signal = '🏦 Smart Money Accumulation';
        signalClass = 'bias-bullish';
      } else if (instSentiment === 'Bearish') {
        signal = '🏚️ Smart Money Distribution';
        signalClass = 'bias-bearish';
      }

      return { ...a, cotLong, retailLong, signal, signalClass };
    }).sort((a, b) => {
        // Sort by "Divergence Extremeness"
        const aDiv = Math.abs(a.cotLong - a.retailLong);
        const bDiv = Math.abs(b.cotLong - b.retailLong);
        return bDiv - aDiv;
    });
  }, [assets]);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>🏛️ Institutional Divergence Deep-Dive</h1>
          <p>Analyzing "Smart Money" Accumulation vs "Dumb Money" Retail Traps.</p>
        </div>
      </header>

      <div className="settings-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem', border: '1px solid #1e2d48' }}>
        <div className="table-scroll">
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #1e2d48' }}>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '12px', color: '#71717a' }}>ASSET</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '12px', color: '#71717a' }}>INSTITUTIONAL (COT)</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '12px', color: '#71717a' }}>RETAIL SENTIMENT</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '12px', color: '#71717a' }}>NEURAL SIGNAL</th>
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
                         <div style={{ width: `${a.cotLong}%`, background: '#22c55e', height: '100%', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }} />
                         <div style={{ width: `${100 - a.cotLong}%`, background: '#ef4444', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{a.cotLong}% Institutional Long</span>
                    </div>
                  </td>

                  {/* Retail Bar */}
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ width: '180px', height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ width: `${a.retailLong}%`, background: '#22c55e', height: '100%' }} />
                         <div style={{ width: `${100 - a.retailLong}%`, background: '#ef4444', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>{a.retailLong}% Retail Long</span>
                    </div>
                  </td>

                  {/* Confluence Signal */}
                  <td style={{ padding: '1.5rem' }}>
                     <div className={`bias-badge ${a.signalClass}`} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', borderRadius: '4px', letterSpacing: '0.02em' }}>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#f8fafc' }}>🧬 The Reaper Divergence Strategy</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
            <div>
              <p style={{ marginBottom: '1rem' }}><strong>Smart Money Accumulation:</strong> When banks (COT) are heavily long, the trend has structural support. We look for these setups first.</p>
              <p><strong>Retail Over-Extension:</strong> When retail is 70%+ long, the market is "crowded" and prone to a flush. We use this as a contrarian filter.</p>
            </div>
            <div>
               <p style={{ marginBottom: '1rem' }}><strong>💎 Diamond Confluence:</strong> The strongest trade on the terminal. Institutional support + Retail being trapped on the wrong side of the move.</p>
               <p><strong>Neural Sorting:</strong> This list automatically sorts by "Divergence Extremeness" – the biggest gaps between smart money and retail are always on top.</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default COTDeepDive;
