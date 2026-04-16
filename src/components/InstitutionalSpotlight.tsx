import React from 'react';
import { useApp } from '../contexts/AppContext';

const InstitutionalSpotlight: React.FC = () => {
  const { marketData, activeView, activeSetup, setActiveSetup } = useApp();
  
  if (activeView === 'landing' || !activeSetup) return null;

  const asset = marketData[activeSetup.assetId];
  const currentPrice = asset?.price || activeSetup.entry;
  const { entry, target, type, status, name } = activeSetup;
  
  // Progress calculation based on LONG or SHORT
  let progress = 0;
  if (type === 'SHORT') {
    const totalMove = entry - target;
    const currentMove = entry - currentPrice;
    progress = Math.max(0, Math.min(100, (currentMove / totalMove) * 100));
  } else {
    const totalMove = target - entry;
    const currentMove = currentPrice - entry;
    progress = Math.max(0, Math.min(100, (currentMove / totalMove) * 100));
  }

  return (
    <div style={{ 
      margin: '0 0 1.5rem 0',
      background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
      borderLeft: `4px solid ${type === 'SHORT' ? '#ef4444' : '#10b981'}`,
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      border: `1px solid ${type === 'SHORT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      animation: 'slideDown 0.5s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '9px', background: type === 'SHORT' ? '#ef4444' : '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '2px', fontWeight: 900, textTransform: 'uppercase' }}>Active Setup</span>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>🏛️ {name} Institutional {type === 'SHORT' ? 'Fade' : 'Rally'}</h2>
                  <button 
                    onClick={() => setActiveSetup(null)}
                    style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '10px', marginLeft: '0.5rem', padding: '2px' }}
                    title="Clear Setup"
                  >
                    ✕
                  </button>
               </div>
               <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                 <span style={{ color: type === 'SHORT' ? '#ef4444' : '#10b981' }}>{status} (Stress-Free)</span> 
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
                  <div style={{ width: `${progress}%`, background: type === 'SHORT' ? '#ef4444' : '#10b981', height: '100%', boxShadow: `0 0 10px ${type === 'SHORT' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)'}` }} />
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
