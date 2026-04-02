import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { calculateCorrelation, getCorrelationColor } from '../utils/math';

const Correlation: React.FC = () => {
  const { assets, marketData } = useApp();

  // Get assets that actually have price history data
  const trackedAssets = useMemo(() => {
    return assets.filter((a) => marketData[a.id]?.history && marketData[a.id]!.history!.length > 5);
  }, [assets, marketData]);

  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    for (const a1 of trackedAssets) {
      matrix[a1.id] = {};
      const h1 = marketData[a1.id]!.history!.map((p) => p.value);
      for (const a2 of trackedAssets) {
        if (a1.id === a2.id) {
          matrix[a1.id][a2.id] = 1.0;
          continue;
        }
        const h2 = marketData[a2.id]!.history!.map((p) => p.value);
        matrix[a1.id][a2.id] = +calculateCorrelation(h1, h2).toFixed(2);
      }
    }
    return matrix;
  }, [trackedAssets, marketData]);

  if (trackedAssets.length < 2) {
    return (
      <div className="page-container">
        <h1 className="page-title">🌡️ Correlation Heatmap</h1>
        <p className="page-sub">Requires at least 2 assets with active price history to calculate relationships.</p>
        <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5 }}>
           <span>🔭 Waiting for more data to be collected…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🌡️ Linear Correlation Matrix</h1>
      <p className="page-sub">
          Analyzing Pearson coefficients across your active watchlist (30-day window). 
          Matches show if assets are moving in tandem or in opposition.
      </p>

      <div className="settings-card" style={{ padding: '1.5rem', overflow: 'auto', marginTop: '2rem' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: '3px', width: 'auto' }}>
          <thead>
            <tr>
              <th style={{ minWidth: '80px', background: 'transparent' }}></th>
              {trackedAssets.map((a) => (
                <th key={a.id} style={{ 
                  height: '100px',
                  verticalAlign: 'bottom',
                  paddingBottom: '10px'
                }}>
                  <div style={{
                    transform: 'translateX(10px) rotate(-45deg)',
                    transformOrigin: 'left bottom',
                    width: '30px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    opacity: 0.8,
                    textAlign: 'left'
                  }}>
                    {a.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trackedAssets.map((a1) => (
              <tr key={a1.id}>
                <td style={{ 
                  fontWeight: 800, 
                  textAlign: 'right', 
                  paddingRight: '10px', 
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  height: '40px',
                  width: '80px'
                }}>
                  {a1.name}
                </td>
                {trackedAssets.map((a2) => {
                  const val = correlationMatrix[a1.id][a2.id];
                  return (
                    <td 
                      key={a2.id} 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: getCorrelationColor(val), 
                        textAlign: 'center', 
                        fontSize: '0.65rem', 
                        fontWeight: 700,
                        borderRadius: '4px',
                        color: Math.abs(val) > 0.6 ? '#fff' : 'rgba(255,255,255,0.4)',
                        transition: 'transform 0.1s ease',
                        cursor: 'default'
                      }}
                      title={`${a1.name} / ${a2.name}: ${val}`}
                    >
                      {val === 1.0 ? '1.0' : val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(59, 130, 246, 1)' }} />
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>+1.0 (Positive) - Moving together</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(239, 68, 68, 1)' }} />
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>-1.0 (Negative) - Direct inverse</span>
          </div>
      </div>
    </div>
  );
};

export default Correlation;
