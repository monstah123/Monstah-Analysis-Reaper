import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const Heatmap: React.FC = () => {
  const { assets, marketData, setSelectedAsset, setActiveView } = useApp();
  const [filter, setFilter] = React.useState('All');

  const categories = ['All', 'Forex', 'Indices', 'Commodities', 'Crypto'];

  // Sort and filter assets
  const sortedAssets = useMemo(() => {
     let filtered = [...assets];
     if (filter !== 'All') {
        filtered = filtered.filter(a => a.category === filter);
     }
     
     return filtered.sort((a, b) => {
        const cA = marketData[a.id]?.change24h || 0;
        const cB = marketData[b.id]?.change24h || 0;
        return Math.abs(cB) - Math.abs(cA);
     });
  }, [assets, marketData, filter]);

  const getHeatmapColor = (change: number) => {
     const abs = Math.abs(change);
     const opacity = Math.min(abs / 3.0, 1); // Scale intensity up to 3% movement
     
     if (change > 0.01) {
       // Green Spectrum (Positive)
       return `rgba(34, 197, 94, ${0.1 + (opacity * 0.9)})`;
     } else if (change < -0.01) {
       // Red Spectrum (Negative)
       return `rgba(239, 68, 68, ${0.1 + (opacity * 0.9)})`;
     }
     
     // Neutral / Flat
     return 'rgba(30, 41, 59, 0.4)';
  };

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      <header className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse-dot 2s infinite' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Cross-Asset Intelligence</span>
          </div>
          <h1>🌡️ Institutional Heatmap</h1>
          <p>Real-time performance matrix across Global Markets. 0% Mock Data. 100% Institutional Parity.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Market Selector</span>
           <select 
             value={filter} 
             onChange={(e) => setFilter(e.target.value)}
             style={{
               background: '#1e293b',
               border: '1px solid rgba(255,255,255,0.1)',
               color: '#fff',
               padding: '0.6rem 1.2rem',
               borderRadius: '10px',
               fontSize: '0.85rem',
               fontWeight: 700,
               cursor: 'pointer',
               outline: 'none',
               minWidth: '200px',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
             }}
           >
             {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'ALL MARKETS' : c.toUpperCase()}</option>)}
           </select>
        </div>
      </header>

      <div style={{
         display: 'grid',
         gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
         gap: '0.75rem',
         background: 'rgba(15, 23, 42, 0.2)',
         padding: '1.5rem',
         borderRadius: '24px',
         border: '1px solid rgba(255, 255, 255, 0.05)',
         minHeight: '600px'
      }}>
        {sortedAssets.map(asset => {
           const data = marketData[asset.id];
           const change = data?.change24h || 0;
           const price = data?.price || 0;
           const color = getHeatmapColor(change);

           return (
             <div 
               key={asset.id}
               className="heatmap-tile"
               onClick={() => {
                 console.log('Reaper: Selecting Market ->', asset.id);
                 setSelectedAsset(asset);
                 setActiveView('dashboard');
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               style={{
                 height: '150px',
                 background: color,
                 padding: '1.25rem',
                 borderRadius: '16px',
                 display: 'flex',
                 flexDirection: 'column',
                 justifyContent: 'space-between',
                 position: 'relative',
                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                 cursor: 'pointer',
                 border: '1px solid rgba(255,255,255,0.08)',
                 backdropFilter: 'blur(4px)',
                 boxShadow: Math.abs(change) > 1.5 ? `0 0 30px ${color}30` : 'none'
               }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{asset.category}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>{asset.name}</div>
                  </div>
                  <div style={{ 
                    fontSize: '0.6rem', 
                    padding: '2px 6px', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '4px', 
                    fontWeight: 900,
                    color: asset.score > 0 ? '#4ade80' : asset.score < 0 ? '#f87171' : '#94a3b8'
                  }}>
                    BIAS: {asset.score > 0 ? '+' : ''}{asset.score}
                  </div>
                </div>

                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.2rem' }}>
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                    {price > 0 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : 'AWAITING FEED...'}
                  </div>
                </div>

                {/* Mini Activity Glow */}
                <div style={{
                   position: 'absolute',
                   bottom: '12px',
                   right: '12px',
                   width: '4px',
                   height: '4px',
                   borderRadius: '50%',
                   background: '#fff',
                   boxShadow: '0 0 10px #fff',
                   opacity: 0.6,
                   animation: 'pulse-dot 2s infinite'
                }} />
             </div>
           );
        })}
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>💡 Heatmap Logic</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <strong style={{ color: '#22c55e', fontSize: '0.85rem' }}>Intense Green ({'>'}+2%)</strong>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Extreme Bullish Momentum. Usually accompanied by institutional accumulation in the COT data.</p>
          </div>
          <div>
            <strong style={{ color: '#ef4444', fontSize: '0.85rem' }}>Intense Red ({'<'}-2%)</strong>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Extreme Bearish Momentum. High probability of institutional distribution/selling pressure.</p>
          </div>
          <div>
            <strong style={{ color: '#6366f1', fontSize: '0.85rem' }}>Neural Cross-Reference</strong>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Always cross-reference the heatmap color with the 'BIAS' score. Divergence (Red Heatmap but +5 Bias) is a prime "Buy the Dip" trap.</p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
         .heatmap-tile:hover {
            transform: translateY(-5px) scale(1.02);
            filter: brightness(1.2);
            border-color: rgba(255,255,255,0.2) !important;
            z-index: 2;
         }
         @keyframes pulse-dot {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.5); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.6; }
         }
      `}} />
    </div>
  );
};

export default Heatmap;
