import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const COTDeepDive: React.FC = () => {
  const { assets, marketData } = useApp();

  // v17.0 - THE MONSTAH "IRONCLAD" ANALYTICS ENGINE
  const analysisData = useMemo(() => {
    return [...assets].map(a => {
      const live = marketData[a.id];
      const price = live?.price || 0;
      
      const cLong = a.cotLong || 0;
      const cShort = a.cotShort || 0;
      const total = cLong + cShort;
      
      // Data Integrity Check: If total is 0, it means the Institutional feed hasn't mapped this asset yet.
      const isSyncPending = total === 0 && !a.isSentimentDerived;
      const longPct = !isSyncPending ? Math.round((cLong / total) * 100) : 50;
      
      // Conviction Logic: Calculate the extremity of the smart money positioning
      const conviction = isSyncPending ? 0 : Math.min(100, Math.abs(longPct - 50) * 2.5);
      
      // Divergence Logic: Comparing Price vs Position
      const isShortDivergence = !isSyncPending && price > (a.basePrice || 0) && longPct < 40;
      const isLongDivergence = !isSyncPending && price < (a.basePrice || 0) && longPct > 60;
      
      let thesis = isSyncPending ? "⚠️ DATA SYNC PENDING..." : "Monitoring Institutional Flows...";
      let thesisColor = isSyncPending ? "#eab308" : "#71717a";

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
        isSyncPending,
        signalClass: isSyncPending ? 'val-neutral' : longPct > 60 ? 'bias-bullish' : longPct < 40 ? 'bias-bearish' : 'val-neutral'
      };
    }).sort((a, b) => b.conviction - a.conviction);
  }, [assets, marketData]);

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="header" style={{ marginBottom: '2rem', padding: '0 1rem' }}>
        <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.02em', color: '#f8fafc', marginBottom: '0.5rem' }}>
            CONVICTION <span style={{ color: '#ef4444' }}>ENGINE</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>
            Analyzing Institutional Bias vs. 2026 Price Action High-Probability Trades.
          </p>
        </div>
      </header>

      <div style={{ 
        background: '#0f172a', 
        borderRadius: '12px', 
        border: '1px solid #1e2d48', 
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="table-scroll">
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '2px solid #1e2d48' }}>
                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asset Identity</th>
                <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market Price</th>
                <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Sentiment</th>
                <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Conviction</th>
                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Thesis</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((a, i) => (
                <tr key={a.id} style={{ 
                  borderBottom: '1px solid #1e2d48',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 1)',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f1f5f9' }}>{a.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{a.id}</div>
                  </td>

                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
                       {a.price > 0 ? a.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
                    </div>
                  </td>
                  
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ width: '160px', height: '8px', background: '#020617', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                         <div style={{ width: `${a.longPct}%`, background: '#22c55e', height: '100%', transition: 'width 1s ease' }} />
                         <div style={{ width: `${100 - a.longPct}%`, background: '#ef4444', height: '100%', transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '160px', fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>
                         <span>{a.longPct}% L</span>
                         <span>{100 - a.longPct}% S</span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                     <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        border: `2px solid ${a.conviction > 80 ? '#ef4444' : a.conviction > 50 ? '#eab308' : '#334155'}`,
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        color: a.conviction > 80 ? '#ef4444' : a.conviction > 50 ? '#eab308' : '#f8fafc',
                        background: a.conviction > 80 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.5)'
                     }}>
                        {Math.round(a.conviction)}%
                     </div>
                  </td>

                  <td style={{ padding: '1.5rem' }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 800, 
                        color: a.thesisColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: a.thesisColor,
                          boxShadow: `0 0 10px ${a.thesisColor}` 
                        }} />
                        {a.thesis}
                      </div>
                      {a.source && (
                        <div style={{ fontSize: '9px', color: '#475569', marginTop: '0.4rem', marginLeft: '1.4rem' }}>SOURCE: {a.source.toUpperCase()}</div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ 
        marginTop: '3rem', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(15, 23, 42, 0.1) 100%)', 
          border: '1px solid rgba(34, 197, 94, 0.1)', 
          padding: '1.5rem', 
          borderRadius: '12px' 
        }}>
          <h4 style={{ color: '#22c55e', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 900 }}>🏢 INSTITUTIONAL DIVERGENCE</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
            Calculated by monitoring price velocity vs. net positioning deltas. 
            When price makes new highs but institutional conviction drops, its a high-probability distribution sign.
          </p>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.1) 100%)', 
          border: '1px solid rgba(239, 68, 68, 0.1)', 
          padding: '1.5rem', 
          borderRadius: '12px' 
        }}>
          <h4 style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 900 }}>🎯 CONVICTION RATING</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
            A weighted score of positioning extremity. Scores above 80% indicate that primary dealers are 
            heavily skewed, increasing the risk/reward for trend capture.
          </p>
        </div>
      </div>
    </div>
  );
};

export default COTDeepDive;
