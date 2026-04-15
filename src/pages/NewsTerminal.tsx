import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { type NewsHeadline } from '../services/alphaVantage';

const NewsTerminal: React.FC = () => {
  const { } = useApp();
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const bloombergRef = useRef<HTMLVideoElement>(null);
  const streetWireRef = useRef<HTMLVideoElement>(null);
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/news?t=${Date.now()}`);
      if (!res.ok) throw new Error('Institutional Feed Offline');
      const data = await res.json();
      
      if (data.success && data.news) {
        const mapped = data.news.map((item: any, index: number) => ({
          id: `live-${index}-${Date.now()}`,
          title: item.title,
          url: item.url,
          time: item.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          source: item.source || 'Institutional Wire',
          summary: item.title,
          sentiment: item.sentiment || 'Neutral',
          sentimentScore: item.sentiment === 'Bullish' ? 0.4 : item.sentiment === 'Bearish' ? -0.4 : 0
        }));
        setHeadlines(mapped);
        setError(null);
      }
    } catch (e) {
      console.error('Terminal Sync Failure:', e);
      setError('INSTITUTIONAL FEED OFFLINE - SYNCING...');
      // Note: We keep the old headlines if we have them, rather than showing fake news
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); 
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Load TradingView News Widget (Institutional Stream)
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

  // Institutional Live Satellite Feeds - Dual HLS Sync
  useEffect(() => {
    const setupStream = (video: HTMLVideoElement | null, url: string) => {
      if (!video) return;
      
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.onload = () => {
          // @ts-ignore
          if (window.Hls && window.Hls.isSupported()) {
            // @ts-ignore
            const hls = new window.Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          }
        };
        document.body.appendChild(script);
      }
    };

    setupStream(bloombergRef.current, "https://liveprodusphoenixeast.akamaized.net/USPhx-HD/Channel-TX-USPhx-AWS-virginia-1/Source-USPhx-16k-1-s6lk2-BP-07-02-81ykIWnsMsg_live.m3u8");
    setupStream(streetWireRef.current, "https://d1ewctnvcwvvvu.cloudfront.net/playlist.m3u8");

    return () => {
      // Cleanup script injection if needed, though multiple injections of hls.js are generally fine
    };
  }, []);

  // Use real sentiment data to determine global mood
  const currentNarrative = useMemo(() => {
    if (headlines.length === 0) return { mood: 'Syncing...', reason: 'Market data is being processed.', topAsset: 'Scan Pending...', riskFactor: 'N/A' };
    
    // Simple logic: Calc avg sentiment score
    const avg = headlines.reduce((sum, h) => sum + h.sentimentScore, 0) / headlines.length;
    
    return {
      mood: avg > 0.15 ? 'Institutional Bullish' : avg < -0.15 ? 'Institutional Bearish' : 'Neutral / Mixed',
      reason: 'Automated sentiment analysis based on late-breaking institutional headlines.',
      topAsset: headlines[0]?.title.split(' ')[0] || 'FX', // First word of newest headline as a rough'top asset'
      riskFactor: 'Volatily in sentiment readings indicates market uncertainty.'
    };
  }, [headlines]);

  return (
    <div className="page-container">
      <style>{`
        @keyframes pulse-dot {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>📻 Monstah Squawk Terminal</h1>
          <p>Real-time institutional news headlines and market narratives</p>
        </div>
        <div className="header-actions">
           <div className="status-indicator">
              <span className={`status-dot ${error ? 'offline' : 'live'}`} style={{ backgroundColor: error ? '#ef4444' : '#4ade80' }} />
              <span style={{ fontSize: '0.8rem', color: error ? '#ef4444' : '#4ade80', fontWeight: 700 }}>
                {error ? 'FEED OFFLINE' : 'SQUAWK LIVE'}
              </span>
           </div>
        </div>
      </header>

      {/* Institutional Narrative Section */}
      <div className="settings-card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
           <h2 className="settings-section-title" style={{ fontSize: '1.1rem', margin: 0 }}>🧠 AI Sentiment Analysis</h2>
           <span style={{ fontSize: '0.7rem', color: '#8b9ab8' }}>Syncing: {isLoading ? 'Working...' : 'Live'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
           <div>
              <span style={{ fontSize: '0.65rem', color: '#8b9ab8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Sentiment</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: currentNarrative.mood.includes('Bullish') ? '#4ade80' : currentNarrative.mood.includes('Bearish') ? '#fca5a5' : '#8b9ab8' }}>
                {currentNarrative.mood}
              </p>
           </div>
           <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.65rem', color: '#8b9ab8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institutional Driver</span>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{currentNarrative.reason}</p>
           </div>
           <div>
              <span style={{ fontSize: '0.65rem', color: '#8b9ab8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Focus</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{currentNarrative.topAsset}</p>
           </div>
        </div>
      </div>

      <div className="settings-row-2" style={{ marginTop: '1.5rem', minHeight: '600px' }}>
        
        {/* Squawk Feed Terminal */}
        <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="settings-section-title" style={{ margin: 0 }}>Institutional Headlines</h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>LIVE TICKER</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {isLoading && headlines.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>Initializing secure news link...</div>
            ) : error ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#fca5a5' }}>
                  {error === 'Alpha Vantage Key Required' 
                    ? '⚠️ Please add your Alpha Vantage API Key in Settings to enable Live Squawk.' 
                    : error}
               </div>
            ) : (
              headlines.map((h) => (
                <div key={h.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid rgba(255,255,255,0.03)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  borderLeft: Math.abs(h.sentimentScore) > 0.4 ? '3px solid var(--accent)' : '3px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                    <span style={{ color: '#8b9ab8', fontFamily: 'monospace' }}>[{h.time}] — {h.source}</span>
                    <span style={{ 
                       color: h.sentiment.includes('Bullish') ? '#4ade80' : h.sentiment.includes('Bearish') ? '#f87171' : '#8b9ab8', 
                       fontWeight: 700, 
                       textTransform: 'uppercase' 
                    }}>
                      {h.sentiment}
                    </span>
                  </div>
                  <a href={h.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: Math.abs(h.sentimentScore) > 0.3 ? 700 : 400 }}>{h.title}</p>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global News Sidebar & Live TV */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
          
           {/* Dual TV Satellite Matrix */}
           <div className="settings-card" style={{ padding: 0, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse-dot 2s infinite' }} />
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>SAT-LINK ACTIVE</span>
                </div>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc', margin: 0, marginLeft: 'auto' }}>
                  INSTITUTIONAL VIDEO MATRIX
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.1)' }}>
                {/* Channel 1: Bloomberg */}
                <div 
                  style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', cursor: 'pointer' }}
                  onClick={() => bloombergRef.current?.requestFullscreen()}
                >
                  <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>CH1: BLOOMBERG</div>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '4px', color: '#fff', fontSize: '12px' }}>⛶</div>
                  <video ref={bloombergRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay muted controls playsInline />
                </div>
                {/* Channel 2: Street Wire */}
                <div 
                  style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', cursor: 'pointer' }}
                  onClick={() => streetWireRef.current?.requestFullscreen()}
                >
                  <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>CH2: STREET WIRE</div>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '4px', color: '#fff', fontSize: '12px' }}>⛶</div>
                  <video ref={streetWireRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay muted controls playsInline />
                </div>
              </div>
           </div>

           {/* TradingView Widget Card */}
           <div className="settings-card" style={{ padding: 0, flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h2 className="settings-section-title" style={{ margin: 0 }}>Global Market Wire</h2>
              </div>
              <div ref={newsContainerRef} style={{ width: '100%', height: '100%' }} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default NewsTerminal;
