import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Sentiment: React.FC = () => {
  const { assets } = useApp();

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.cot - a.cot);
  }, [assets]);

  // Convert COT score (-2 to +2) to fake percentage (net long %)
  const generateSentData = (score: number, base: number) => {
    let pct = base + (score * 15); // e.g. base 50, +2 = 80% long, -2 = 20% long
    if (pct > 95) pct = 95;
    if (pct < 5) pct = 5;
    return {
      long: pct,
      short: 100 - pct,
      longColor: pct > 50 ? '#3b82f6' : '#64748b',
      shortColor: pct <= 50 ? '#ef4444' : '#64748b',
    };
  };

  const cotChartData = sortedAssets.map(a => ({
    name: a.name,
    cotScore: a.cot,
    ...generateSentData(a.cot, 50)
  }));

  const retailChartData = useMemo(() => {
    return [...sortedAssets]
      .sort((a, b) => b.retailPos - a.retailPos)
      .map(a => ({
        name: a.name,
        retailScore: a.retailPos,
        // Retail is usually contrary. So a +2 score means retail is heavily SHORT (contrarian bullish)
        ...generateSentData(-a.retailPos, 50) 
      }));
  }, [sortedAssets]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ background: '#0f1623', border: '1px solid #1e2d48', padding: '10px', borderRadius: '6px' }}>
          <p className="label" style={{ margin: 0, fontWeight: 700 }}>{label}</p>
          <p style={{ margin: 0, color: '#3b82f6' }}>Longs: {payload[0].value}%</p>
          <p style={{ margin: 0, color: '#ef4444' }}>Shorts: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📡 Sentiment Analysis</h1>
          <p>Commitment of Traders (COT) vs Retail Positioning (Contrarian)</p>
        </div>
      </header>

      <div className="stats-bar" style={{ padding: '1.5rem 0' }}>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-body">
            <span className="stat-label">Most Bullish (Inst.)</span>
            <span className="stat-value" style={{ color: '#3b82f6' }}>{cotChartData[0]?.name}</span>
            <span className="stat-sub">COT Score: +{cotChartData[0]?.cotScore}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-body">
            <span className="stat-label">Most Bearish (Inst.)</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>{cotChartData[cotChartData.length - 1]?.name}</span>
            <span className="stat-sub">COT Score: {cotChartData[cotChartData.length - 1]?.cotScore}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🐑</div>
          <div className="stat-body">
            <span className="stat-label">Highest Retail Long</span>
            <span className="stat-value">{retailChartData.find(d => d.long > 50)?.name || 'N/A'}</span>
            <span className="stat-sub">Retail sentiment is contrarian</span>
          </div>
        </div>
      </div>

      <div className="settings-row-2">
        {/* COT Chart */}
        <div className="settings-card" style={{ height: '500px' }}>
          <h2 className="settings-section-title">Institutional Positioning (COT)</h2>
          <p className="settings-hint">Smart money (Non-commercials) net longs vs shorts.</p>
          <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cotChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#8b9ab8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="long" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="short" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retail Chart */}
        <div className="settings-card" style={{ height: '500px' }}>
          <h2 className="settings-section-title">Retail Positioning (IG Client)</h2>
          <p className="settings-hint">Retail traders are mostly wrong. A high short ratio is bullish.</p>
          <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retailChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#8b9ab8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="long" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="short" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
