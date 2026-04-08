import React from 'react';
import { useApp } from '../contexts/AppContext';

const Landing: React.FC = () => {
  const { setActiveView } = useApp();
  const [audioEnabled, setAudioEnabled] = React.useState(false);

  // Reaper 13.0 - Money Sound Engine
  const playMoneySound = (isForce = false) => {
    if (!audioEnabled && !isForce) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');
    audio.volume = 0.35;
    audio.play().catch(e => console.log('Audio blocked by browser:', e));
  };

  const handleActivate = () => {
    setAudioEnabled(true);
    playMoneySound(true); // First click unlocks the protocol
  };

  const navItems = [
    { 
      id: 'sentiment', 
      title: 'Neural Sentiment Matrix', 
      desc: 'Institutional vs Retail Sentiment Leaderboards with 1:1 parity.',
      icon: '📊',
      color: '#3b82f6'
    },
    { 
      id: 'backtest', 
      title: 'Backtest Lab', 
      desc: 'Simulate historical trades with full-featured Pro charts and Demo Capital.',
      icon: '⌛',
      color: '#ec4899'
    },
    { 
      id: 'research', 
      title: 'Global Intel Portal', 
      desc: 'Live neural web-crawler for real-time institutional alpha and news.',
      icon: '🌍',
      color: '#10b981'
    },
    { 
      id: 'cot', 
      title: 'COT Deep-Dive', 
      desc: 'Advanced Institutional Divergence & Smart Money Traps.',
      icon: '🏛️',
      color: '#8b5cf6'
    },
    { 
      id: 'fundamental', 
      title: 'Macro Sovereign Dashboard', 
      desc: 'The Big Five: GDP, CPI, Fed Rates, Jobs, and PMI Pulse.',
      icon: '🏦',
      color: '#f59e0b'
    },
    { 
      id: 'ai', 
      title: 'Neural AI Reasoner', 
      desc: 'DeepSeek R1 step-by-step institutional trade dossiers.',
      icon: '🧠',
      color: '#6366f1'
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
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          letterSpacing: '-0.02em', 
          marginBottom: '1rem',
          background: 'linear-gradient(to bottom, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          THE MONSTAH REAPER HAS ARRIVED.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', marginBottom: '2rem' }}>
          Absolute market intelligence for the retail elite. Unified Sentiment, COT Deep-Dives, and the Neural AI Reasoner in one terminal.
        </p>

        {!audioEnabled && (
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
        )}
      </header>

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
      `}} />
    </div>
  );
};

export default Landing;
