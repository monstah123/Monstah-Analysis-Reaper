import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const EXAMPLES = [
  "How does EUR/USD retail sentiment currently look?",
  "Explain the relationship between Treasury yields and GOLD.",
  "What is the impact of a hot NFP print on JPY pairs?",
  "Analyze the current market liquidity - are we in a Golden Zone?",
  "Analyze the COT data for my most extreme positions."
];

const AITerminal: React.FC = () => {
  const { assets, yields } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // --- Build Context Bridge ---
    const now = new Date();
    const h = now.getUTCHours();
    
    // Quick session analysis for AI context
    const openSessions = [];
    if (h >= 22 || h < 7) openSessions.push('Sydney');
    if (h >= 0 && h < 9) openSessions.push('Tokyo');
    if (h >= 7 && h < 16) openSessions.push('London');
    if (h >= 12 && h < 21) openSessions.push('New York');
    
    const isGolden = (h >= 12 && h < 16) || (h >= 7 && h < 9);
    
    // Capture COT extremes
    const sortedCOT = [...assets].sort((a, b) => {
      const aPct = (a.cotLong || 0) / ((a.cotLong || 0) + (a.cotShort || 1)) * 100;
      const bPct = (b.cotLong || 0) / ((b.cotLong || 0) + (b.cotShort || 1)) * 100;
      return bPct - aPct;
    });
    const topLong = sortedCOT[0];
    const topShort = sortedCOT[sortedCOT.length - 1];

    const contextBriefing = {
      timestampUTC: now.toISOString(),
      activeSessions: openSessions.join(', '),
      marketPhase: isGolden ? 'GOLDEN ZONE (High Liquidity)' : 'Standard Liquidity',
      yields: `2Y: ${yields.y2}%, 10Y: ${yields.y10}%`,
      cotExtremes: `Most Long: ${topLong?.name || 'N/A'}, Most Short: ${topShort?.name || 'N/A'}`
    };

    const userMsg: Message = { role: 'user', content: text, timestamp: now };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: contextBriefing
        })
      });

      const json = await response.json();
      if (json.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: json.data,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(json.error || 'Sync Error');
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${error.message || 'The DeepSeek intelligence link was interrupted.'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '2rem' }}>
      <header className="header" style={{ marginBottom: '1rem' }}>
        <div className="header-title">
          <h1>🌪️ Monstah AI Terminal</h1>
          <p>Direct DeepSeek Neural Link for Market Intelligence & General Query.</p>
        </div>
      </header>

      <div style={{
        flex: 1,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #1e2d48',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxHeight: '70vh'
      }}>
        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.6 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Awaiting Input...</h2>
              <p style={{ maxWidth: '400px', margin: '0.5rem auto 2rem' }}>Ask about market sentiment, liquidity phases, or COT institutional data.</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
                {EXAMPLES.map((ex, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(ex)}
                    className="btn btn-secondary btn-sm"
                    style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: m.role === 'user' ? '#3b82f6' : '#22c55e', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.role === 'user' ? 'You' : 'Monstah AI'}
                </div>
              </div>
              <div style={{
                background: m.role === 'user' ? '#1e293b' : 'rgba(15, 22, 35, 0.8)',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: m.role === 'user' ? '1px solid #334155' : '1px solid #1e2d48',
                color: '#f8fafc',
                lineHeight: 1.6,
                fontSize: '0.95rem',
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', padding: '1rem' }}>
              <div className="pulse-dot pulsing" style={{ background: '#22c55e' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>Neural Processing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #1e2d48', background: 'rgba(2, 6, 23, 0.4)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            style={{ display: 'flex', gap: '1rem' }}
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Monstah AI anything..."
              style={{
                flex: 1,
                background: '#0f172a',
                border: '1px solid #1e2d48',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !input.trim()}
              style={{ padding: '0 1.5rem' }}
            >
              SEND
            </button>
          </form>
          <p style={{ fontSize: '10px', color: '#64748b', marginTop: '1rem', textAlign: 'center' }}>
            Context Bridge Active: DeepSeek V3 now has real-time dashboard awareness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AITerminal;
