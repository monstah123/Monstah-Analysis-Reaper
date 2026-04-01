import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import type { AssetData } from '../data/mockData';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildSystemPrompt(asset: AssetData, price?: number, change?: number, lastUpdated?: number): string {
  const priceStr = price ? price.toLocaleString() : '1.15820'; // Current market floor
  const changeStr = change !== undefined ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%` : 'N/A';
  const ageSec = lastUpdated ? Math.floor((Date.now() - lastUpdated) / 1000) : 0;
  
  return `YOU ARE THE MONSTAH TERMINAL DATA CORE.
DATE: April 1st, 2026.
DATA AGE: ${ageSec} seconds (Snapshot).
YOUR EYES: You are plugged directly into institutional liquidity providers (LPs). 
LIVE DATA FEED (INSTITUTIONAL SNAPSHOT):
- ASSET: ${asset.name}
- PRICE AT SNAPSHOT: ${priceStr} (${changeStr})
- MATRIX SCORE: ${asset.score}
- BIAS: ${asset.bias}
- FACTORS: COT(${asset.cot}), RetailPos(${asset.retailPos}), Seasonality(${asset.seasonality}), Trend(${asset.trend}), GDP(${asset.gdp}), PMI(${asset.mPMI}), CPI(${asset.inflation}), Rates(${asset.interestRates}).
- LIVE PRICE RELIABILITY: Acknowledge that your price is an institutional snapshot from ${ageSec}s ago. If the user provides a different price, it IS the absolute tick. Acknowledge and adjust instantly.
TONE: Professional, insightful, high-conviction institutional assistant. BOLD key levels and take-aways. Do not argue about pips or lag.`;
}

function formatResponse(text: string): React.ReactElement {
  const lines = text.split('\n');
  const parseInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="ai-response">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) {
          return <h3 key={i} className="ai-section-heading" style={{ margin: '10px 0 5px' }}>{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <p key={i} className="ai-bullet" style={{ margin: '4px 0', paddingLeft: '15px' }}>{parseInline(line)}</p>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="ai-para" style={{ margin: '6px 0' }}>{parseInline(line)}</p>;
      })}
    </div>
  );
}

const AIInsight: React.FC = () => {
  const { assets, apiKeys, aiInsightAsset, setAiInsightAsset, marketData, updateMarketPrice } = useApp();
  const [selected, setSelected] = useState<AssetData>(aiInsightAsset ?? assets[0]);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputStr, setInputStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncPrice, setSyncPrice] = useState('');
  
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const streamChat = async (newMessages: Message[]) => {
    const activeKey = apiKeys.aiBaseUrl.includes('deepseek') ? apiKeys.deepseekKey : apiKeys.openaiKey;
    if (!activeKey) {
      setError('No API key set for this provider. Go to ⚙️ Settings and add your key.');
      return;
    }
    
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError('');

    // Filter back-to-back user messages to prevent strict API crashes
    const safeMessages: Message[] = [];
    for (const m of newMessages) {
      if (safeMessages.length > 0 && safeMessages[safeMessages.length - 1].role === m.role) {
        safeMessages[safeMessages.length - 1].content += `\n\n${m.content}`;
      } else {
        safeMessages.push({ ...m });
      }
    }

    if (safeMessages.length > 0 && safeMessages[0].role === 'user') {
      const md = marketData[selected.id];
      const prompt = buildSystemPrompt(selected, md?.price, md?.change24h, md?.lastUpdated);
      safeMessages[0].content = `[SYSTEM INSTRUCTIONS: ${prompt}]\n\nUSER QUERY: ${safeMessages[0].content}`;
    }

    try {
      let res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': activeKey
        },
        body: JSON.stringify({ 
          model: apiKeys.aiModel, 
          messages: safeMessages, 
          stream: true,
          baseUrl: apiKeys.aiBaseUrl 
        }),
        signal: abortRef.current.signal,
      });
      
      if (res.status === 404 || res.status === 500) {
        console.warn('[Terminal] Proxy error (404/500). Initializing Direct-Brain Fallback Protocol...');
        res = await fetch(`${apiKeys.aiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeKey}`
          },
          body: JSON.stringify({ 
            model: apiKeys.aiModel, 
            messages: safeMessages, 
            stream: true 
          }),
          signal: abortRef.current.signal,
        });
      }

      if (!res.ok) {
        let errMsg = `HTTP ${res.status}`;
        try {
          const errData = await res.json();
          errMsg = errData?.error?.message || errData?.message || JSON.stringify(errData) || errMsg;
        } catch (e) {
          console.error('[Terminal] Failed to parse error JSON:', e);
        }
        throw new Error(`[INSTITUTIONAL ERROR] ${errMsg}`);
      }

      if (!res.body) throw new Error('No response body from AI core.');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Create an empty assistant message to append to
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const chunk = JSON.parse(data);
            const delta = chunk.choices?.[0]?.delta?.content ?? '';
            setMessages((prev) => {
              const newMsgs = [...prev];
              const lastIdx = newMsgs.length - 1;
              newMsgs[lastIdx] = { ...newMsgs[lastIdx], content: newMsgs[lastIdx].content + delta };
              return newMsgs;
            });
          } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputStr.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: inputStr.trim() };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInputStr('');
    streamChat(updatedMsgs);
  };

  const handleGenerateReport = () => {
    const defaultPrompt = "Generate a complete, structured market analysis report for this asset including Market Overview, Key Bullish Drivers, Key Risk Factors, Trading Approach, and a Confidence Level.";
    const userMsg: Message = { role: 'user', content: defaultPrompt };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    streamChat(updatedMsgs);
  };

  const handleAssetChange = (assetId: string) => {
    const a = assets.find((x) => x.id === assetId)!;
    setSelected(a);
    setAiInsightAsset(a);
    setMessages([]); 
    setError('');
    setSyncPrice('');
  };

  const handleManualSync = () => {
    const p = parseFloat(syncPrice);
    if (!isNaN(p) && p > 0) {
      updateMarketPrice(selected.id, p);
      // Trigger a follow-up chat message to announce the sync
      const syncMsg: Message = { role: 'user', content: `NOTICE: Adjusted live tick to ${p}. Recalculate analysis based on this current price.` };
      const updatedMsgs = [...messages, syncMsg];
      setMessages(updatedMsgs);
      setSyncPrice('');
      streamChat(updatedMsgs);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '20px' }}>
      <div className="insight-header" style={{ marginBottom: '10px', flexShrink: 0 }}>
        <div>
          <h1 className="page-title">🤖 Chat with {selected.name}</h1>
          <p className="page-sub">Ask {apiKeys.aiBaseUrl.includes('deepseek') ? 'DeepSeek' : 'OpenAI'} anything about {selected.name} based on live matrix data</p>
        </div>
      </div>

      <div className="insight-controls" style={{ flexShrink: 0, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          id="ai-asset-select"
          className="sort-select insight-select"
          value={selected.id}
          onChange={(e) => handleAssetChange(e.target.value)}
          disabled={loading}
          style={{ minWidth: '220px' }}
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({a.bias}, {a.score > 0 ? '+' : ''}{a.score})</option>
          ))}
        </select>

        <div className="sync-widget" style={{ display: 'flex', alignItems: 'center', background: '#1e2d48', borderRadius: '8px', padding: '0 10px', border: '1px solid #2a3f63' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b9ab8', marginRight: '8px', whiteSpace: 'nowrap' }}>TICK SYNC:</span>
          <input 
            type="number" 
            placeholder="Live Price" 
            value={syncPrice}
            onChange={(e) => setSyncPrice(e.target.value)}
            style={{ width: '100px', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleManualSync} 
            disabled={!syncPrice || loading}
            style={{ height: '30px', padding: '0 10px', fontSize: '11px', margin: '5px 0' }}
          >
            SYNC
          </button>
        </div>
        
        {messages.length === 0 && (
          <button className="btn btn-primary" onClick={handleGenerateReport} disabled={loading}>
            {loading ? '⏳ Generating...' : '🔮 Generate Full Report'}
          </button>
        )}
      </div>

      {error && <div className="insight-error" style={{ flexShrink: 0 }}>⚠️ {error}</div>}

      <div 
        ref={scrollRef} 
        className="settings-card" 
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', marginTop: '10px' }}
      >
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#8b9ab8', marginTop: 'auto', marginBottom: 'auto' }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>💬 Start a conversation about {selected.name}</p>
            <p style={{ fontSize: '14px' }}>Type a question below or click "Generate Full Report" to get started.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e2d48',
              color: msg.role === 'user' ? '#ffffff' : '#e2e8f0',
              border: msg.role === 'assistant' ? '1px solid #2a3f63' : 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              {msg.role === 'assistant' ? formatResponse(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#8b9ab8', padding: '10px' }}>
             {apiKeys.aiBaseUrl.includes('deepseek') ? 'DeepSeek' : 'OpenAI'} is thinking... <span className="ai-cursor">▌</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexShrink: 0 }}>
        <input 
          type="text" 
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask a question about ${selected.name}... e.g., "Why is the COT score bullish?"`}
          style={{ flex: 1, padding: '12px 20px', borderRadius: '8px', background: '#090c12', border: '1px solid #1e2d48', color: '#fff', fontSize: '15px' }}
          disabled={loading}
        />
        <button 
          className="btn btn-primary" 
          onClick={handleSend} 
          disabled={loading || !inputStr.trim()}
          style={{ padding: '0 25px' }}
        >
          {loading ? '⏳' : 'Send'}
        </button>
      </div>

    </div>
  );
};

export default AIInsight;
