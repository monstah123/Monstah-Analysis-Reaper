import React from 'react';
import { useApp } from '../contexts/AppContext';

const SqueezeHistoryLog: React.FC = () => {
  const { squeezeAlerts, clearSqueezeAlerts } = useApp();

  return (
    <div className="settings-card" style={{ 
      background: 'rgba(15, 23, 41, 0.4)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      borderRadius: '8px', 
      padding: '1.5rem', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
         <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>📟 RECENT SQUEEZE LOG</h4>
         {(squeezeAlerts?.length ?? 0) > 0 && (
           <button onClick={clearSqueezeAlerts} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}>CLEAR LOG</button>
         )}
      </div>

      {(!squeezeAlerts || squeezeAlerts.length === 0) ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#4b5563', fontSize: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', padding: '1rem' }}>
          No recent alerts. The log will populate as institutional flows diverge.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {squeezeAlerts.map((alert, i) => {
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
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem', textAlign: 'right', fontSize: '10px', color: '#48484a', letterSpacing: '0.1em' }}>
        INSTITUTIONAL DIVERGENCE MONITOR
      </div>
    </div>
  );
};

export default SqueezeHistoryLog;
