import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ShieldCheck, Newspaper, ExternalLink, Loader2, Zap } from 'lucide-react';

const TypewriterText = ({ text, speed = 10 }: { text: string; speed?: number }) => {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [index, text, speed]);

  return <span>{text.substring(0, index)}</span>;
};

interface Source {
  title: string;
  url: string;
  content: string;
}

export default function Researcher() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [report, setReport] = useState<{ answer: string; sources: Source[] } | null>(null);
  const [activeChannel, setActiveChannel] = useState('bloomberg');
  const [customInput, setCustomInput] = useState('');
  const hlsRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const channels: Record<string, string> = {
    bloomberg: "https://liveprodusphoenixeast.akamaized.net/USPhx-HD/Channel-TX-USPhx-AWS-virginia-1/Source-USPhx-16k-1-s6lk2-BP-07-02-81ykIWnsMsg_live.m3u8",
    macrobox: "https://d1ewctnvcwvvvu.cloudfront.net/playlist.m3u8",
    custom: customInput
  };

  useEffect(() => {
    if (!report && !loading && videoRef.current) {
      const video = videoRef.current;
      const streamUrl = channels[activeChannel] || channels.bloomberg;
      
      // Destroy old HLS instance before creating new one
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        const loadHls = () => {
          // @ts-ignore
          if (window.Hls && window.Hls.isSupported()) {
            // @ts-ignore
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              capLevelToPlayerSize: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hlsRef.current = hls;
          }
        };

        if (!(window as any).Hls) {
          const script = document.createElement('script');
          script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
          script.onload = loadHls;
          document.body.appendChild(script);
        } else {
          loadHls();
        }
      }
    }
  }, [report, loading, activeChannel, customInput]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setReport(null);
    setStatus('Initializing Deep Crawler...');
    
    // Fake status updates for "Vibe"
    setTimeout(() => setStatus('Scanning Institutional Feeds...'), 1000);
    setTimeout(() => setStatus('Parsing Retail Sentiment...'), 2000);
    setTimeout(() => setStatus('Finalizing Intelligence Report...'), 3500);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        setReport({ answer: data.answer, sources: data.sources });
      } else {
        alert(data.error || "Search failed");
      }
    } catch (err) {
      console.error(err);
      alert("System connection error");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="title-group">
          <h1>Global Intelligence</h1>
          <p className="subtitle">Live Web Crawler & Institutional Researcher</p>
        </div>
        <div className="status-badge live">
          <Globe size={14} className="animate-pulse" />
          WORLDWIDE ACCESS
        </div>
      </header>

      <div className="research-grid">
        <section className="research-search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Ex: 'EURUSD institutional sentiment' or 'Nvidia earnings outlook'..."

              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            </button>
          </form>
          <div className="search-tags">
            <span onClick={() => setQuery("Fed Interest Rates policy impact")}>Fed Interest Rates</span>
            <span onClick={() => setQuery("Latest COT report Gold analysis")}>Gold COT</span>
            <span onClick={() => setQuery("Institutional positioning S&P 500")}>Equity Positioning</span>
          </div>
        </section>

        {loading && (
          <div className="scanning-container fade-in">
            <div className="scanning-bar">
              <div className="scanning-progress"></div>
            </div>
            <p className="status-text"><Zap size={14} /> {status}</p>
          </div>
        )}

        {report && (
          <div className="report-container fade-in">
            <div className="answer-section">
              <div className="section-header">
                <ShieldCheck className="icon-green" size={14} />
                <h3>INTELLIGENCE REPORT</h3>
              </div>
              <div className="answer-box">
                <TypewriterText text={report.answer} speed={5} />
              </div>
            </div>

            <div className="sources-section">
              <div className="section-header">
                <Newspaper className="icon-blue" size={14} />
                <h3>VERIFIED SOURCES</h3>
              </div>
              <div className="sources-list">
                {report.sources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="source-link">
                    <div className="source-info">
                      <span className="source-title">{src.title}</span>
                      <span className="source-url">{src.url}</span>
                    </div>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="live-tv-container fade-in" style={{ marginTop: '2rem' }}>
            <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444', animation: 'pulse-dot 2s infinite' }}></div>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem', color: '#94a3b8' }}>Live Satellite Feed <span style={{ color: '#ef4444' }}>• ACTIVE</span></h3>
              </div>
              <div className="channel-selector" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['bloomberg', 'macrobox', 'custom'].map((ch) => (
                  <button 
                    key={ch}
                    onClick={() => setActiveChannel(ch)}
                    style={{
                      background: activeChannel === ch ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${activeChannel === ch ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: activeChannel === ch ? '#3b82f6' : '#94a3b8',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {ch === 'macrobox' ? 'STREET' : ch}
                  </button>
                ))}
              </div>
            </div>

            {activeChannel === 'custom' && (
              <div className="custom-stream-input" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Paste institutional HLS link (.m3u8)..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            )}
            <div className="video-wrapper" style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden', 
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              background: '#0f172a'
            }}>
                <video 
                  ref={videoRef}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0f172a', objectFit: 'cover' }}
                  autoPlay 
                  muted 
                  controls 
                  playsInline>
                </video>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .research-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
        }
        .search-form {
          display: flex;
          gap: 1rem;
          background: rgba(15, 23, 42, 0.8);
          padding: 0.75rem;
          border-radius: 14px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .search-form input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 0.5rem;
          font-size: 1.1rem;
          outline: none;
        }
        .search-form button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          width: 50px;
          height: 44px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-form button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .search-form button.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .search-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .search-tags span {
          display: inline-block;
          white-space: nowrap;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.4rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          transition: all 0.2s;
        }
        .search-tags span:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }
        
        .scanning-container {
          padding: 2rem;
          text-align: center;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .scanning-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 1rem;
          overflow: hidden;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        .scanning-progress {
          height: 100%;
          background: #3b82f6;
          width: 40%;
          border-radius: 10px;
          animation: scan 2s infinite ease-in-out;
        }
        @keyframes scan {
          0% { margin-left: -40%; }
          100% { margin-left: 100%; }
        }
        .status-text {
          color: #3b82f6;
          font-family: monospace;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .report-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          animation: slideUp 0.4s ease-out;
        }
        .answer-box {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2rem;
          border-radius: 20px;
          line-height: 1.8;
          color: #e2e8f0;
          font-size: 1.1rem;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .source-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(30, 41, 59, 0.5);
          padding: 1.25rem;
          border-radius: 14px;
          margin-bottom: 0.75rem;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }
        .source-link:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          transform: translateX(4px);
        }
        .source-title {
          display: block;
          color: #f8fafc;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .source-url {
          display: block;
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 0.3rem;
        }
        .empty-state {
          position: relative;
          text-align: center;
          padding: 6rem 0;
          color: #475569;
          overflow: hidden;
        }
        .empty-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .report-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
