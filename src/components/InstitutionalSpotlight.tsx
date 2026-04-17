import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const InstitutionalSpotlight: React.FC = () => {
  const { marketData, activeView, activeSetup, setActiveSetup } = useApp();
  
  // Dedicate a "Sprint Loop" for the radar (v28.6)
  useEffect(() => {
    const timer = setInterval(() => {
       // Forces a re-render for the "Last Updated" timer
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (activeView === 'landing' || !activeSetup) return null;

  const idClean = activeSetup.assetId.replace(/\//g, '');
  const asset = marketData[idClean] || marketData[activeSetup.assetId];
  const currentPrice = asset?.price || activeSetup.entry;
  const { entry, target, type, status, name } = activeSetup;
  const lastUpdated = asset?.lastUpdated;

  const getRelativeTime = (time?: number) => {
    if (!time) return 'Awaiting signal...';
    const diff = Math.floor((Date.now() - time) / 1000);
    if (diff < 5) return 'Just now';
    return `${diff}s ago`;
  };

  // Progress calculation based on LONG or SHORT
  let progress = 0;
  if (type === 'SHORT') {
    const totalMove = entry - target;
    const currentMove = entry - currentPrice;
    progress = Math.max(0, (currentMove / totalMove) * 100);
  } else {
    const totalMove = target - entry;
    const currentMove = currentPrice - entry;
    progress = Math.max(0, (currentMove / totalMove) * 100);
  }

  const isHit = progress >= 100;

  return (
    <div style={{ 
      margin: '0 0 1.5rem 0',
      background: isHit ? 'linear-gradient(90deg, rgba(168, 162, 158, 0.2) 0%, rgba(202, 138, 4, 0.4) 100%)' : 'linear-gradient(90deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
      borderLeft: `4px solid ${isHit ? '#fbbf24' : (type === 'SHORT' ? '#ef4444' : '#10b981')}`,
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      border: `1px solid ${isHit ? 'rgba(251, 191, 36, 0.4)' : (type === 'SHORT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')}`,
      boxShadow: isHit ? '0 0 30px rgba(251, 191, 36, 0.2)' : '0 10px 30px -10px rgba(0,0,0,0.5)',
      animation: isHit ? 'pulse-gold 2s infinite ease-in-out' : 'slideDown 0.5s ease-out'
    }}>
      <style>{`
        @keyframes pulse-gold {
          0% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.2); }
          50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.5); }
          100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.2); }
        }
        @keyframes heartbeat {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '9px', background: isHit ? '#fbbf24' : (type === 'SHORT' ? '#ef4444' : '#10b981'), color: isHit ? '#000' : '#fff', padding: '1px 5px', borderRadius: '2px', fontWeight: 900, textTransform: 'uppercase' }}>
                    {isHit ? 'Target Hit' : 'Active Setup'}
                  </span>
                  <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px #10b981', animation: 'heartbeat 1.5s infinite' }} />
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                    {isHit ? `🏆 ${name} Mission Accomplished` : `🏛️ ${name} Institutional ${type === 'SHORT' ? 'Fade' : 'Rally'}`}
                  </h2>
                  {!isHit && (
                    <button 
                      onClick={() => setActiveSetup(null)}
                      style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '10px', marginLeft: '0.5rem', padding: '2px' }}
                      title="Clear Setup"
                    >
                      ✕
                    </button>
                  )}
               </div>
               <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                 <span style={{ color: isHit ? '#fbbf24' : (type === 'SHORT' ? '#ef4444' : '#10b981') }}>
                    {isHit ? '💰 LIQUIDATED (Profit Secured)' : `${status} (Stress-Free)`}
                 </span> 
                 <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                 <span style={{ color: '#94a3b8' }}>Entry: {entry}</span>
                 <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                 <span style={{ color: '#f8fafc' }}>Live: {currentPrice.toFixed(5)}</span>
                 <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                 <span style={{ color: '#71717a', fontSize: '10px' }}>Sync: {getRelativeTime(lastUpdated)}</span>
               </div>
            </div>

            <div style={{ width: '150px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: isHit ? '#fbbf24' : '#71717a', marginBottom: '4px', fontWeight: 700 }}>
                  <span>{isHit ? 'GRAVITY MAXED' : 'GRAVITY'}</span>
                  <span>{progress.toFixed(1)}%</span>
               </div>
               <div style={{ width: '100%', height: '4px', background: '#0f172a', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, progress)}%`, background: isHit ? '#fbbf24' : (type === 'SHORT' ? '#ef4444' : '#10b981'), height: '100%', boxShadow: `0 0 10px ${isHit ? 'rgba(251, 191, 36, 0.8)' : (type === 'SHORT' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)')}` }} />
               </div>
            </div>
         </div>

         <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: isHit ? '#fbbf24' : '#f8fafc', fontFamily: 'monospace' }}>{target.toFixed(4)}</div>
            <div style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Target</div>
         </div>
      </div>
    </div>
  );
};

export default InstitutionalSpotlight;
