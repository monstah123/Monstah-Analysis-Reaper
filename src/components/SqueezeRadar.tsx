import React, { useMemo } from 'react';
import type { AssetData } from '../data/mockData';
import { useApp } from '../contexts/AppContext';
import SqueezeHistoryLog from './SqueezeHistoryLog';

interface SqueezeRadarProps {
  assets: AssetData[];
}

const SqueezeRadar: React.FC<SqueezeRadarProps> = ({ assets }) => {
  const { audioEnabled, setAudioEnabled } = useApp();

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

  return (
    <div className="settings-card" style={{ 
      background: squeezeAssets.length > 0 ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' : 'rgba(15, 23, 41, 0.4)', 
      border: squeezeAssets.length > 0 ? '2px solid #4338ca' : '1px solid rgba(255,255,255,0.05)', 
      borderRadius: '16px', 
      padding: '1.5rem', 
      marginBottom: '1.5rem', 
      boxShadow: squeezeAssets.length > 0 ? '0 0 20px rgba(67, 56, 202, 0.2)' : 'none',
      transition: 'all 0.5s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h3 style={{ color: squeezeAssets.length > 0 ? '#fff' : '#818cf8', fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ animation: squeezeAssets.length > 0 ? 'pulse 1.5s infinite' : 'none' }}>📡</span> 
            {squeezeAssets.length > 0 ? 'MONSTAH SQUEEZE DETECTED' : 'MONSTAH SQUEEZE RADAR'}
          </h3>
          <p style={{ color: '#818cf8', fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>
            {squeezeAssets.length > 0 ? 'Extreme Institutional vs Retail Divergence Identified' : 'Scanning global flows for institutional divergence...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{ background: audioEnabled ? '#4338ca' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 700 }}
          >
            {audioEnabled ? '🔔 JACKPOT ALERTS ON' : '🔕 JACKPOT ALERTS OFF'}
          </button>
          {squeezeAssets.length > 0 && (
            <div style={{ background: '#4338ca', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>
              HIGH CONVICTION
            </div>
          )}
        </div>
      </div>

      {squeezeAssets.length > 0 && (
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
      )}
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Reusable History Log */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <SqueezeHistoryLog />
      </div>
    </div>
  );
};

export default SqueezeRadar;
