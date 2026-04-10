import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MyfxbookWidget from '../components/MyfxbookWidget';

const Sentiment: React.FC = () => {
  const { assets } = useApp();
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.cot - a.cot);
  }, [assets]);

  // Reaper 8.3 - Dual Dynamic Squad Sorting (Institutional Side)
  const cotChartData = useMemo(() => {
    return sortedAssets
      .map(a => {
        const total = (a.cotLong || 0) + (a.cotShort || 0);
        let longPct = 50;
        if (total > 0) {
          longPct = Math.round(((a.cotLong || 0) / total) * 100);
        }
        const rankScore = Math.abs(longPct - 50);
        return {
          name: a.name, // Display the human readable name (e.g., BRENT OIL instead of UKOIL)
          cotScore: a.cot,
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
    return [...cotChartData].sort((a, b) => b.long - a.long)[0];
  }, [cotChartData]);

  const mostBearish = useMemo(() => {
    return [...cotChartData].sort((a, b) => a.long - b.long)[0];
  }, [cotChartData]);

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
            <span className="stat-value" style={{ color: '#22c55e' }}>{mostBullish?.name}</span>
            <span className="stat-sub">COT Score: {mostBullish?.cotScore > 0 ? `+${mostBullish.cotScore}` : mostBullish?.cotScore}</span>
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
        <div style={{ height: `${cotChartData.length * 45 + 50}px`, marginTop: '20px', marginLeft: '-20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cotChartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }} barSize={28}>
              <XAxis type="number" hide domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
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
          </ResponsiveContainer>
        </div>
      </div>



      {/* Official Myfxbook Outlook Widget Section */}
      <div className="settings-card" style={{ marginTop: '2rem', minHeight: '400px', background: '#0f1623' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <h2 className="settings-section-title" style={{ margin: 0 }}>📡 Official Myfxbook Live Feed</h2>
            <p className="settings-hint">Direct institutional source. (Table is secure, use the search above to find pairs in Reaper Charts).</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
             <input 
              type="text" 
              placeholder="Jump to Reaper Chart (e.g. Gold, DOW)..." 
              style={{
                background: '#141b2d', border: '1px solid #1e2d48', borderRadius: '4px',
                padding: '6px 12px', color: 'white', fontSize: '12px', width: '250px'
              }}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value.toUpperCase();
                if (!val) return;
                // Find and pulse the corresponding label in our charts
                const labels = document.querySelectorAll('.recharts-cartesian-axis-tick-value');
                labels.forEach((node: any) => {
                  if (node.textContent.toUpperCase().includes(val)) {
                    node.style.fill = '#22c55e';
                    node.style.fontWeight = '900';
                    node.style.fontSize = '14px';
                  } else {
                    node.style.fill = '#f8fafc';
                    node.style.fontWeight = '700';
                    node.style.fontSize = '11px';
                  }
                });
              }}
             />
          </div>
        </div>
        
        <div id="myfxbook_visual_container" style={{ 
          background: '#1a2333', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #1e2d48',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <MyfxbookWidget />
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.6 }}>
          <a href="https://www.myfxbook.com" className="myfxbookLink" target="_blank" rel="noopener noreferrer">
            Powered by Myfxbook.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
