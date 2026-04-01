import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import type { AssetData } from '../data/mockData';

function buildPrompt(asset: AssetData): string {
  return `You are a professional market analyst specializing in forex, indices, commodities, and crypto. Analyze the following asset data and provide concise, actionable trading insights.

Asset: ${asset.name} (${asset.category})
Bias: ${asset.bias}
Overall Score: ${asset.score > 0 ? '+' : ''}${asset.score}

Factor Breakdown (scale: -2 to +2):
• COT (Commitment of Traders): ${asset.cot}
• Retail Positioning: ${asset.retailPos}
• Seasonality: ${asset.seasonality}
• Trend: ${asset.trend}
• GDP: ${asset.gdp}
• Manufacturing PMI: ${asset.mPMI}
• Services PMI: ${asset.sPMI}
• Retail Sales: ${asset.retailSales}
• Inflation (CPI): ${asset.inflation}
• Employment Change: ${asset.employmentChange}
• Unemployment Rate: ${asset.unemploymentRate}
• Interest Rates: ${asset.interestRates}

Provide your analysis in this exact structure:
**📊 Market Overview**
[2-3 sentence summary of the current market situation]

**🎯 Key Bullish Drivers**
[Bullet points of strongest positive factors]

**⚠️ Key Risk Factors**
[Bullet points of main risks and bearish pressures]

**💡 Trading Approach**
[Specific, actionable trading recommendation with entry logic]

**🎲 Confidence Level**
[High/Medium/Low — with brief justification]`;
}

function formatResponse(text: string): React.ReactElement {
  const lines = text.split('\n');

  // Helper to parse inline bolding
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
          return <h3 key={i} className="ai-section-heading">{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <p key={i} className="ai-bullet">{parseInline(line)}</p>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="ai-para">{parseInline(line)}</p>;
      })}
    </div>
  );
}

const AIInsight: React.FC = () => {
  const { assets, apiKeys, aiInsightAsset, setAiInsightAsset } = useApp();
  const [selected, setSelected] = useState<AssetData>(aiInsightAsset ?? assets[0]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!apiKeys.openai) {
      setError('No API key set. Go to ⚙️ Settings and add your OpenAI or DeepSeek key.');
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setResponse('');
    setError('');

    try {
      const res = await fetch(`${apiKeys.aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKeys.openai}` },
        body: JSON.stringify({ model: apiKeys.aiModel, messages: [{ role: 'user', content: buildPrompt(selected) }], stream: true }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
            setResponse((p) => p + delta);
          } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="insight-header">
        <div>
          <h1 className="page-title">🤖 AI Market Insight</h1>
          <p className="page-sub">GPT-powered deep-dive analysis for any tracked asset</p>
        </div>
      </div>

      <div className="insight-controls">
        <select
          id="ai-asset-select"
          className="sort-select insight-select"
          value={selected.id}
          onChange={(e) => {
            const a = assets.find((x) => x.id === e.target.value)!;
            setSelected(a);
            setAiInsightAsset(a);
            setResponse('');
            setError('');
          }}
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({a.bias}, {a.score > 0 ? '+' : ''}{a.score})</option>
          ))}
        </select>
        <button
          id="btn-generate-insight"
          className="btn btn-primary"
          onClick={generate}
          disabled={loading}
        >
          {loading ? '⏳ Generating…' : '🔮 Generate Analysis'}
        </button>
        {loading && (
          <button className="btn" onClick={() => abortRef.current?.abort()}>⏹ Stop</button>
        )}
      </div>

      {!apiKeys.openai && (
        <div className="insight-no-key">
          <span>🔑</span>
          <div>
            <strong>No AI API key detected.</strong>
            <p>Add your OpenAI or DeepSeek key in <strong>Settings</strong> to unlock AI analysis.</p>
          </div>
        </div>
      )}

      {error && <div className="insight-error">⚠️ {error}</div>}

      {(response || loading) && (
        <div className="insight-card">
          <div className="insight-card-header">
            <span className="insight-asset-badge">{selected.name}</span>
            <span className="insight-model-badge">{apiKeys.aiModel}</span>
          </div>
          <div className="insight-body">
            {response ? formatResponse(response) : <div className="ai-skeleton"><div/><div/><div/><div/></div>}
            {loading && <span className="ai-cursor">▌</span>}
          </div>
        </div>
      )}

      {!response && !loading && !error && apiKeys.openai && (
        <div className="insight-empty">
          <p>Select an asset above and click <strong>Generate Analysis</strong> to get an AI-powered market breakdown.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsight;
