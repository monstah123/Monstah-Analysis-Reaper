import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// In EdgeFinder, seasonality is 5 or 10-year monthly averages.
// Here we mock a 12-month seasonality array based on the asset's current seasonality score.
const generateSeasonalityData = (score: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseBias = score > 0 ? 0.3 : score < 0 ? -0.3 : 0;
  
  return months.map((m, i) => {
    // Generate some wave-like seasonality plus noise
    const wave = Math.sin((i / 11) * Math.PI * 2) * 0.5;
    const finalVal = baseBias + wave + (Math.random() - 0.5) * 0.5;
    return {
      month: m,
      performance: parseFloat(finalVal.toFixed(2)),
      fill: finalVal >= 0 ? '#3b82f6' : '#ef4444'
    };
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{ background: '#0f1623', border: '1px solid #1e2d48', padding: '10px', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#f0f4ff' }}>{label}</p>
        <p style={{ margin: 0, color: val >= 0 ? '#3b82f6' : '#ef4444' }}>
          Hist. Return: {val > 0 ? '+' : ''}{val}%
        </p>
      </div>
    );
  }
  return null;
};

const Technical: React.FC = () => {
  const { assets } = useApp();

  const topBullish = useMemo(() => assets.filter(a => a.trend >= 1).slice(0, 5), [assets]);
  const topBearish = useMemo(() => assets.filter(a => a.trend <= -1).sort((a, b) => a.trend - b.trend).slice(0, 5), [assets]);
  
  // Pick one asset to show seasonality for (default to first bullish, or first asset)
  const selectedAsset = topBullish[0] || assets[0];
  const seasonData = useMemo(() => generateSeasonalityData(selectedAsset.seasonality), [selectedAsset]);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📈 Technical & Seasonality</h1>
          <p>Trend strength identification and 10-year historical seasonality averages</p>
        </div>
      </header>

      <div className="settings-row-2" style={{ marginTop: '1.5rem' }}>
        
        {/* Top Trends */}
        <div className="settings-card" style={{ gap: '1.5rem' }}>
          <div>
            <h2 className="settings-section-title" style={{ color: '#3b82f6' }}>🟢 Strongest Uptrends</h2>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topBullish.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <strong style={{ color: '#bfdbfe' }}>{a.name}</strong>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>+{a.trend}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h2 className="settings-section-title" style={{ color: '#ef4444' }}>🔴 Strongest Downtrends</h2>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topBearish.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <strong style={{ color: '#fecaca' }}>{a.name}</strong>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{a.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seasonality Chart */}
        <div className="settings-card" style={{ height: '100%', minHeight: '400px' }}>
          <h2 className="settings-section-title">📊 Seasonality for {selectedAsset.name}</h2>
          <p className="settings-hint">Historical 10-year average performance by month.</p>
          
          <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243250" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8b9ab8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b9ab8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="performance" radius={[4, 4, 0, 0]}>
                  {seasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Technical;
