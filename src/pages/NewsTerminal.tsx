import React, { useEffect, useRef, useState, useMemo } from 'react';

interface SquawkHeadline {
  id: string;
  time: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
}

const MOCK_SQUAWKS: SquawkHeadline[] = [
  { id: '1', time: '13:30:12', content: 'ECB\'s Lagarde: "We are considering all options for June meeting."', priority: 'high', impact: 'EUR Bullish' },
  { id: '2', time: '13:28:45', content: 'USD Index (DXY) testing 104.50 level. Safe-haven inflows noted.', priority: 'medium', impact: 'USD Bullish' },
  { id: '3', time: '13:25:10', content: 'Japanese Finance Minister Suzuki: "Close monitoring of FX movements with sense of urgency."', priority: 'high', impact: 'JPY Bullish' },
  { id: '4', time: '13:22:01', content: 'WTI Oil futures drop 1.2% on reports of inventory builds.', priority: 'medium', impact: 'CAD Bearish' },
  { id: '5', time: '13:18:55', content: 'UK Manufacturing PMI beats expectations at 51.2 vs 50.8 forecasted.', priority: 'high', impact: 'GBP Bullish' },
  { id: '6', time: '13:15:30', content: 'Bitcoin (BTC) whales moving large quantities to cold storage. Accumulation phase?', priority: 'low', impact: 'Crypto Neutral' },
  { id: '7', time: '13:10:05', content: 'RBNZ Governor Orr: "No rush to cut rates until inflation is within 1-3% target band."', priority: 'medium', impact: 'NZD Bullish' },
];

const NewsTerminal: React.FC = () => {
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const [squawks] = useState<SquawkHeadline[]>(MOCK_SQUAWKS);

  // Load TradingView News Widget
  useEffect(() => {
    if (!newsContainerRef.current) return;
    newsContainerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: 'all_symbols',
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      locale: 'en'
    });
    newsContainerRef.current.appendChild(script);
  }, []);

  // AI Narrative Analysis (Simple Mock but Institutional Feel)
  const currentNarrative = useMemo(() => {
    return {
      mood: 'Risk-Off / Safe Haven',
      reason: 'Central Bank hawkishness and geopolitical tensions are driving capital into USD and Gold.',
      topAsset: 'USD',
      riskFactor: 'Escalating conflict in the Middle East causing Oil volatility.'
    };
  }, []);

  return (
    <div className="page-container">
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📻 Monstah Squawk Terminal</h1>
          <p>Real-time institutional news headlines and market narratives</p>
        </div>
        <div className="header-actions">
           <div className="status-indicator">
              <span className="status-dot live" />
              <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 700 }}>SQUAWK LIVE</span>
           </div>
        </div>
      </header>

      {/* Institutional Narrative Section */}
      <div className="settings-card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
           <h2 className="settings-section-title" style={{ fontSize: '1.1rem', margin: 0 }}>🧠 AI-Curated Market Narrative</h2>
           <span style={{ fontSize: '0.7rem', color: '#8b9ab8' }}>Refreshed 2m ago</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
           <div>
              <span style={{ fontSize: '0.65rem', color: '#8b9ab8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Mood</span>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fca5a5' }}>{currentNarrative.mood}</p>
           </div>
           <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.65rem', color: '#8b9ab8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Driver</span>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{currentNarrative.reason}</p>
           </div>
           <div>
              <span style={{ fontSize: '0.65rem', color: '#8b9ab8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Watch</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ade80' }}>{currentNarrative.topAsset}</p>
           </div>
        </div>
      </div>

      <div className="settings-row-2" style={{ marginTop: '1.5rem', height: '600px' }}>
        
        {/* Squawk Feed Terminal */}
        <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="settings-section-title" style={{ margin: 0 }}>Institutional Headlines</h2>
            <button className="btn btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Filter Alerts</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {squawks.map((s) => (
              <div key={s.id} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid rgba(255,255,255,0.03)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                borderLeft: s.priority === 'high' ? '3px solid #ef4444' : '3px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#8b9ab8', fontFamily: 'monospace' }}>[{s.time} UTC]</span>
                  <span style={{ 
                     color: s.impact.includes('Bullish') ? '#4ade80' : s.impact.includes('Bearish') ? '#f87171' : '#8b9ab8', 
                     fontWeight: 700, 
                     fontSize: '0.7rem', 
                     textTransform: 'uppercase' 
                  }}>
                    {s.impact}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5, fontWeight: s.priority === 'high' ? 700 : 400 }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global News Sidebar (Interactive Widget) */}
        <div className="settings-card" style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
             <h2 className="settings-section-title" style={{ margin: 0 }}>Global Market Wire</h2>
           </div>
           <div ref={newsContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

      </div>
    </div>
  );
};

export default NewsTerminal;
