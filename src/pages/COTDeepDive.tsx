import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const COTDeepDive: React.FC = () => {
  const { assets, marketData } = useApp();

  // Reaper 26.0 - THE MONSTAH CONVICTION ENGINE
  const analysisData = useMemo(() => {
    return [...assets].map(a => {
      const live = marketData[a.id];
      const price = live?.price || 0;
      
      const cLong = a.cotLong || 0;
      const cShort = a.cotShort || 0;
      const total = cLong + cShort;
      
      const longPct = total > 0 ? Math.round((cLong / total) * 100) : 50;
      
      // Conviction Logic: Calculate the extremity of the smart money positioning
      const conviction = Math.min(100, Math.abs(longPct - 50) * 2.5);
      
      // Divergence Logic: Comparing Price vs Position
      // If price is higher than base but net short, it's a "High Conviction Short Divergence"
      const isShortDivergence = price > (a.basePrice || 0) && longPct < 40;
      const isLongDivergence = price < (a.basePrice || 0) && longPct > 60;
      
      let thesis = "Monitoring Institutional Flows...";
      let thesisColor = "#71717a";

      if (isShortDivergence) {
        thesis = "🏦 BANKS ARE SELLING INTO STRENGTH. HOLD SHORT.";
        thesisColor = "#ef4444";
      } else if (isLongDivergence) {
        thesis = "🏢 SMART MONEY BUYING THE DIP. HOLD LONG.";
        thesisColor = "#22c55e";
      } else if (conviction > 80) {
        thesis = "⚠️ EXTREME POSITIONING. TREND REVERSAL IMMINENT.";
        thesisColor = "#eab308";
      }

      return { 
        ...a, 
        longPct, 
        price, 
        conviction, 
        thesis, 
        thesisColor,
        signalClass: longPct > 60 ? 'bias-bullish' : longPct < 40 ? 'bias-bearish' : 'val-neutral'
      };
    }).sort((a, b) => b.conviction - a.conviction);
  }, [assets, marketData]);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>🏛️ Institutional Conviction Engine</h1>
          <p>Analyzing "Smart Money" delta vs. 2026 Price Action for Stress-Free Holding Power.</p>
        </div>
      </header>

      <div className="settings-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem', border: '1px solid #1e2d48' }}>
        <div className="table-scroll">
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #1e2d48' }}>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>ASSET</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>MARKET PRICE</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>INSTITUTIONAL (COT)</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>CONVICTION</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>HOLD THESIS</th>
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
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{a.name}</div>
                    <div style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace' }}>{a.id}</div>
                  </td>

                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                     <div style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>
                        {a.price > 0 ? a.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : 'SYNCING...'}
                     </div>
                  </td>
                  
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                      <div style={{ width: '140px', height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                         <div style={{ width: `${a.longPct}%`, background: '#22c55e', height: '100%' }} />
                         <div style={{ width: `${100 - a.longPct}%`, background: '#ef4444', height: '100%' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>{a.longPct}% LONG / {100 - a.longPct}% SHORT</span>
                    </div>
                  </td>

                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                     <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '45px', 
                        height: '45px', 
                        borderRadius: '50%', 
                        border: `2px solid ${a.conviction > 70 ? '#ef4444' : '#334155'}`,
                        fontSize: '11px',
                        fontWeight: 900,
                        color: a.conviction > 70 ? '#ef4444' : '#f8fafc',
                        background: a.conviction > 70 ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                     }}>
                        {Math.round(a.conviction)}%
                     </div>
                  </td>

                  <td style={{ padding: '1.5rem' }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        color: a.thesisColor,
                        letterSpacing: '0.01em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: a.thesisColor }} />
                        {a.thesis}
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="settings-card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.2) 100%)', border: '1px solid #ef444444', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👹 THE MONSTAH "NO-STRESS" PROTOCOL</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>🏦 INSTITUTIONAL DIVERGENCE</h4>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>When the market pushes into new highs (Gold $4.7k+) but Smart Money (COT) is heavily distributed (Short), the conviction for a reversal is maximal. We hold through the volatility because the structural foundation is on our side.</p>
              </div>
              <div>
                <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>🎯 CONVICTION RATING</h4>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>Our 0-100% dial calculates the extremity of COT positioning. Anything above 75% indicates a trade that institutional traders are currently betting heavily on. We follow the size.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default COTDeepDive;
