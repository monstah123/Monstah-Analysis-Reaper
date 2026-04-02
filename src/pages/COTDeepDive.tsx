import React from 'react';
import { useApp } from '../contexts/AppContext';

const COTDeepDive: React.FC = () => {
  const { assets } = useApp();

  const cotAssets = assets.filter(a => a.cotLong !== undefined);

  return (
    <div className="page-container">
      <h1 className="page-title">🏛️ Institutional COT Deep-Dive</h1>
      <p className="page-sub">
        Analyzing the Commitment of Traders (Non-Commercial) vs. Broker Retail Sentiment.
        Look for "Smart Money" vs "Dumb Money" divergence for high-probability reversals.
      </p>

      <div className="settings-card" style={{ padding: 0, overflow: 'hidden', marginTop: '2rem' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left' }}>Asset</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>Institutional (COT)</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>Retail Sentiment</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left' }}>Confluence Signal</th>
            </tr>
          </thead>
          <tbody>
            {cotAssets.map((a, i) => {
              const cotTotal = (a.cotLong || 0) + (a.cotShort || 0);
              const cotLongPct = cotTotal > 0 ? ((a.cotLong || 0) / cotTotal) * 100 : 50;
              const retailLongPct = a.retailLong || 50;
              
              // Divergence logic: Smart Money Long + Retail Short = Strong Bullish
              const isSmartLongRetailShort = cotLongPct > 60 && retailLongPct < 40;
              const isSmartShortRetailLong = cotLongPct < 40 && retailLongPct > 60;

              return (
                <tr key={a.id} style={{ 
                  borderBottom: '1px solid var(--border)', 
                  animation: `fadeInRow 0.3s ease forwards`, 
                  animationDelay: `${i*30}ms`, 
                  opacity: 0,
                  background: isSmartLongRetailShort ? 'rgba(59, 130, 246, 0.05)' : isSmartShortRetailLong ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                }}>
                  <td style={{ padding: '1.5rem', fontWeight: 800 }}>{a.name}</td>
                  
                  {/* Institutional COT Bar */}
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', opacity: 0.6 }}>
                        <span>L: {a.cotLong}k</span>
                        <span>S: {a.cotShort}k</span>
                      </div>
                      <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                         <div style={{ width: `${cotLongPct}%`, background: '#3b82f6', height: '100%' }} />
                         <div style={{ width: `${100 - cotLongPct}%`, background: '#ef4444', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{cotLongPct.toFixed(1)}% Long</span>
                    </div>
                  </td>

                  {/* Retail Bar */}
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', opacity: 0.6 }}>
                        <span>{retailLongPct}% L</span>
                        <span>{100-retailLongPct}% S</span>
                      </div>
                      <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                         <div style={{ width: `${retailLongPct}%`, background: '#3b82f6', height: '100%' }} />
                         <div style={{ width: `${100 - retailLongPct}%`, background: '#ef4444', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{retailLongPct}% Long</span>
                    </div>
                  </td>

                  {/* Signal */}
                  <td style={{ padding: '1.5rem' }}>
                     {isSmartLongRetailShort ? (
                       <div className="bias-badge bias-very-bullish" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                         💎 Smart Long · Retail Trapped
                       </div>
                     ) : isSmartShortRetailLong ? (
                       <div className="bias-badge bias-very-bearish" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                         🩸 Smart Short · Retail Exit
                       </div>
                     ) : (
                       <span style={{ opacity: 0.4, fontSize: '0.85rem' }}>Accumulation Phase</span>
                     )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="settings-card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>📈 How to use the Deep-Dive</h3>
          <ul style={{ fontSize: '0.9rem', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><strong>Institutional (COT):</strong> Shows where hedge funds and banks are putting their money. High Blue = Bullish.</li>
              <li><strong>Retail Sentiment:</strong> Shows where the "crowd" is. Usually, retail is WRONG at market extremes.</li>
              <li><strong>Confluent Signal:</strong> When COT is heavily Long and Retail is heavily Short, that is the "Golden Long" entry.</li>
          </ul>
      </div>
    </div>
  );
};

export default COTDeepDive;
