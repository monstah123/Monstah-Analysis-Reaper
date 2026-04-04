import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Sentiment: React.FC = () => {
  const { assets } = useApp();
  const [liveData, setLiveData] = useState<Record<string, { long: number; short: number; source: string }>>({});

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.cot - a.cot);
  }, [assets]);

  // Fetch live sentiment from Vercel Serverless Function
  useEffect(() => {
    const fetchLiveSentiment = async () => {
      const updates: Record<string, { long: number; short: number; source: string }> = {};
      
      await Promise.all(assets.map(async (a, index) => {
        // Stagger for Safari
        await new Promise(r => setTimeout(r, index * 60)); 
        
        try {
          const res = await fetch(`/api/sentiment?asset=${a.id}&category=${a.category}`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });
          const data = await res.json();
          updates[a.id] = data;
        } catch (e) {
          // Graceful fallback for local development (or free tier limits) doing exactly what the Vercel api does:
          const pseudoHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const dayHash = new Date().getDate();
          const seed = ((pseudoHash + dayHash) % 60) + 20;
          updates[a.id] = { long: seed, short: 100 - seed, source: 'Local Fallback' };
        }
      }));
      setLiveData(updates);
    };

    fetchLiveSentiment();
  }, [assets]);

  const cotChartData = useMemo(() => {
    return sortedAssets.map(a => {
      const total = (a.cotLong || 0) + (a.cotShort || 0);
      let longPct = 50;
      let shortPct = 50;
      
      if (total > 0) {
        longPct = Math.round(((a.cotLong || 0) / total) * 100);
        shortPct = 100 - longPct;
      }
      
      return {
        name: a.name || a.id,
        cotScore: a.cot,
        long: longPct, 
        short: shortPct
      };
    });
  }, [sortedAssets]);

  const retailChartData = useMemo(() => {
    return sortedAssets.map(a => {
      const live = liveData[a.id];
      // Default to 50/50 until the fast async call resolves
      return {
        name: a.name || a.id,
        retailScore: a.retailPos,
        long: live ? live.long : 50,
        short: live ? live.short : 50,
        source: live ? live.source : 'Loading...'
      };
    });
  }, [sortedAssets, liveData]);

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
            <span className="stat-value" style={{ color: '#22c55e' }}>{cotChartData[0]?.name}</span>
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
            <span className="stat-value" style={{ color: '#22c55e' }}>{retailChartData.find(d => d.long > 50)?.name || 'N/A'}</span>
            <span className="stat-sub">Retail sentiment is contrarian</span>
          </div>
        </div>
      </div>

      <div className="settings-row-2">
        {/* COT Chart */}
        <div className="settings-card" style={{ height: '700px' }}>
          <h2 className="settings-section-title">Institutional Positioning (COT)</h2>
          <p className="settings-hint">Smart money (Non-commercials) net longs vs shorts.</p>
          <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cotChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#8b9ab8', fontSize: 13, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="long" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="short" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retail Chart */}
        <div className="settings-card" style={{ height: '700px' }}>
          <h2 className="settings-section-title">Retail Positioning (IG Client)</h2>
          <p className="settings-hint">Retail traders are mostly wrong. A high short ratio is bullish.</p>
          <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retailChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#8b9ab8', fontSize: 13, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="long" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
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
