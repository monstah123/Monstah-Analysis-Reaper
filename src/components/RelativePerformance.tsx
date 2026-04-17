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
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <h3 style={{ 
        fontSize: '1rem', 
        fontWeight: 800, 
        marginBottom: '2rem', 
        color: '#f8fafc', 
        textAlign: 'center', 
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }}>
        1 DAY RELATIVE PERFORMANCE [USD]
      </h3>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        height: '160px', 
        padding: '0 1rem', 
        paddingBottom: '2.5rem', 
        position: 'relative',
        gap: '4px'
      }}>
        {performance.map((p) => {
          const isPositive = p.change >= 0;
          const isZero = p.symbol === 'USD';
          
          // Scale height: let's say 1% = 80px
          const barHeight = Math.min(Math.abs(p.change) * 80, 120);
          
          return (
            <div key={p.symbol} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              flex: 1, 
              position: 'relative',
              animation: `fadeInUp 0.6s ease-out forwards`
            }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 800, 
                marginBottom: '8px', 
                color: isZero ? '#94a3b8' : (isPositive ? '#22c55e' : '#ef4444') 
              }}>
                {isZero ? '—' : `${p.change > 0 ? '' : ''}${p.change.toFixed(2)}%`}
              </div>

              <div style={{ 
                width: '100%', 
                height: `${isZero ? 4 : Math.max(2, barHeight)}px`, 
                background: isZero ? '#3b82f6' : (isPositive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'),
                borderTop: isPositive && !isZero ? '3px solid #22c55e' : 'none',
                borderBottom: !isPositive && !isZero ? '3px solid #ef4444' : 'none',
                boxShadow: isZero ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} />

              <div style={{ 
                position: 'absolute', 
                bottom: '-30px', 
                width: '100%', 
                padding: '6px 0',
                background: isZero ? '#334155' : (isPositive ? '#22c55e' : '#ef4444'),
                color: 'white',
                fontSize: '11px',
                fontWeight: 900,
                textAlign: 'center',
                borderRadius: '4px',
                boxShadow: isZero ? 'none' : `0 4px 10px ${isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {p.symbol}
              </div>
            </div>
          );
        })}

        {/* Horizontal grid lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.05 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderTop: i % 2 === 0 ? '1px solid white' : '1px dashed white', width: '100%' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelativePerformance;
