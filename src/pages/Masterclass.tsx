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
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
             Look at the Net Long/Short ratio for Non-Commercials (Banks). While the **official reports** are released weekly, the Reaper terminal syncs these values with **up-to-the-minute price action** for real-time divergence.
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
        <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
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
  },
  {
    id: 'hybrid',
    title: '🔱 Module 6: Hybrid Institutional Pulse',
    subtitle: 'Live Derivation & Synthetic Intelligence (v15.0)',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f59e0b' }}>💎 100% DATA AUTHENTICITY</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             Unlike other platforms, the Reaper terminal has purged all "Placeholder" archived data. Every conviction score you see is pulled live from CFTC wires or calculated using synthetic logic.
           </p>
           <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '0.5rem' }}><strong>SYNTHETIC DERIVATION ENGINE:</strong></div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                For currency crosses like **GBP/NZD** or **GBP/JPY**, we compare the Institutional net positioning of each individual component leg. This provides a scientific institutional conviction score even for pairs the CFTC doesn't report directly.
              </p>
           </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#22c55e' }}>THE 60-SECOND REFRESH</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             While institutions report weekly, your Matrix Score updates **automatically every minute**. The engine constantly evaluates the static institutional foundation against the dynamic market price to flag sudden divergences.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'performance',
    title: '📊 Module 7: 1-Day Relative Performance',
    subtitle: 'Identifying Global Strength & Weakness',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#3b82f6' }}>⚡ THE CURRENCY POWER GRID</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The **Relative Performance [USD]** chart on the dashboard is your bird's eye view of the entire FX market. It measures how every major currency is performing against the US Dollar over a rolling 24-hour period.
           </p>
           <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}><strong>HOW TO READ THE BARS:</strong></div>
              <ul style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                 <li><strong style={{ color: '#22c55e' }}>GREEN BARS (Above 0%):</strong> Currencies currently stronger than the USD.</li>
                 <li><strong style={{ color: '#ef4444' }}>RED BARS (Below 0%):</strong> Currencies currently weaker than the USD.</li>
                 <li><strong style={{ color: '#3b82f6' }}>BLUE BAR (USD):</strong> The fixed 0% baseline benchmark.</li>
              </ul>
           </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#10b981' }}>EXECUTION STRATEGY</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Professional traders use this to find the "Path of Least Resistance."
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                 <strong style={{ color: '#10b981', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>THE POWER PLAY</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Buy the <strong>Strongest</strong> (Far Left) and Sell the <strong>Weakest</strong> (Far Right). This pairs the highest momentum against the highest decay.</p>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                 <strong style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>THE REVERSAL</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>If a currency is {'>'} 1.5% away from 0, it is overextended. Look for the "Reaper Squeeze" to flag a potential snap-back trade.</p>
              </div>
           </div>
        </div>
      </div>
    )
  },
  {
    id: 'heatmap',
    title: '🌡️ Module 8: US Economic Heatmap',
    subtitle: 'Tracking the Institutional Pulse of the US Dollar',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#3b82f6' }}>🏛️ THE FRED INTELLIGENCE ENGINE</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The **Economic Heatmap** is the terminal's macro brain. It pulls live, raw data directly from the Federal Reserve Economic Data (FRED) database, ensuring 100% authenticity without any "ghost" data or manual entries.
           </p>
           <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}><strong>CORE MACRO DRIVERS:</strong></div>
              <ul style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                 <li><strong style={{ color: '#60a5fa' }}>CPI/PCE:</strong> Inflation metrics. Higher inflation = Hawkish Fed = Bullish USD.</li>
                 <li><strong style={{ color: '#fbbf24' }}>NFP/CLAIMS:</strong> Labor market health. Strong jobs = Resilient economy = Bullish USD.</li>
                 <li><strong style={{ color: '#ef4444' }}>UNRATE:</strong> Unemployment. Rising unemployment = Economic decay = Bearish USD.</li>
              </ul>
           </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>THE BIAS VECTOR GAUGES</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             At the bottom of the heatmap, you'll find the **USD** and **Stocks** Bias Vectors. These are not just visual flair—they are mathematical syntheses of every macro indicator in the table.
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                 <strong style={{ color: '#8b5cf6', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>THE SWEEP LOGIC</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Gauges start at 50% (Neutral). A sweep to the <strong>Right (Blue)</strong> indicates institutional macro strength. A sweep to the <strong>Left (Red)</strong> indicates macro decay.</p>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                 <strong style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>TRADING CONFLUENCE</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>When the USD Gauge is {'>'} 70% and the COT Matrix flags a "Long Squeeze," you have high-conviction institutional alignment.</p>
              </div>
           </div>
        </div>
      </div>
    )
  }
  ,
  {
    id: 'dashboard',
    title: '📊 Module 9: The Market Dashboard',
    subtitle: 'Your Command Center — Reading the Matrix Table',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#6366f1' }}>🏗️ ANATOMY OF THE DASHBOARD</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Dashboard is your operational hub. Every asset in the Reaper universe is scored and ranked in real time using three primary pillars: COT (Institutional), Retail Sentiment (Contrarian), and Macro trend alignment.
           </p>
           <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {[
               { label: 'Reaper Score', color: '#6366f1', desc: 'The composite conviction score (-10 to +10). The higher the absolute value, the stronger the institutional edge.' },
               { label: 'COT Column', color: '#3b82f6', desc: 'Net institutional positioning. Positive = banks net long. Negative = banks net short.' },
               { label: 'Trend Column', color: '#22c55e', desc: 'Directional momentum from the institutional flow model. +2 = strong uptrend, -2 = strong downtrend.' },
               { label: 'Bias Badge', color: '#f59e0b', desc: 'The overall verdict: Very Bullish, Bullish, Neutral, Bearish, or Very Bearish.' },
             ].map(item => (
               <div key={item.label} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                 <strong style={{ color: item.color, minWidth: '120px', fontSize: '0.8rem' }}>{item.label}</strong>
                 <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.desc}</span>
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#22c55e' }}>FILTER & SORT PROTOCOL</h3>
           <ul style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
             <li>Use the <strong>Bias Filter</strong> (e.g. "Very Bullish") to instantly see only top-conviction long setups.</li>
             <li>Use the <strong>Category Filter</strong> (Forex / Indices / Commodities / Crypto) to drill into a specific market.</li>
             <li>Sort by <strong>Score</strong> (default) to rank assets from strongest to weakest institutional conviction.</li>
             <li>Click any row to open the <strong>Asset Drawer</strong> for a full deep-dive profile.</li>
           </ul>
        </div>
      </div>
    )
  },
  {
    id: 'fundamental',
    title: '📊 Module 10: Institutional Fundamental Matrix',
    subtitle: 'Reading the Four Macro Pillars of Currency Strength',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#22c55e' }}>🏛️ THE FOUR PILLARS</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
             The Fundamental Matrix page shows the four core economic pillars that professional desks use to determine long-term currency direction. All data is sourced live from BLS and FRED.
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             {[
               { icon: '🏛️', label: 'US Real GDP', rule: '≥ 2.5% = Robust. < 0% = Contraction. BUY the currency of a growing economy.' },
               { icon: '⛽', label: 'Inflation (CPI)', rule: '> 3.5% = Hot (Hawkish Fed). 1.8–2.5% = Target Zone (Neutral).' },
               { icon: '♟️', label: 'Fed Funds Rate', rule: '> 4% = Restrictive (USD Bullish). < 3.5% = Accommodative (USD Bearish).' },
               { icon: '👷', label: 'Non-Farm Payrolls', rule: '> 200K = Hot economy. < 50K = Cooling. Affects USD & equities hard.' },
             ].map(p => (
               <div key={p.label} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                 <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{p.icon}</div>
                 <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{p.label}</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem', margin: 0 }}>{p.rule}</p>
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#f59e0b' }}>ASSET CARDS EXPLAINED</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Each asset card shows Growth Impact, Inflation Driver, Rates Sensitivity, and Employment Bias — all scored. A card with all four showing "Bullish" is a maximum conviction long. A card with all four "Neutral" means wait for a catalyst.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'technical',
    title: '📈 Module 11: Technical & Institutional Flow',
    subtitle: 'Trend Identification and Momentum Scanning',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#8b5cf6' }}>🕵️ THE MOMENTUM SCANNER</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Technical page has two sections: the <strong>Trend Leaderboard</strong> (strongest up and down movers) and the <strong>Institutional Momentum Scanner</strong> (a table of every asset with a signal classification).
           </p>
           <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {[
               { signal: 'BULLISH CONFLUENCE', color: '#22c55e', desc: 'COT is net long AND trend is rising. Highest conviction long setup.' },
               { signal: 'BEARISH CONFLUENCE', color: '#ef4444', desc: 'COT is net short AND trend is falling. Highest conviction short setup.' },
               { signal: 'ACCUMULATION ZONE', color: '#3b82f6', desc: 'Smart money is quietly building long positions. Watch for breakout.' },
               { signal: 'DISTRIBUTION ZONE', color: '#f59e0b', desc: 'Institutions are offloading into retail buying. Prepare for reversal.' },
               { signal: 'SIDEWAYS CHOP', color: '#64748b', desc: 'No institutional edge present. Avoid or wait for clarity.' },
             ].map(s => (
               <div key={s.signal} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, color: s.color, minWidth: '165px' }}>{s.signal}</span>
                 <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.desc}</span>
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>ACCURACY SCORE</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Each signal displays an Accuracy Score (%). Scores above 90% (purple) indicate extreme institutional skew — these are the setups to prioritize. Below 75% = monitor only.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'conviction',
    title: '⚡ Module 12: COT Conviction Engine',
    subtitle: 'Decoding Institutional Bias vs. Live Price Action',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#ef4444' }}>🎯 HOW TO READ THE CONVICTION ENGINE</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Conviction Engine page sorts every asset by its <strong>Conviction Score</strong> — a percentage (0–100%) that measures how extreme the institutional positioning is. High conviction = big institutional bet.
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
               <strong style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>{'>'} 80% CONVICTION</strong>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Extreme positioning. Market is heavily skewed. High risk/reward — trend reversal or acceleration likely imminent.</p>
             </div>
             <div style={{ background: 'rgba(234, 179, 8, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.2)' }}>
               <strong style={{ color: '#eab308', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>50–80% CONVICTION</strong>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Moderate institutional lean. Tradeable with additional confluence from COT and Relative Performance.</p>
             </div>
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#22c55e' }}>STRATEGIC THESIS COLUMN</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             The "Strategic Thesis" column auto-generates based on price vs. positioning divergence logic:
           </p>
           <ul style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
             <li><strong style={{ color: '#ef4444' }}>Banks Selling into Strength</strong> → Price is rising but institutions are net short. Short the rally.</li>
             <li><strong style={{ color: '#22c55e' }}>Smart Money Buying the Dip</strong> → Price is falling but institutions are net long. Buy the dip.</li>
             <li><strong style={{ color: '#eab308' }}>Extreme Positioning</strong> → Overextension warning. Reversal risk is elevated.</li>
           </ul>
        </div>
      </div>
    )
  },
  {
    id: 'tile-heatmap',
    title: '🌡️ Module 13: Institutional Tile Heatmap',
    subtitle: 'Cross-Asset Momentum at a Glance',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#10b981' }}>🎨 READING THE COLOR HEAT</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Institutional Heatmap gives you a bird's-eye view of ALL markets simultaneously. Each tile shows a 24-hour price change encoded as color intensity.
           </p>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
             {[
               { color: '#22c55e', label: 'Intense Green (> +2%)', desc: 'Extreme bullish momentum. Cross-reference with COT — if institutions are also long, this is a true trend.' },
               { color: '#86efac', label: 'Light Green (0 to +2%)', desc: 'Mild positive momentum. Watch for continuation or profit-taking.' },
               { color: '#64748b', label: 'Grey / Flat', desc: 'No decisive move. Avoid — lack of momentum means no edge.' },
               { color: '#fca5a5', label: 'Light Red (0 to -2%)', desc: 'Mild negative pressure. Possible distribution in progress.' },
               { color: '#ef4444', label: 'Intense Red (< -2%)', desc: 'Extreme bearish momentum. If institutions are net short, this is a confirmed sell.' },
             ].map(item => (
               <div key={item.label} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', alignItems: 'flex-start' }}>
                 <div style={{ width: '12px', height: '12px', background: item.color, borderRadius: '3px', flexShrink: 0, marginTop: '2px' }} />
                 <div>
                   <strong style={{ fontSize: '0.8rem', color: '#fff' }}>{item.label}</strong>
                   <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{item.desc}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#f59e0b' }}>THE NEURAL CROSS-REFERENCE RULE</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Always compare tile color with the <strong>BIAS score</strong> shown on each tile. A red tile (+5 Bias) = institutions are buying while price dips. This is a "Buy the Dip" trap for retail — and a prime long entry for you.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'yields',
    title: '🏛️ Module 14: Recession Monitor & Yield Spreads',
    subtitle: 'The Bond Market as Your Macro Crystal Ball',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#3b82f6' }}>📈 THE YIELD CURVE EXPLAINED</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The US Treasury Yield Curve is the most reliable recession predictor in history. The Reaper monitors it in real time from the live Treasury feed.
           </p>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginTop: '1rem' }}>
             <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
               <strong style={{ color: '#22c55e', fontSize: '0.85rem' }}>✅ NORMAL (10Y {'>'} 2Y)</strong>
               <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', margin: 0 }}>Economy is growing. Institutions are willing to lock money up long-term. Bullish for risk assets (Stocks, AUD, NZD).</p>
             </div>
             <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
               <strong style={{ color: '#ef4444', fontSize: '0.85rem' }}>⚠️ INVERTED (2Y {'>'} 10Y)</strong>
               <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', margin: 0 }}>Recession signal. Has predicted every US recession in the last 50 years. Bearish for risk assets — watch safe havens (JPY, CHF, Gold, US Bonds).</p>
             </div>
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #60a5fa' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#60a5fa' }}>REAPER TRADING PROTOCOL</h3>
           <ul style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
             <li>When the <strong>10Y-2Y spread is deeply negative</strong>, reduce risk. Avoid long equity and commodity trades.</li>
             <li>When the curve is <strong>steepening (normalizing)</strong>, it signals recovery — add risk-on exposure.</li>
             <li>The <strong>30Y Rate</strong> is your long-term anchor. When it rises fast, it signals inflation fears — Bullish USD.</li>
           </ul>
        </div>
      </div>
    )
  },
  {
    id: 'calendar',
    title: '📅 Module 15: Economic Calendar',
    subtitle: 'Trading the News — High-Impact Event Protocol',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#eab308' }}>🗓️ HOW TO USE THE CALENDAR</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Economic Calendar is powered by TradingView's live event feed and covers all G8 currencies. It shows upcoming events with their Actual, Forecast, and Previous values the moment they drop.
           </p>
           <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {[
               { col: 'Actual', color: '#22c55e', desc: 'The number just released. Compare against Forecast immediately.' },
               { col: 'Forecast', color: '#3b82f6', desc: 'Market consensus expectation. This is already "priced in."' },
               { col: 'Previous', color: '#94a3b8', desc: "Last period's print. Useful to judge trend direction of the economic series." },
             ].map(c => (
               <div key={c.col} style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                 <strong style={{ color: c.color, minWidth: '80px', fontSize: '0.8rem' }}>{c.col}</strong>
                 <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.desc}</span>
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #eab308' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#eab308' }}>THE BEAT / MISS RULE</h3>
           <ul style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
             <li><strong style={{ color: '#22c55e' }}>Actual {'>'} Forecast (BEAT):</strong> Currency of that country gets a bullish spike. E.g. US NFP beat → USD rallies.</li>
             <li><strong style={{ color: '#ef4444' }}>Actual {'<'} Forecast (MISS):</strong> Currency of that country weakens. Institutions dump it.</li>
             <li><strong>Pro Tip:</strong> Don't enter a trade 5 minutes before a high-impact event (🔴). Wait for the candle to close after the print.</li>
           </ul>
        </div>
      </div>
    )
  },
  {
    id: 'news',
    title: '📻 Module 16: Monstah Squawk Terminal',
    subtitle: 'Real-Time News Flow & Institutional Narrative',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#818cf8' }}>🧠 AI SENTIMENT ANALYSIS PANEL</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Squawk Terminal automatically scores every incoming headline as Bullish, Bearish, or Neutral. The AI Sentiment panel at the top aggregates all recent headlines into a single <strong>Market Sentiment</strong> verdict.
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '8px' }}>
               <strong style={{ color: '#818cf8', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>LIVE CHANNELS</strong>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Switch between Schwab Network, Bloomberg TV, CNBC, and Street Beat for real-time institutional commentary.</p>
             </div>
             <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '8px' }}>
               <strong style={{ color: '#818cf8', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>SQUAWK FEED</strong>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Live institutional headlines from the Alpha Vantage wire, refreshed every 60 seconds. High-impact stories are highlighted with a colored left border.</p>
             </div>
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #818cf8' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#818cf8' }}>HOW TO USE THE SQUAWK</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Use the terminal to catch breaking news <strong>before it moves price</strong>. When a high-conviction Bearish headline drops on a pair you're holding long, use the Sentiment page to re-evaluate your COT data. If they align, exit the trade. Never fight both the news narrative AND the institutions.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'ai-terminal',
    title: '🌪️ Module 17: Monstah AI Terminal',
    subtitle: 'Your On-Demand Institutional Research Analyst',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#22c55e' }}>🤖 WHAT THE AI CAN DO</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Monstah AI Terminal is powered by the DeepSeek V3 neural engine and has full awareness of your terminal's market context. It can analyze sentiment, explain macro events, and help you think through trade setups.
           </p>
           <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             {[
               'Ask: "How does EUR/USD retail sentiment currently look?"',
               'Ask: "Explain the relationship between Treasury yields and Gold."',
               'Ask: "What is the impact of a hot NFP print on JPY pairs?"',
               'Ask: "Analyze the COT data for the British Pound."',
             ].map((ex, i) => (
               <div key={i} style={{ padding: '0.6rem 0.75rem', background: 'rgba(34,197,94,0.05)', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.15)', fontSize: '0.8rem', color: '#86efac', fontStyle: 'italic' }}>
                 {ex}
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#22c55e' }}>REAPER PROTOCOL: AI AS A SECOND OPINION</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Never use the AI as your <em>sole</em> trade trigger. Use it as a second opinion and educational tool. If the AI's analysis conflicts with what the COT data shows, <strong>always trust the verified CFTC data</strong>. The AI synthesizes — the data decides.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'researcher',
    title: '🌐 Module 18: Global Intelligence Hub',
    subtitle: 'Live Web Crawler & Institutional Research Engine',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#3b82f6' }}>🔍 HOW TO USE THE RESEARCH ENGINE</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             The Global Intelligence Hub crawls the live web and returns a synthesized intelligence report on any topic. Unlike the AI Terminal (which uses training data), the Researcher fetches <strong>real-time verified sources</strong> and links them directly.
           </p>
           <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
               <strong style={{ fontSize: '0.8rem', color: '#60a5fa' }}>STEP 1: Type Your Query</strong>
               <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>Be specific. E.g. "Latest COT report Gold analysis" or "EURUSD institutional positioning 2026".</p>
             </div>
             <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
               <strong style={{ fontSize: '0.8rem', color: '#60a5fa' }}>STEP 2: Read the Intelligence Report</strong>
               <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>The crawler scans institutional feeds and returns a written summary with a list of verified source URLs to verify.</p>
             </div>
             <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
               <strong style={{ fontSize: '0.8rem', color: '#60a5fa' }}>LIVE SAT FEED (Idle State)</strong>
               <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>When no search is active, the hub streams live market TV (Bloomberg / Street). Use it for passive institutional background awareness.</p>
             </div>
           </div>
        </div>
      </div>
    )
  },
  {
    id: 'calculator',
    title: '🧮 Module 19: Institutional Position Calculator',
    subtitle: 'Precision Risk Management — Never Blow Your Account',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#ef4444' }}>⚠️ THE GOLDEN RULE OF RISK</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             Professional traders never risk more than <strong>1–2% of their account per trade</strong>. The Reaper Calculator automates this math so you never have to guess your lot size again.
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             {[
               { field: 'Account Balance', desc: 'Enter your total trading account equity in USD.' },
               { field: 'Risk %', desc: 'Set to 1% for conservative. Max 2% for aggressive. Never exceed 2%.' },
               { field: 'Stop Loss (Pips)', desc: 'Enter the distance to your stop loss in pips or points from your entry.' },
               { field: 'Asset', desc: 'Select the specific pair/instrument. The calculator adjusts pip value automatically.' },
             ].map(f => (
               <div key={f.field} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                 <strong style={{ fontSize: '0.8rem', color: '#fff' }}>{f.field}</strong>
                 <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.25rem 0 0 0' }}>{f.desc}</p>
               </div>
             ))}
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#ef4444' }}>READ THE OUTPUT</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             The result shows your <strong>Standard Lots</strong> and equivalent <strong>Units</strong>. Use a 1:3 Risk-to-Reward ratio minimum — if you risk $100, your target should be at least $300. Click "Calculate Next Trade" to confirm and lock in your sizing.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'watchlist',
    title: '⭐ Module 20: Watchlist',
    subtitle: 'Your Personal Market Tracker — Synced Across Devices',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f59e0b' }}>⭐ HOW TO BUILD YOUR WATCHLIST</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             Your Watchlist is a curated list of the highest-conviction setups you're actively monitoring. It syncs to your account across all devices.
           </p>
           <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
               <strong style={{ color: '#f59e0b' }}>Step 1:</strong> From the Dashboard or any Analysis table, click any asset row to open its <strong>Asset Drawer</strong>.
             </div>
             <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
               <strong style={{ color: '#f59e0b' }}>Step 2:</strong> Click the <strong>⭐ Star</strong> button inside the Asset Drawer to add it to your watchlist.
             </div>
             <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
               <strong style={{ color: '#f59e0b' }}>Step 3:</strong> Navigate to <strong>Watchlist</strong> in the sidebar. Each card shows live price, 24h change, and your Confluence Score.
             </div>
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#f59e0b' }}>PRO WATCHLIST DISCIPLINE</h3>
           <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
             Keep your watchlist to <strong>5–10 assets maximum</strong>. Over-watching leads to over-trading. Add an asset only when it shows confluence across at least 2 modules (e.g. COT Bullish + Relative Performance outperforming). Remove it the moment the thesis invalidates.
           </p>
        </div>
      </div>
    )
  },
  {
    id: 'polymarket',
    title: '🔮 Module 21: Polymarket Live',
    subtitle: 'Reading Smart Money Prediction Markets for Edge',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#a855f7' }}>🧩 WHAT IS POLYMARKET?</h3>
           <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
             Polymarket is a <strong>decentralized prediction market</strong> where real money is bet on future event outcomes. When smart money bets 80%+ on a geopolitical event happening, it often signals institutional consensus — and that consensus moves markets.
           </p>
           <div className="masterclass-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             <div style={{ background: 'rgba(168,85,247,0.08)', padding: '1rem', borderRadius: '8px' }}>
               <strong style={{ color: '#a855f7', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>HIGH VOLUME = HIGH CONVICTION</strong>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Markets with the highest dollar volume (shown as "Vol: $X") reflect the most confident bets. Low-volume markets are noise.</p>
             </div>
             <div style={{ background: 'rgba(168,85,247,0.08)', padding: '1rem', borderRadius: '8px' }}>
               <strong style={{ color: '#a855f7', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>PROBABILITY = MARKET PRICE</strong>
               <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Each outcome shows a probability %. This is a direct market price — it's what smart money is paying to bet on that outcome.</p>
             </div>
           </div>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #a855f7' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#a855f7' }}>HOW TO USE POLYMARKET FOR TRADING EDGE</h3>
           <ul style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
             <li>If a market shows <strong>{'>'} 75% probability for a Fed Rate Cut</strong>, institutions have already positioned for it → Bearish USD, Bullish Gold.</li>
             <li>If a <strong>geopolitical risk event</strong> is priced at {'>'} 60%, expect safe-haven flows into JPY, CHF, and USD.</li>
             <li>Click any card to go directly to Polymarket.com to see full event context and related markets.</li>
           </ul>
        </div>
      </div>
    )
  },
];

const Masterclass: React.FC = () => {
  const { setActiveView } = useApp();
  const [activeModule, setActiveModule] = useState<number>(0);
  const [mobileShowContent, setMobileShowContent] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const contentTopRef = React.useRef<HTMLDivElement>(null);

  // Track mobile breakpoint
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Scroll to top whenever module changes or content panel opens
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeModule, mobileShowContent]);

  return (
    <div ref={contentTopRef} className="page-container" style={{ paddingBottom: '5rem' }}>
      <header className="header" style={{ marginBottom: '2rem' }}>
        <div className="header-title">
          <h1>🎓 Institutional Masterclass</h1>
          <p>The definitive guide to the Monstah Reaper trading system.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setActiveView('landing')}>EXIT TO LOBBY</button>
      </header>

      <style>{`
        .masterclass-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .masterclass-layout {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .masterclass-content {
            padding: 1rem !important;
            min-height: auto !important;
            gap: 1rem !important;
          }
          .masterclass-inner-grid {
            grid-template-columns: 1fr !important;
          }
          .masterclass-header {
            margin-bottom: 0.75rem !important;
          }
          .masterclass-nav-panel {
            display: block;
          }
          .masterclass-nav-panel.hidden-mobile {
            display: none;
          }
          .masterclass-content-panel {
            display: none;
          }
          .masterclass-content-panel.visible-mobile {
            display: flex;
          }
        }
        @media (min-width: 769px) {
          .masterclass-nav-panel,
          .masterclass-content-panel {
            display: block;
          }
          .masterclass-content-panel {
            display: flex;
          }
        }
        .module-nav-item:hover {
          background: rgba(99, 102, 241, 0.1) !important;
          border-color: rgba(99, 102, 241, 0.4) !important;
        }
        .module-nav-item:hover h3 {
          color: #fff !important;
        }
        .back-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .back-btn {
            display: flex;
          }
        }
      `}</style>
      <div className="masterclass-layout">
        {/* Navigation — hidden on mobile when viewing content */}
        <div
          className="masterclass-nav-panel"
          style={{
            display: isMobile && mobileShowContent ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {TrainingModules.map((m, idx) => (
            <div 
              key={m.id}
              className="module-nav-item"
              onClick={() => {
                setActiveModule(idx);
                setMobileShowContent(true);
              }}
              style={{
                padding: '1.25rem',
                background: activeModule === idx ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                border: activeModule === idx ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ fontSize: '0.9rem', color: activeModule === idx ? '#fff' : '#94a3b8', margin: 0 }}>{m.title}</h3>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', opacity: 0.7 }}>›</span>
            </div>
          ))}
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h4 style={{ fontSize: '0.8rem', color: '#6366f1', marginBottom: '0.5rem' }}>🚨 REAPER PROTOCOL</h4>
             <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>Never trade on one indicator alone. Confluence of all 3 modules is the key to consistency.</p>
          </div>
        </div>

        {/* Content Area — hidden on mobile until module is tapped */}
        <div
          className="settings-card masterclass-content"
          style={{
            padding: '2.5rem',
            display: isMobile && !mobileShowContent ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '2rem',
            background: 'rgba(15, 23, 41, 0.8)',
            minHeight: '600px'
          }}
        >
           {/* Back button — mobile only */}
           <button
             className="back-btn"
             onClick={() => setMobileShowContent(false)}
             style={{
               alignItems: 'center',
               gap: '0.5rem',
               background: 'rgba(99, 102, 241, 0.1)',
               border: '1px solid rgba(99, 102, 241, 0.3)',
               borderRadius: '10px',
               color: '#818cf8',
               fontSize: '0.8rem',
               fontWeight: 800,
               padding: '0.6rem 1rem',
               cursor: 'pointer',
               alignSelf: 'flex-start',
               letterSpacing: '0.05em'
             }}
           >
             ← All Modules
           </button>
           <div>
              <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Reaper Academy • v15.0</div>
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
                onClick={() => {
                 setActiveModule((prev: number) => prev - 1);
                 setMobileShowContent(true);
               }}
              >
                Previous Module
              </button>
              {activeModule < TrainingModules.length - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setActiveModule((prev: number) => prev + 1);
                    setMobileShowContent(true);
                  }}
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
