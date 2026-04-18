import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const TrainingModules = [
  {
    id: 'sentiment',
    title: '🧠 Module 1: Institutional Sentiment Matrix',
    subtitle: 'Hunting the Herd vs the Smart Money',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#6366f1' }}>⚡ THE EXECUTION CHEAT SHEET</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ef4444' }}>
                 <strong style={{ color: '#ef4444', fontSize: '0.85rem' }}>SELL SIGNAL 📉</strong>
                 <ul style={{ fontSize: '0.8rem', color: '#fca5a5', paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                    <li>Retail Long: {'>'} 75%</li>
                    <li>Matrix Score: -2 or lower</li>
                 </ul>
              </div>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #22c55e' }}>
                 <strong style={{ color: '#22c55e', fontSize: '0.85rem' }}>BUY SIGNAL 📈</strong>
                 <ul style={{ fontSize: '0.8rem', color: '#86efac', paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                    <li>Retail Long: {'<'} 25%</li>
                    <li>Matrix Score: +2 or higher</li>
                 </ul>
              </div>
           </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>Example: EUR/USD Hunt</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             If the Herd (Retail) is 82% Long, and the Matrix Score is -5 (Banks Selling): You ignore the retail news and Short (Sell) the pair. You are trading with the smart money, hunting the retail crowd.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'macro',
    title: '🏦 Module 2: The Macro-Economic Pulse',
    subtitle: 'Decoding Global Money Flow',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {[
            { label: 'GDP (Growth)', desc: 'Target > 2.0% for a strong economy. Below 0% is Recession.', icon: '📉' },
            { label: 'Fed Rates', desc: 'Higher Rates (> 4%) = Stronger Currency Value.', icon: '🏦' },
            { label: 'NFP (Jobs)', desc: 'Target > 200k/mo for Bullish economic pressure.', icon: '👷' }
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
              <div>
                 <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{m.label}</strong>
                 <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #eab308' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#eab308' }}>RULE OF THUMB</h3>
           <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             BUY the currency with High GDP, High Interest Rates, and High Employment.
             <br />
             SELL the currency with Negative GDP, Low Inflation, and Rising Unemployment.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'cot',
    title: '🏛️ Module 3: COT Deep-Dive Mechanics',
    subtitle: 'Institutional Positioning Analysis',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>The COT "Overflow" Numbers</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             Look at the Net Long/Short ratio for Non-Commercials (Banks).
           </p>
           <ul style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <li>✅ {'>'} 60% Net Long: Institutional ACCUMULATION (Prepare to Buy)</li>
              <li>❌ {'>'} 60% Net Short: Institutional DISTRIBUTION (Prepare to Sell)</li>
              <li>⚠️ Extremes ({'>'} 80%): Market Overextension (Possible Reversal Soon)</li>
           </ul>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
           <strong style={{ display: 'block', marginBottom: '0.5rem' }}>BULLISH EXAMPLE:</strong>
           <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Non-Commercials are 70% Net Long (Buying) + Retail is 80% Short (Selling) = Extreme Bullish Confluence. You enter Long (Buy).</p>
        </div>
      </div>
    )
  },
  {
    id: 'correlation',
    title: '🌡️ Module 4: Linear Correlation Strategy',
    subtitle: 'Exploiting Asset Relationships',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#3b82f6', marginBottom: '0.5rem' }}>POSITIVE (+1.0)</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Assets move in lockstep. (e.g., AUD/USD and Gold). If Gold flies, AUD/USD usually follows.</p>
           </div>
           <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '0.5rem' }}>NEGATIVE (-1.0)</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Assets move in opposition. (e.g., USD/JPY and Gold). They act as hedges for each other.</p>
           </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#10b981' }}>THE RISK PROTOCOL</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Avoid taking two "Long" positions on assets with {'>'} 0.85 correlation. You are essentially doubling your risk on the same move. Instead, use divergences to spot strength.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'squeeze',
    title: '🛰️ Module 5: The Monstah Squeeze Radar',
    subtitle: 'Exploiting Big Money vs. Retail Divergence',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(67, 56, 202, 0.05)', borderRadius: '12px', border: '1px solid rgba(67, 56, 202, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#818cf8' }}>⚡ UNDERSTANDING THE DIVERGENCE</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The "Squeeze" is the most powerful signal in the Reaper arsenal. It occurs when **Institutional (COT)** and **Retail (Myfxbook)** positioning are polar opposites.
           </p>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: '#3b82f61a', padding: '1rem', borderRadius: '8px', border: '1px solid #3b82f644' }}>
                 <strong style={{ color: '#3b82f6', fontSize: '0.85rem' }}>BLUE BAR (INSTITUTIONS)</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0' }}>Represents the "Smart Money" who drive the market trends.</p>
              </div>
              <div style={{ background: '#ef44441a', padding: '1rem', borderRadius: '8px', border: '1px solid #ef444444' }}>
                 <strong style={{ color: '#ef4444', fontSize: '0.85rem' }}>RED BAR (RETAIL)</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0' }}>Represents the "Hobbyist" herd often trapped in the wrong direction.</p>
              </div>
           </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #4ade80' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4ade80' }}>TRADING THE RADAR</h3>
           <ol style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
              <li><strong>Scan the Radar:</strong> Look for pairs flagged as "LONG SQUEEZE" or "SHORT SQUEEZE".</li>
              <li><strong>Confirm Divergence:</strong> Ensure Institutions are {'>'} 65% in one direction and Retail is {'>'} 65% in the OTHER.</li>
              <li><strong>The Edge:</strong> Bet WITH the Institutions and AGAINST the Retail herd. The market moves toward where the retail pain is highest.</li>
           </ol>
        </div>
      </div>
    )
  }
];

const Masterclass: React.FC = () => {
  const { setActiveView } = useApp();
  const [activeModule, setActiveModule] = useState<number>(0);

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
             <h4 style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '0.5rem' }}>🚨 REAPER PROTOCOL</h4>
             <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>Never trade on one indicator alone. Confluence of all 3 modules is the key to consistency.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="settings-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(15, 23, 41, 0.8)', minHeight: '600px' }}>
           <div>
              <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Reaper Academy • v13.3</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>{TrainingModules[activeModule].title}</h2>
              <p style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 600 }}>{TrainingModules[activeModule].subtitle}</p>
           </div>

           <div style={{ flex: 1 }}>
              {TrainingModules[activeModule].content}
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                className="btn btn-secondary" 
                disabled={activeModule === 0}
                onClick={() => setActiveModule((prev: number) => prev - 1)}
              >
                Previous Module
              </button>
              {activeModule < TrainingModules.length - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveModule((prev: number) => prev + 1)}
                  style={{ minWidth: '150px' }}
                >
                  Continue →
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ background: '#22c55e', minWidth: '150px' }}
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
