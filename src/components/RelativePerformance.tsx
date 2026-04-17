import React from 'react';
import { useApp } from '../contexts/AppContext';

const RelativePerformance: React.FC = () => {
  const { assets, marketData } = useApp();

  // Currencies to track
  const targets = ['NZD', 'AUD', 'GBP', 'JPY', 'EUR', 'CAD', 'CHF'];

  const performance = targets.map(symbol => {
    // Find a pair that has this symbol and USD
    // We prefer [Symbol]USD, if not found then USD[Symbol] (and invert)
    let change = 0;
    const pairDirect = assets.find(a => a.avFrom === symbol && a.avTo === 'USD');
    const pairInverted = assets.find(a => a.avFrom === 'USD' && a.avTo === symbol);

    if (pairDirect) {
      change = marketData[pairDirect.id]?.change24h || 0;
    } else if (pairInverted) {
      change = -(marketData[pairInverted.id]?.change24h || 0);
    }

    return { symbol, change };
  }).sort((a, b) => b.change - a.change);

  // Add USD itself as the base
  performance.push({ symbol: 'USD', change: 0 });

  return (
    <div className="relative-performance-container" style={{ 
      marginBottom: '1.5rem', 
      background: '#111827', 
      border: '1px solid #1e2d48',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        fontSize: '0.85rem', 
        fontWeight: 800, 
        marginBottom: '1rem', 
        color: '#94a3b8', 
        textAlign: 'center', 
        letterSpacing: '0.15em',
        textTransform: 'uppercase'
      }}>
        1-Day Relative Performance [USD]
      </h3>

      <div style={{ 
        height: '220px', 
        display: 'flex', 
        alignItems: 'center', // Center labels vertically
        justifyContent: 'space-between',
        padding: '0 10px',
        position: 'relative',
        gap: '4px'
      }}>
        {/* Zero-Line baseline */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />

        {performance.map((p) => {
          const isPositive = p.change >= 0;
          const isZero = p.symbol === 'USD';
          
          // Max bar height is 100px (half of container)
          const barHeight = Math.min(Math.abs(p.change) * 200, 95);
          
          return (
            <div key={p.symbol} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              flex: 1, 
              position: 'relative',
              height: '100%',
              animation: `fadeInUp 0.6s ease-out forwards`,
              zIndex: 2
            }}>
              {/* Positive Bar (Grows UP) */}
              <div style={{ 
                flex: 1, 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-end',
                paddingBottom: '2px'
              }}>
                {isPositive && !isZero && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#22c55e', textAlign: 'center', marginBottom: '4px' }}>
                      {p.change.toFixed(2)}%
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: `${Math.max(2, barHeight)}px`, 
                      background: 'rgba(34, 197, 94, 0.4)',
                      borderTop: '3px solid #22c55e',
                      borderRadius: '2px 2px 0 0'
                    }} />
                  </>
                )}
              </div>

              {/* Symbol Label (Centered) */}
              <div style={{ 
                padding: '4px 0',
                width: '100%',
                background: isZero ? '#3b82f6' : (isPositive ? '#22c55e' : '#ef4444'),
                color: 'white',
                fontSize: '10px',
                fontWeight: 900,
                textAlign: 'center',
                borderRadius: '3px',
                margin: '2px 0',
                zIndex: 3,
                boxShadow: isZero ? '0 0 10px rgba(59,130,246,0.3)' : 'none'
              }}>
                {p.symbol}
              </div>

              {/* Negative Bar (Grows DOWN) */}
              <div style={{ 
                flex: 1, 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-start',
                paddingTop: '2px'
              }}>
                {!isPositive && !isZero && (
                  <>
                     <div style={{ 
                        width: '100%', 
                        height: `${Math.max(2, barHeight)}px`, 
                        background: 'rgba(239, 68, 68, 0.4)',
                        borderBottom: '3px solid #ef4444',
                        borderRadius: '0 0 2px 2px'
                      }} />
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#ef4444', textAlign: 'center', marginTop: '4px' }}>
                        {p.change.toFixed(2)}%
                      </div>
                  </>
                )}
                {isZero && (
                   <div style={{ width: '100%', height: '4px', background: '#3b82f6', opacity: 0.5, marginTop: '2px' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelativePerformance;
