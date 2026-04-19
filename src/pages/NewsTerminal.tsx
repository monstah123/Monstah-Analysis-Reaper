import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { type NewsHeadline } from '../services/alphaVantage';

const NewsTerminal: React.FC = () => {
  const { } = useApp();
  const newsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState('schwab');

  const channels: Record<string, { label: string; icon: string; desc: string; url: string; type: 'hls' | 'youtube' }> = {
    schwab: {
      label: 'Schwab Network',
      icon: '📺',
      desc: 'Live markets, expert analysis, 24/7',
      url: 'https://d1ewctnvcwvvvu.cloudfront.net/playlist.m3u8',
      type: 'hls',
    },
    bloomberg: {
      label: 'Bloomberg TV',
      icon: '📡',
      desc: 'Global finance & market news',
      url: 'https://liveprodusphoenixeast.akamaized.net/USPhx-HD/Channel-TX-USPhx-AWS-virginia-1/Source-USPhx-16k-1-s6lk2-BP-07-02-81ykIWnsMsg_live.m3u8',
      type: 'hls',
    },
    cnbc: {
      label: 'CNBC',
      icon: '🗞️',
      desc: 'Business & financial news',
      url: 'https://www.youtube.com/embed/live_stream?channel=UCvJJ_dzjViJCoLf5uKUTwoA&autoplay=1&mute=1&rel=0&modestbranding=1',
      type: 'youtube',
    },
  };

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

  // Live stream switcher with HLS cleanup
  useEffect(() => {
    const ch = channels[activeChannel];

    // Always destroy any existing HLS instance when switching channels
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // YouTube channels render an iframe — no HLS setup needed
    if (ch.type === 'youtube') return;

    const video = videoRef.current;
    if (!video) return;

    video.src = '';

    const initStream = () => {
      // @ts-ignore
      if (window.Hls && window.Hls.isSupported()) {
        // @ts-ignore
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, capLevelToPlayerSize: true });
        hls.loadSource(ch.url);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = ch.url;
      }
    };

    // @ts-ignore
    if (!window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = initStream;
      document.body.appendChild(script);
    } else {
      initStream();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel]);

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
        .channel-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .channel-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 0.9rem 1rem;
          border-radius: 14px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          transition: all 0.2s ease;
          text-align: center;
        }
        .channel-tab:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.15);
        }
        .channel-tab.active {
          background: linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.12) 100%);
          border-color: #3b82f6;
          box-shadow: 0 0 20px rgba(59,130,246,0.15);
        }
        .channel-tab-icon {
          font-size: 1.5rem;
        }
        .channel-tab-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: 0.02em;
        }
        .channel-tab.active .channel-tab-label {
          color: #93c5fd;
        }
        .channel-tab-desc {
          font-size: 0.68rem;
          color: #64748b;
          line-height: 1.3;
        }
        .channel-tab.active .channel-tab-desc {
          color: #8b9ab8;
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

      {/* Institutional Video Matrix */}
      <div className="settings-card" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* SAT-LINK Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>
            SAT-LINK ACTIVE
          </span>
          <span style={{ marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc' }}>
            INSTITUTIONAL VIDEO MATRIX
          </span>
        </div>

        {/* Channel Selector Tabs */}
        <div className="channel-tabs">
          {Object.entries(channels).map(([key, ch]) => (
            <button
              key={key}
              className={`channel-tab${activeChannel === key ? ' active' : ''}`}
              onClick={() => setActiveChannel(key)}
            >
              <span className="channel-tab-icon">{ch.icon}</span>
              <span className="channel-tab-label">{ch.label}</span>
              <span className="channel-tab-desc">{ch.desc}</span>
            </button>
          ))}
        </div>

        {/* Video Player */}
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          background: '#000'
        }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(0,0,0,0.65)', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#fff', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', letterSpacing: '0.05em' }}>
            {channels[activeChannel].icon} {channels[activeChannel].label.toUpperCase()}
          </div>

          {channels[activeChannel].type === 'youtube' ? (
            <iframe
              key={activeChannel}
              src={channels[activeChannel].url}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={channels[activeChannel].label}
            />
          ) : (
            <video
              ref={videoRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
              autoPlay
              muted
              controls
              playsInline
            />
          )}
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

        {/* Global News Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
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
