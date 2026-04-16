import React from 'react';
import { useApp } from '../contexts/AppContext';

const Landing: React.FC = () => {
  const { setActiveView, audioEnabled, setAudioEnabled, playMoneySound } = useApp();

  const handleActivate = () => {
    setAudioEnabled(true);
    playMoneySound(true); // First click unlocks the protocol
  };

  const navItems = [
    { 
      id: 'dashboard', 
      title: 'Market Dashboard', 
      desc: 'Central command center for real-time asset scoring and unified logic.',
      icon: '⚡',
      color: '#eab308'
    },
    { 
      id: 'sentiment', 
      title: 'Neural Sentiment Matrix', 
      desc: '100% Live Institutional vs Retail Sentiment Leaderboards with 0% mock data.',
      icon: '📊',
      color: '#3b82f6'
    },
    { 
      id: 'calculator', 
      title: 'Institutional Calculator', 
      desc: 'Precision Lot Sizing and Risk Management based on institutional math.',
      icon: '🧮',
      color: '#6366f1'
    },
    { 
      id: 'research', 
      title: 'Global Intel Portal', 
      desc: 'Real-time neural web-crawler for verified institutional alpha and news.',
      icon: '🌍',
      color: '#10b981'
    },
    { 
      id: 'cot', 
      title: 'COT Deep-Dive', 
      desc: 'Official CFTC Public Reporting integration for Smart Money tracking.',
      icon: '🏛️',
      color: '#8b5cf6'
    },
    { 
      id: 'fundamental', 
      title: 'Inst. Fundamental Matrix', 
      desc: 'Direct FRED/BLS heartbeat: GDP, CPI, Fed Rates, and NFP Pulse.',
      icon: '🏦',
      color: '#f59e0b'
    },
    {
      id: 'technical',
      title: 'Institutional Flow',
      desc: 'Live momentum scanner and Real-Time Institutional Bias Matrix.',
      icon: '📈',
      color: '#14b8a6'
    },
    {
      id: 'yield-spreads',
      title: 'Yield Spread Divergence',
      desc: 'Live Bond market differentials tracking global liquidity flows.',
      icon: '⚖️',
      color: '#f43f5e'
    },
    {
      id: 'correlation',
      title: 'Linear Correlation Matrix',
      desc: 'Institutional-grade Pearson coefficients across all global asset classes.',
      icon: '🌡️',
      color: '#06b6d4'
    },
    {
      id: 'dashboard',
      title: 'Global Liquidity Engine',
      desc: 'Predictive session volume and institutional money flow forecasting.',
      icon: '🌊',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="landing-layout" style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top right, #1e293b 0%, #020617 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#f8fafc',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Background Decor */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <header style={{ textAlign: 'center', marginBottom: '4rem', zIndex: 10 }}>
        <div style={{ 
          fontSize: '0.8rem', 
          fontWeight: 800, 
          letterSpacing: '0.4em', 
          color: '#3b82f6', 
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          Institutional Pulse · Neural Matrix · v13.0
        </div>
        <h1 className="landing-title">
          THE MONSTAH REAPER HAS ARRIVED.
        </h1>
        <p className="landing-header-subtitle">
          Absolute market intelligence for the retail elite. Unified Sentiment, COT Deep-Dives, and the Neural AI Reasoner in one terminal.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          {!audioEnabled ? (
            <button 
              onClick={handleActivate}
              className="btn btn-primary"
              style={{ 
                padding: '1rem 2.5rem', 
                fontSize: '0.9rem', 
                letterSpacing: '0.1em', 
                fontWeight: 800, 
                borderRadius: '50px',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
                border: 'none',
                animation: 'pulseGlow 2s infinite alternate'
              }}
            >
              🔊 ACTIVATE NEURAL LINK (ENABLE SOUND)
            </button>
          ) : (
            <div style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', fontSize: '0.8rem', fontWeight: 800 }}>
              ✅ NEURAL AUDIO LINK SECURED
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
             <button 
                onClick={() => setActiveView('masterclass')}
                className="btn btn-secondary"
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontSize: '0.9rem', 
                  fontWeight: 800, 
                  borderRadius: '50px',
                  border: '1px solid #6366f1',
                  color: '#6366f1',
                  background: 'rgba(99, 102, 241, 0.05)',
                  cursor: 'pointer'
                }}
              >
                🎓 LEARN THE SYSTEM (MASTERCLASS)
              </button>
              <button 
                onClick={() => setActiveView('dashboard')}
                className="btn btn-primary"
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontSize: '0.9rem', 
                  fontWeight: 800, 
                  borderRadius: '50px',
                  background: audioEnabled ? '#22c55e' : 'rgba(255,255,255,0.05)',
                  color: audioEnabled ? '#fff' : '#64748b',
                  border: audioEnabled ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: audioEnabled ? 'pointer' : 'not-allowed',
                  opacity: audioEnabled ? 1 : 0.6
                }}
                disabled={!audioEnabled}
              >
                ⚡ ENTER TERMINAL
              </button>
          </div>
        </div>
      </header>
      
      {/* Global Liquidity Clock Preview Overlay */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '1200px', 
          background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '32px',
          padding: '2.5rem',
          marginBottom: '4rem',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10,
          opacity: audioEnabled ? 1 : 0.3,
          transition: 'all 0.8s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
             <h4 style={{ fontSize: '0.9rem', color: '#6366f1', letterSpacing: '0.2em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Operational Status: LIVE
             </h4>
             <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>GLOBAL LIQUIDITY CLOCK</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Golden Time Window:</p>
             <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#eab308' }}>LONDON / NEW YORK OVERLAP</span>
          </div>
        </div>

        <div style={{ height: '220px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
           {[
             { name: 'SYDNEY', color: '#3b82f6', start: 0, width: 30 },
             { name: 'TOKYO', color: '#ec4899', start: 10, width: 35 },
             { name: 'LONDON', color: '#0ea5e9', start: 35, width: 40 },
             { name: 'NEW YORK', color: '#22c55e', start: 50, width: 40 }
           ].map(s => (
             <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ width: '80px', fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>{s.name}</span>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', position: 'relative' }}>
                   <div style={{ 
                      position: 'absolute', 
                      left: `${s.start}%`, 
                      width: `${s.width}%`, 
                      height: '100%', 
                      background: `linear-gradient(90deg, ${s.color}00, ${s.color}, ${s.color}00)`, 
                      borderRadius: '4px',
                      boxShadow: `0 0 20px ${s.color}40`
                   }} />
                </div>
             </div>
           ))}

           {/* Money Flow Volume Bars */}
           <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-end', height: '40px', gap: '2px', paddingLeft: '95px' }}>
              {Array.from({ length: 48 }).map((_, i) => {
                const h = (i / 2 + 22) % 24;
                const vol = (Math.exp(-Math.pow(h - 10, 2) / 6) * 1.8) + (Math.exp(-Math.pow(h - 14.5, 2) / 4) * 2.6) + (Math.exp(-Math.pow(h - 18, 2) / 8) * 1.4) + (Math.exp(-Math.pow(h - 2, 2) / 6) * 0.6) + 0.2;
                const isPulse = Math.abs((i / 2) - 13.5) < 0.25; // Simulated active spot
                const barColor = vol > 1.4 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(71, 85, 105, 0.2)';
                
                return (
                  <div key={i} style={{ 
                    flex: 1, 
                    height: `${(vol / 3.2) * 100}%`, 
                    background: isPulse ? '#6366f1' : barColor, 
                    borderRadius: '1px',
                    transition: 'all 0.3s ease',
                    boxShadow: isPulse ? '0 0 15px #6366f1' : 'none',
                    position: 'relative'
                  }}>
                    {isPulse && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '-30px', 
                          left: '50%', 
                          transform: 'translateX(-50%)', 
                          background: '#1e293b', 
                          border: '1px solid #6366f1', 
                          color: '#fff', 
                          fontSize: '0.65rem', 
                          fontWeight: 900, 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          whiteSpace: 'nowrap',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                        }}>
                          ${(vol * 1.6).toFixed(2)} TRILLION
                        </div>
                    )}
                  </div>
                );
              })}
           </div>

           {/* Scanning Laser */}
           <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: '45%', 
              width: '2px', 
              background: 'linear-gradient(to bottom, transparent, #6366f1, transparent)', 
              boxShadow: '0 0 15px #6366f1',
              zIndex: 5
           }}>
             <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                LIVE PULSE
             </div>
           </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
           <div style={{ padding: '1.5rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '16px', border: '1px solid rgba(234, 179, 8, 0.1)' }}>
              <div style={{ color: '#eab308', fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <h5 style={{ fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Tight Spreads</h5>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>High volume session overlaps ensure maximum liquidity and minimum slippage.</p>
           </div>
           <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <div style={{ color: '#6366f1', fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
              <h5 style={{ fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.25rem' }}>Predictive Flow</h5>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Neural forecasting predicts the next volatility spike before the major market opens.</p>
           </div>
        </div>
      </div>

      <div className="landing-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        width: '100%', 
        maxWidth: '1200px',
        zIndex: 10,
        opacity: audioEnabled ? 1 : 0.4,
        pointerEvents: audioEnabled ? 'auto' : 'none',
        transition: 'all 0.5s ease'
      }}>
        {navItems.map((item) => (
          <div 
            key={item.id}
            onMouseEnter={() => playMoneySound()}
            onClick={() => setActiveView(item.id)}
            className="landing-card"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '2rem',
              borderRadius: '24px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ 
              fontSize: '2.5rem', 
              width: '64px', 
              height: '64px', 
              background: `${item.color}20`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '16px',
              border: `1px solid ${item.color}40`
            }}>
              {item.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#f8fafc' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: item.color }}>
              ENTER MODULE <span>→</span>
            </div>
          </div>
        ))}
      </div>

      <div 
        onClick={() => { playMoneySound(); setActiveView('dashboard'); }}
        className="landing-card"
        style={{
          width: '100%',
          maxWidth: '1200px',
          background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.5rem 2rem',
          borderRadius: '24px',
          cursor: 'pointer',
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          opacity: audioEnabled ? 1 : 0.4,
          pointerEvents: audioEnabled ? 'auto' : 'none',
          transition: 'all 0.5s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse-dot 2s infinite' }}></div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '0.05em' }}>LIVE SQUEEZE DETECTOR</h3>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, flex: '1 1 300px' }}>
          The terminal now actively hunts for extreme <strong>Smart vs Dumb Money</strong> traps. Look for the glowing pulse on the Dashboard.
        </p>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e', marginLeft: 'auto' }}>
          ACTIVATE MODULE <span>→</span>
        </div>
      </div>

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: '#475569', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
        <p>© 2026 MONSTAH ANALYSIS REAPER · POWERED BY DEEPSEEK NEURAL MATRIX · 100% PARITY SECURED</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .landing-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .landing-card:active {
          transform: scale(0.98);
        }
        .landing-title {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          background: linear-gradient(to bottom, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .landing-header-subtitle {
          font-size: 1.2rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        @media (max-width: 768px) {
          .landing-layout {
            padding: 1rem !important;
          }
          .landing-title {
            font-size: 2.2rem;
          }
          .landing-header-subtitle {
            font-size: 1rem;
            padding: 0 1rem;
          }
          .landing-card {
            padding: 1.25rem !important;
          }
        }
      `}} />
    </div>
  );
};

export default Landing;
