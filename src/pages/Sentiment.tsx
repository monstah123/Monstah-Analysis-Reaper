import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import MyfxbookWidget from '../components/MyfxbookWidget';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: '#0f1623', border: '1px solid #1e2d48', padding: '10px', borderRadius: '6px' }}>
        <p className="label" style={{ margin: 0, fontWeight: 700 }}>{label}</p>
        <p style={{ margin: 0, color: '#3b82f6' }}>Longs: {payload[0].value}%</p>
        <p style={{ margin: 0, color: '#ef4444' }}>Shorts: {payload[1].value}%</p>
        {payload[0].payload.source && <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#8b9ab8' }}>Src: {payload[0].payload.source}</p>}
      </div>
    );
  }
  return null;
};

const Sentiment: React.FC = () => {
  const [chartWidth, setChartWidth] = useState(
    typeof window !== 'undefined' ? Math.max(300, window.innerWidth - 300) : 800
  );

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(Math.max(300, window.innerWidth > 1024 ? window.innerWidth - 300 : window.innerWidth - 50));
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const app = useApp();
  const { assets, dataSyncStatus } = app;
  
  const sortedAssets = useMemo(() => {
    if (!Array.isArray(assets)) return [];
    return [...assets].sort((a, b) => (b.cot || 0) - (a.cot || 0));
  }, [assets]);

  // Reaper 8.3 - Dual Dynamic Squad Sorting (Institutional Side)
  const cotChartData = useMemo(() => {
    if (!sortedAssets.length) return [];
    return sortedAssets
      .filter(a => a.name) // Defensive: Ensure asset exists
      .map(a => {
        const total = (a.cotLong || 0) + (a.cotShort || 0);
        let longPct = 50;
        if (total > 0) {
          longPct = Math.round(((a.cotLong || 0) / total) * 100);
        }
        const rankScore = Math.abs(longPct - 50);
        return {
          name: a.name,
          cotScore: a.cot || 0,
          long: longPct, 
          short: 100 - longPct,
          rankScore,
          source: (a.category === 'Crypto' ? 'Binance / On-chain' : 'CFTC Gov Data')
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore); // Extreme First
  }, [sortedAssets]);


  // --- Reaper Leaderboard Logic (Correct Extremes) ---
  const mostBullish = useMemo(() => {
    if (!cotChartData.length) return null;
    return [...cotChartData].sort((a, b) => b.long - a.long)[0];
  }, [cotChartData]);

  const mostBearish = useMemo(() => {
    if (!cotChartData.length) return null;
    return [...cotChartData].sort((a, b) => a.long - b.long)[0];
  }, [cotChartData]);



  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>📡 Sentiment Analysis</h1>
            {dataSyncStatus.institutional && (
               <div className="verified-badge">
                 ✓ Verified Live Institutional Feed
               </div>
             )}
          </div>
          <p>Commitment of Traders (COT) vs Retail Positioning (Contrarian)</p>
        </div>
      </header>

      <div className="stats-bar" style={{ padding: '1.5rem 0' }}>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-body">
            <span className="stat-label">Most Bullish (Inst.)</span>
            <span className="stat-value" style={{ color: '#22c55e' }}>{mostBullish?.name}</span>
            <span className="stat-sub">COT Score: {(mostBullish?.cotScore ?? 0) > 0 ? `+${mostBullish?.cotScore}` : mostBullish?.cotScore}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-body">
            <span className="stat-label">Most Bearish (Inst.)</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>{mostBearish?.name}</span>
            <span className="stat-sub">COT Score: {mostBearish?.cotScore}</span>
          </div>
        </div>
      </div>

      {/* COT Chart */}
      <div className="settings-card">
        <h2 className="settings-section-title">Institutional Positioning (COT)</h2>
        <p className="settings-hint">Smart money (Non-commercials) net longs vs shorts.</p>
        {cotChartData.length > 0 ? (
          <div style={{ width: '100%', marginTop: '20px', overflowX: 'auto', minHeight: '300px' }}>
                <BarChart 
                  width={chartWidth} 
                  height={Math.max(100, cotChartData.length * 45 + 50)}
                  data={cotChartData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }} 
                  barSize={28}
                >
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} isAnimationActive={false} />
                <Bar 
                  dataKey="long" 
                  stackId="a" 
                  fill="#22c55e" 
                  radius={[4, 0, 0, 4]} 
                  isAnimationActive={false}
                />
                <Bar 
                  dataKey="short" 
                  stackId="a" 
                  fill="#ef4444" 
                  radius={[0, 4, 4, 0]} 
                  isAnimationActive={false}
                />
              </BarChart>
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#4a5775', fontSize: '0.85rem' }}>
            Syncing CFTC institutional data…
          </div>
        )}
      </div>



      {/* Official Myfxbook Outlook Widget Section */}
      <div className="settings-card" style={{ marginTop: '2rem', minHeight: '600px', background: '#0f1623' }}>
        <h2 className="settings-section-title">📡 Official Myfxbook Live Feed</h2>
        <p className="settings-hint">Direct sentiment source. Institutional sync continues via Reaper logic above.</p>
        <div style={{ marginTop: '1.5rem', background: '#141b2d', padding: '10px', borderRadius: '8px', border: '1px solid #1e2d48' }}>
          <MyfxbookWidget />
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
