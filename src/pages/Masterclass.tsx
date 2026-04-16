import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const TrainingModules = [
  {
    id: 'sentiment',
    title: '🧠 Module 1: Institutional Sentiment Matrix',
    subtitle: 'Hunting the Herd vs the Smart Money',
    description: `The Matrix is your primary weapon. It tracks the net positioning of retail traders (the Herd) against the banks. 

Key Principle: High-probability trades happen when the Herd is trapped in one direction while Institutional Bias (COT) is pushing the other way. Look for "Bullish Overflow" where retail is net-short, or "Bearish Extreme" where retail is net-long.`,
    image: '/Users/petersoncharles/.gemini/antigravity/brain/657559f7-b92b-4749-b1a8-9db20d3cba6d/sentiment_masterclass_illustration_1776334754314.png'
  },
  {
    id: 'macro',
    title: '🏦 Module 2: The Macro-Economic Pulse',
    subtitle: 'Understanding the Global Engine',
    description: `Macro data tells you *why* a pair is moving. We track the "Big Five": GDP, CPI (Inflation), Jobs (NFP), Interest Rates, and PMI Pulse.

Execution: A strong currency requires an expanding GDP, low unemployment, and rising (but controlled) interest rates. When Macro and Sentiment align, the edge is massive.`,
    image: '/Users/petersoncharles/.gemini/antigravity/brain/657559f7-b92b-4749-b1a8-9db20d3cba6d/macro_masterclass_illustration_1776334776226.png'
  },
  {
    id: 'cot',
    title: '🏛️ Module 3: COT Deep-Dive Mechanics',
    subtitle: 'Tracking Large Institutional Footprints',
    description: `The Commitment of Traders (COT) report shows us exactly where the Commercial Hedgers and Large Speculators are positioned.

Alpha Zone: We hunt for "Institutional Divergence"—where price is dropping but the banks are buying (Accumulation), or price is rising while Banks are selling (Distribution).`,
    image: '/Users/petersoncharles/.gemini/antigravity/brain/657559f7-b92b-4749-b1a8-9db20d3cba6d/cot_masterclass_illustration_1776334815357.png'
  }
];

const Masterclass: React.FC = () => {
  const { setActiveView } = useApp();
  const [activeModule, setActiveModule] = useState(0);

  return (
    <div className="page-container" style={{ paddingBottom: '5rem' }}>
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div className="header-title">
          <h1>🎓 Institutional Masterclass</h1>
          <p>The definitive guide to the Monstah Reaper trading system.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setActiveView('landing')}>EXIT TO LOBBY</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {TrainingModules.map((m, idx) => (
            <div 
              key={m.id}
              onClick={() => setActiveModule(idx)}
              style={{
                padding: '1.25rem',
                background: activeModule === idx ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                border: activeModule === idx ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <h3 style={{ fontSize: '0.9rem', color: activeModule === idx ? '#fff' : '#94a3b8', margin: 0 }}>{m.title}</h3>
            </div>
          ))}
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h4 style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '0.5rem' }}>🚨 PRO TIP</h4>
             <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>Always start your analysis with the <strong>Sentiment Matrix</strong>. If the Herd is net-long on a pair, your Reaper mission is usually to find a Short entry.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="settings-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>{TrainingModules[activeModule].title}</h2>
              <p style={{ fontSize: '1.1rem', color: '#6366f1', fontWeight: 700 }}>{TrainingModules[activeModule].subtitle}</p>
           </div>

           <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <img 
                src={TrainingModules[activeModule].image} 
                alt={TrainingModules[activeModule].title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
           </div>

           <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                {TrainingModules[activeModule].description}
              </p>
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                disabled={activeModule === 0}
                onClick={() => setActiveModule(prev => prev - 1)}
              >
                Previous Module
              </button>
              {activeModule < TrainingModules.length - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveModule(prev => prev + 1)}
                >
                  Next Module →
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ background: '#22c55e' }}
                  onClick={() => setActiveView('dashboard')}
                >
                  GO HUNTING 🔪
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Masterclass;
