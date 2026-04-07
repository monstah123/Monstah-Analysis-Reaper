import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, BarChart, Bar } from 'recharts';
import { useApp } from '../contexts/AppContext';

const YieldSpreads: React.FC = () => {
  const { yields, isRefreshing } = useApp();

  const recessionIndicator = useMemo(() => {
    const spread = yields.y10 - yields.y2;
    return {
      status: spread < 0 ? '⚠️ INVERTED (RECESSION)' : '✅ NORMAL (STABLE)',
      color: spread < 0 ? '#ef4444' : '#22c55e',
      val: spread.toFixed(2)
    };
  }, [yields]);

  // Main Chart Data (Neural Snapshot)
  const chartData = useMemo(() => {
    return [
      { name: '10Y-2Y', value: parseFloat((yields.y10 - yields.y2).toFixed(2)), desc: 'Main Curve (Recession)' },
      { name: '10Y-3M', value: parseFloat((yields.y10 - yields.y3m).toFixed(2)), desc: 'Short Term Liquidity' },
      { name: '10Y Rate', value: yields.y10, desc: 'Institutional Benchmark' },
      { name: '2Y Rate', value: yields.y2, desc: 'Fed Policy Proxy' },
      { name: '30Y Rate', value: yields.y30, desc: 'Housing/Debt Anchor' }
    ];
  }, [yields]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0f1623', border: '1px solid #1e2d48', padding: '10px', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#f0f4ff' }}>{payload[0].payload.name}</p>
          <p style={{ margin: 0, color: payload[0].value >= 0 ? '#3b82f6' : '#ef4444' }}>
            {payload[0].value}%
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#8b9ab8' }}>{payload[0].payload.desc}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
       <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>🏛️ Recession Monitor: Yield Curve</h1>
          <p>Institutional bond yield spreads (Neural Matrix Pulse)</p>
        </div>
      </header>

      <div className="stats-bar" style={{ padding: '1.5rem 0' }}>
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-body">
            <span className="stat-label">10Y-2Y Spread</span>
            <span className="stat-value" style={{ color: recessionIndicator.color }}>{recessionIndicator.val}%</span>
            <span className="stat-sub">{recessionIndicator.status}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⛓️</div>
          <div className="stat-body">
            <span className="stat-label">3-Month Edge</span>
            <span className="stat-value">{(yields.y10 - yields.y3m).toFixed(2)}%</span>
            <span className="stat-sub">Short-term liquidity gap</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <div className="stat-body">
            <span className="stat-label">30Y Benchmark</span>
            <span className="stat-value" style={{ color: '#3b82f6' }}>{yields.y30}%</span>
            <span className="stat-sub">Long-term debt anchor</span>
          </div>
        </div>
      </div>

      <div className="settings-row-2">
         {/* Yield Histogram */}
         <div className="settings-card" style={{ height: '400px' }}>
           <h2 className="settings-section-title" style={{ fontSize: '1.1rem', margin: 0 }}>📊 Institutional Yield Stack</h2>
           <span style={{ fontSize: '0.7rem', color: '#8b9ab8' }}>Neural Sync: {isRefreshing ? 'Pulsing...' : 'Stable'}</span>
            <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b9ab8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b9ab8', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <ReferenceLine y={0} stroke="#4a5775" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.value < 0 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Context Column */}
         <div className="settings-card">
            <h2 className="settings-section-title">💡 Neural Bond Driver</h2>
            <div style={{ color: '#8b9ab8', fontSize: '0.85rem', lineHeight: 1.6 }}>
               <p style={{ marginBottom: '1rem' }}>
                  The **Neural Matrix** processes real-time US Treasury data. Normally, longer-term bonds pay higher interest than shorter-term bonds (Normal Curve).
               </p>
               <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, color: '#f0f4ff', display: 'block', marginBottom: '0.2rem' }}>Normal (Bullish)</span>
                  If 10Y yields are HIGHER than 2Y, the economy is growing and institutions are taking long-term risks.
               </div>
               <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ fontWeight: 700, color: '#f0f4ff', display: 'block', marginBottom: '0.2rem' }}>Inverted (Bearish)</span>
                  If 2Y yields are HIGHER than 10Y, the market is bracing for a crash. This has predicted nearly every recession for the last 50 years.
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default YieldSpreads;
