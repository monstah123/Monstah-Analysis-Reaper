const TrainingModules = [
  {
    id: 'sentiment',
    title: '🧠 Module 1: Institutional Sentiment Matrix',
    subtitle: 'Hunting the Herd vs the Smart Money',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="settings-card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}>THE RETAIL HERD</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>Driven by FOMO and emotion. They consistently enter late and exit early. We identify where they are "trapped."</p>
          </div>
          <div className="settings-card" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <h4 style={{ color: '#4ade80', fontSize: '0.8rem', marginBottom: '0.5rem' }}>THE INSTITUTIONS</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>Banks and Hedge Funds. They move the market with massive volume. We track their footprints via the Score Matrix.</p>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#6366f1' }}>The "Golden Cross" Rule</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The highest probability setups occur when <strong>Retail Sentiment is at an extreme (>75%)</strong> while the <strong>Institutional Score is pushing in the opposite direction</strong>.
             <br /><br />
             Example: EUR/USD retail is 80% Long (Herding) + Institutional score is -5 (Banks Selling) = <strong>REAPER SHORT MISSION.</strong>
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
            { label: 'GDP (Growth)', desc: 'Is the economy expanding or contracting?', icon: '📉' },
            { label: 'CPI (Inflation)', desc: 'Is purchasing power decreasing? (High CPI = Rate Hikes)', icon: '💸' },
            { label: 'Fed Rates', desc: 'The price of money. Higher rates = Stronger currency.', icon: '🏦' },
            { label: 'NFP (Jobs)', desc: 'The health of the consumer. High jobs = Bullish pressure.', icon: '👷' }
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
      </div>
    )
  },
  {
    id: 'cot',
    title: '🏛️ Module 3: COT Deep-Dive Mechanics',
    subtitle: 'Institutional Positioning Analysis',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#6366f1' }}>Smart Money vs Commercials</h3>
           <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
             The **Commitment of Traders (COT)** report is a weekly heartbeat of the biggest players. 
             We look at the net positioning of "Non-Commercials" (Hedge Funds).
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
           <div className="settings-card" style={{ gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>ACCUMULATION</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Institutions are building long positions while price is at a low. (Bullish)</p>
           </div>
           <div className="settings-card" style={{ gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>DISTRIBUTION</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Institutions are offloading long positions or building shorts at a high. (Bearish)</p>
           </div>
        </div>
      </div>
    )
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
             <h4 style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '0.5rem' }}>🚨 REAPER PROTOCOL</h4>
             <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>Always verify the <strong>Full Matrix</strong> (Sentiment + Macro + COT) before entering a trade. Conviction comes from confluence.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="settings-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
           <div>
              <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Institutional Training • v13.2</div>
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
                onClick={() => setActiveModule(prev => prev - 1)}
              >
                Previous Module
              </button>
              {activeModule < TrainingModules.length - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveModule(prev => prev + 1)}
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
