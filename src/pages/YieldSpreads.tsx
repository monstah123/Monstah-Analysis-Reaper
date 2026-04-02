import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

// Mock yield spread data: 10Y Bond Yield Differential
const YIELD_DATA = [
  { pair: 'EUR/USD', spread: -1.2, bias: 'Bearish', desc: 'US yields > German yields' },
  { pair: 'GBP/USD', spread: -0.8, bias: 'Bearish', desc: 'US yields > UK yields' },
  { pair: 'AUD/USD', spread: -0.4, bias: 'Neutral', desc: 'Small gap' },
  { pair: 'USD/JPY', spread: 4.1, bias: 'Very Bullish', desc: 'Huge gap (Carry Trade)' },
  { pair: 'USD/CAD', spread: 0.3, bias: 'Neutral', desc: 'Small gap' },
];

const generateSpreadHistory = (baseSpread: number) => {
  const days = 30;
  return Array.from({ length: days }, (_, i) => ({
    date: `Day ${i + 1}`,
    spread: parseFloat((baseSpread + Math.sin(i / 5) * 0.2 + (Math.random() - 0.5) * 0.1).toFixed(2))
  }));
};

const YieldSpreads: React.FC = () => {
  const activeSpreads = useMemo(() => {
    return YIELD_DATA.map(d => ({
      ...d,
      history: generateSpreadHistory(d.spread)
    }));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0f1623', border: '1px solid #1e2d48', padding: '10px', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#f0f4ff' }}>{label}</p>
          <p style={{ margin: 0, color: payload[0].value >= 0 ? '#3b82f6' : '#ef4444' }}>
            Spread: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
       <header className="header" style={{ padding: 0 }}>
        <div className="header-title">
          <h1>🏛️ Yield Spread Analysis</h1>
          <p>Institutional bond yield differentials (10Y) - The #1 driver of Currency Flow</p>
        </div>
      </header>

      <div className="stats-bar" style={{ padding: '1.5rem 0' }}>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-body">
            <span className="stat-label">Strongest Carry</span>
            <span className="stat-value" style={{ color: '#22c55e' }}>USD/JPY</span>
            <span className="stat-sub">+4.1% Differential</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📉</div>
          <div className="stat-body">
            <span className="stat-label">Weakest Yield</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>EUR/USD</span>
            <span className="stat-sub">-1.2% Differential</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-body">
            <span className="stat-label">Mean Reversion</span>
            <span className="stat-value">AUD/USD</span>
            <span className="stat-sub">Neutral Spread</span>
          </div>
        </div>
      </div>

      <div className="settings-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💡 Why Yield Spreads Matter for Smart Money</h3>
        <p style={{ fontSize: '0.875rem', color: '#8b9ab8', lineHeight: 1.6 }}>
          Banks move billions based on the **Interest Rate Parity**. If the US 10-Year yield is significantly higher than the Japanese 10-Year yield, institutions will borrow JPY (cheap) and buy USD (yield) to capture the spread (Carry Trade). 
          <br /><br />
          When the spread **diverges** from the price, it signals a massive institutional entry or exit.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {activeSpreads.map((s) => (
          <div key={s.pair} className="settings-card" style={{ height: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="settings-section-title">{s.pair} 10Y Yield Spread</h2>
                <p className="settings-hint">{s.desc}</p>
              </div>
              <div className={`bias-badge ${s.bias.toLowerCase().includes('bullish') ? 'bias-very-bullish' : s.bias.toLowerCase().includes('bearish') ? 'bias-very-bearish' : 'bias-neutral'}`}>
                {s.bias}
              </div>
            </div>
            
            <div style={{ flex: 1, marginTop: '20px', marginLeft: '-20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.history}>
                  <defs>
                    <linearGradient id={`gap-${s.pair}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={s.spread >= 0 ? '#3b82f6' : '#ef4444'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={s.spread >= 0 ? '#3b82f6' : '#ef4444'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d48" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#8b9ab8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="#4a5775" />
                  <Area 
                    type="monotone" 
                    dataKey="spread" 
                    stroke={s.spread >= 0 ? '#3b82f6' : '#ef4444'} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#gap-${s.pair})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldSpreads;
