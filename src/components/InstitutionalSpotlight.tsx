import React from 'react';
import { useApp } from '../contexts/AppContext';

const InstitutionalSpotlight: React.FC = () => {
  const { marketData, activeView } = useApp();
  
  // v27.1 - THE IRON HOLD TARGET
  const eurUsd = marketData['EUR/USD'];
  const currentPrice = eurUsd?.price || 1.1782;
  const entry = 1.18045;
  const target = 1.1600;
  
  // Calculation of progress towards target (1.18045 down to 1.1600)
  const totalMove = entry - target;
  const currentMove = entry - currentPrice;
  const progress = Math.max(0, Math.min(100, (currentMove / totalMove) * 100));

  if (activeView === 'landing') return null;

  return (
    <div style={{ 
      margin: '0 0 1.5rem 0',
      background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
      borderLeft: '4px solid #ef4444',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      animation: 'slideDown 0.5s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '9px', background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '2px', fontWeight: 900, textTransform: 'uppercase' }}>Active Setup</span>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>🏛️ EUR/USD Institutional Fade</h2>
               </div>
               <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                 <span style={{ color: '#ef4444' }}>IRON HOLD (Stress-Free)</span> 
                 <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                 <span style={{ color: '#94a3b8' }}>Entry: {entry}</span>
                 <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                 <span style={{ color: '#f8fafc' }}>Live: {currentPrice.toFixed(5)}</span>
               </div>
            </div>

            <div style={{ width: '150px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#71717a', marginBottom: '4px', fontWeight: 700 }}>
                  <span>GRAVITY</span>
                  <span>{progress.toFixed(1)}%</span>
               </div>
               <div style={{ width: '100%', height: '4px', background: '#0f172a', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: '#ef4444', height: '100%', boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)' }} />
               </div>
            </div>
         </div>

         <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>{target.toFixed(4)}</div>
            <div style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Target</div>
         </div>
      </div>
    </div>
  );
};

export default InstitutionalSpotlight;
