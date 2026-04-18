import React, { useMemo } from 'react';
import type { AssetData } from '../data/mockData';
import { useApp } from '../contexts/AppContext';

interface SqueezeRadarProps {
  assets: AssetData[];
}

const SqueezeRadar: React.FC<SqueezeRadarProps> = ({ assets }) => {
  const { audioEnabled, setAudioEnabled, squeezeAlerts, clearSqueezeAlerts } = useApp();

  const squeezeAssets = useMemo(() => {
    return assets.filter(a => {
      const iLong = a.cotLong || 0;
      const iShort = a.cotShort || 0;
      const rLong = a.retailLong || 0;
      const rShort = a.retailShort || 0;

      const iTotal = iLong + iShort;
      const rTotal = rLong + rShort;

      if (iTotal === 0 || rTotal === 0) return false;

      const iLongPct = (iLong / iTotal) * 100;
      const rLongPct = (rLong / rTotal) * 100;

      // Squeeze logic: Instititutions and Retail are polar opposites (>65% vs <35%)
      return (iLongPct >= 65 && rLongPct <= 35) || (iLongPct <= 35 && rLongPct >= 65);
    }).map(a => {
      const iLongPct = Math.round(( (a.cotLong || 0) / ((a.cotLong || 0) + (a.cotShort || 0)) ) * 100);
      const rLongPct = Math.round(( (a.retailLong || 0) / ((a.retailLong || 0) + (a.retailShort || 0)) ) * 100);
      const type = iLongPct > rLongPct ? 'LONG SQUEEZE' : 'SHORT SQUEEZE';
      return { ...a, iLongPct, rLongPct, type };
    });
  }, [assets]);

  if (squeezeAssets.length === 0) {
    return (
      <div className="settings-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '1px solid #312e81', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
           <h3 style={{ color: '#818cf8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>🛰️ Monstah Squeeze Radar</h3>
           <p style={{ color: '#4b5563', fontSize: '0.8rem', margin: 0 }}>Scanning global flows... No high-conviction squeezes detected.</p>
        </div>
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          style={{ background: audioEnabled ? '#4338ca' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          {audioEnabled ? '🔔 ALERTS ON' : '🔕 ALERTS OFF'}
        </button>
      </div>
    );
  }

  return (
    <div className="settings-card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '2px solid #4338ca', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(67, 56, 202, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>📡</span> MONSTAH SQUEEZE DETECTED
          </h3>
          <p style={{ color: '#818cf8', fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Extreme Institutional vs Retail Divergence Identified</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{ background: audioEnabled ? '#4338ca' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 700 }}
          >
            {audioEnabled ? '🔔 JACKPOT ALERTS ON' : '🔕 JACKPOT ALERTS OFF'}
          </button>
          <div style={{ background: '#4338ca', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>
            HIGH CONVICTION
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {squeezeAssets.map(a => (
          <div key={a.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{a.name}</span>
              <span style={{ color: a.type === 'LONG SQUEEZE' ? '#22c55e' : '#ef4444', fontSize: '10px', fontWeight: 900, background: a.type === 'LONG SQUEEZE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                {a.type}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden', margin: '8px 0' }}>
               <div style={{ flex: a.iLongPct, background: '#3b82f6' }} title={`Institutions: ${a.iLongPct}% Long`} />
               <div style={{ flex: 100 - a.iLongPct, background: 'rgba(59, 130, 246, 0.2)' }} />
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
               <div style={{ flex: a.rLongPct, background: '#ef4444' }} title={`Retail: ${a.rLongPct}% Long`} />
               <div style={{ flex: 100 - a.rLongPct, background: 'rgba(239, 68, 68, 0.2)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px' }}>
               <span style={{ color: '#94a3b8' }}>Institutions: <b style={{ color: '#3b82f6' }}>{a.iLongPct}% L</b></span>
               <span style={{ color: '#94a3b8' }}>Retail: <b style={{ color: '#ef4444' }}>{a.rLongPct}% L</b></span>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Alert History Log (User Request: Asset, Time, Counter) */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
           <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>📟 RECENT SQUEEZE LOG</h4>
           {(squeezeAlerts?.length ?? 0) > 0 && (
             <button onClick={clearSqueezeAlerts} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}>CLEAR LOG</button>
           )}
        </div>

        {(!squeezeAlerts || squeezeAlerts.length === 0) ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#4b5563', fontSize: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            No recent alerts. The log will populate as institutional flows diverge.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {squeezeAlerts.map((alert: any, i: number) => {
              const secondsAgo = Math.floor((Date.now() - alert.timestamp) / 1000);
              const timeStr = secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`;
              
              return (
                <div key={`${alert.assetId}-${alert.timestamp}`} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', alignItems: 'center', padding: '8px 12px', background: i === 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '6px', border: i === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.8rem' }}>{alert.name}</span>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: alert.type === 'LONG SQUEEZE' ? '#22c55e' : '#ef4444', opacity: 0.8 }}>{alert.type}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center' }}>
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div style={{ color: i === 0 ? '#6366f1' : '#4ade80', fontSize: '0.75rem', fontWeight: 900, textAlign: 'right' }}>
                    {timeStr}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SqueezeRadar;
