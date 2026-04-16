import React, { useState } from 'react';

const ReaperRulebook: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sticky Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease',
          opacity: isOpen ? 0.5 : 1
        }}
        className="animate-pulse"
      >
        🎓
      </button>

      {/* Rulebook Modal */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '7rem',
            right: '2rem',
            width: '380px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '2rem',
            zIndex: 1001,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <div>
                <h3 style={{ fontSize: '0.7rem', color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Reaper Protocol</h3>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>EXECUTION RULES</h2>
             </div>
             <button 
               onClick={() => setIsOpen(false)}
               style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
             >
               ×
             </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {/* Rule 1: Sentiment */}
             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>🧠 RULE 1: THE HERD TRAP</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                   Buy if Retail long {'>'} 25%. Sell if Retail long {'>'} 75%. 
                   Confluence: Must see Matrix score of +/- 2.
                </p>
             </div>

             {/* Rule 2: Macro */}
             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>🏦 RULE 2: MACRO ENGINE</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                   Bullish: GDP {'>'} 2% + Rates {'>'} 4%. 
                   Bearish: Negative GDP + Rising Unemployment.
                </p>
             </div>

             {/* Rule 3: COT */}
             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>🏛️ RULE 3: COT OVERFLOW</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                   Accumulation: Non-Comm {'>'} 60% Net Long. 
                   Distribution: Non-Comm {'>'} 60% Net Short.
                </p>
             </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
             <p style={{ fontSize: '0.7rem', color: '#475569' }}>Press the 🎓 button to toggle this guide.</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default ReaperRulebook;
