import React, { useEffect, useState, useMemo } from 'react';
import { Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface COTHistoryPoint {
  date: string;
  long: number;
  short: number;
  nonCommLong: number;
  nonCommShort: number;
  commLong: number;
  commShort: number;
  longPct: number;
  shortPct: number;
  netPosition: number;
  deltaLong: number;
  deltaShort: number;
  netChangePct: number;
}

interface COTHistoryProps {
  initialSymbol?: string;
}

const symbols = [
  { id: 'NASDAQ', name: 'NASDAQ (1)' },
  { id: 'SP500', name: 'S&P 500' },
  { id: 'GOLD', name: 'GOLD' },
  { id: 'USDJPY', name: 'USD/JPY' },
  { id: 'EURUSD', name: 'EUR/USD' },
  { id: 'GBPUSD', name: 'GBP/USD' },
  { id: 'USOIL', name: 'WTI CRUDE' },
  { id: 'BITCOIN', name: 'BITCOIN' }
];

const lookbacks = [
  { id: '1M', name: '1 MONTH', weeks: 4 },
  { id: '3M', name: '3 MONTHS', weeks: 12 },
  { id: '6M', name: '6 MONTHS', weeks: 26 },
  { id: '1Y', name: '1 YEAR', weeks: 52 },
  { id: 'ALL', name: 'MAX (2 YEARS)', weeks: 999 }
];

const COTHistory: React.FC<COTHistoryProps> = ({ initialSymbol = 'NASDAQ' }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [lookback, setLookback] = useState('3M');
  const [history, setHistory] = useState<COTHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cot-history?symbol=${selectedSymbol}`);
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        }
      } catch (e) {
        console.error('Failed to fetch COT history:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedSymbol]);

  // Reverse history for chart (oldest to newest)
  const chartData = useMemo(() => [...history].reverse(), [history]);

  return (
    <div className="settings-card" style={{ background: '#1c1c1e', borderRadius: '16px', border: '1px solid #2c2c2e', padding: '1.5rem', marginTop: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ background: '#ff3b30', width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '10px' }}>👹</div>
           <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>COT Data History</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', fontSize: '11px', color: '#8e8e93' }}>
           <div>
              <span style={{ display: 'block', opacity: 0.6 }}>Last Update</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{history[0]?.date || '---'}</span>
           </div>
           <div>
              <span style={{ display: 'block', opacity: 0.6 }}>Update interval</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>Weekly, checks every 12h</span>
           </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
           <select 
             value={lookback}
             onChange={(e) => setLookback(e.target.value)}
             style={{ background: '#3a3a3c', border: '1px solid #48484a', color: '#f8fafc', fontSize: '10px', fontWeight: 700, padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
           >
             {lookbacks.map(l => <option key={l.id} value={l.id}>Period: {l.name}</option>)}
           </select>
           <select 
             value={selectedSymbol}
             onChange={(e) => setSelectedSymbol(e.target.value)}
             style={{ background: '#3a3a3c', border: '1px solid #48484a', color: '#f8fafc', fontSize: '10px', fontWeight: 700, padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
           >
             {symbols.map(s => <option key={s.id} value={s.id}>Symbol: {s.name}</option>)}
           </select>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ height: '350px', width: '100%', marginBottom: '2rem' }}>
        {loading ? (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e8e93', fontSize: '12px' }}>Analyzing Institutional Flows…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8e8e93', fontSize: 10 }} 
                // Only show a few ticks to keep it clean
                interval={Math.floor(chartData.length / 8)}
              />
              <YAxis 
                yAxisId="position"
                orientation="right" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8e8e93', fontSize: 10 }}
                tickFormatter={(val) => `${val > 0 ? (val/1000).toFixed(0) + 'K' : (val/1000).toFixed(0) + 'K'}`}
              />
              <YAxis 
                yAxisId="pct"
                orientation="left" 
                domain={[0, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8e8e93', fontSize: 10 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as COTHistoryPoint;
                    return (
                      <div style={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '12px', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100 }}>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '8px' }}>
                           <div style={{ color: '#8e8e93', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Report Date</div>
                           <div style={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}>{data.date}</div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          <div>
                            <div style={{ color: '#3b82f6', fontSize: '10px', fontWeight: 800, marginBottom: '4px' }}>SPECULATORS (NON-COMM)</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontSize: '11px', gap: '10px' }}>
                               <span>Long</span>
                               <span style={{ fontWeight: 800 }}>{data.nonCommLong.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontSize: '11px', gap: '10px' }}>
                               <span>Short</span>
                               <span style={{ fontWeight: 800 }}>{data.nonCommShort.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1rem' }}>
                            <div style={{ color: '#ef4444', fontSize: '10px', fontWeight: 800, marginBottom: '4px' }}>HEDGERS (COMMERCIAL)</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontSize: '11px', gap: '10px' }}>
                               <span>Long</span>
                               <span style={{ fontWeight: 800 }}>{data.commLong.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontSize: '11px', gap: '10px' }}>
                               <span>Short</span>
                               <span style={{ fontWeight: 800 }}>{data.commShort.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ color: '#eab308', fontWeight: 900, fontSize: '12px' }}>{data.longPct.toFixed(1)}% LONG</div>
                           <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: '10px' }}>NET: {data.netPosition.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="position" dataKey="long" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} isAnimationActive={false} barSize={40} />
              <Bar yAxisId="position" dataKey="short" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={40} />
              <Line 
                yAxisId="pct"
                type="monotone" 
                dataKey="longPct" 
                stroke="#eab308" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table Section (Scrollable for deep history) */}
      <div style={{ width: '100%', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '1px solid #2c2c2e', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#1c1c1e', zIndex: 5 }}>
            <tr style={{ borderBottom: '1px solid #2c2c2e', color: '#8e8e93' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px 8px' }}>Net Chg %</th>
              <th style={{ padding: '12px 8px' }}>NC Long</th>
              <th style={{ padding: '12px 8px' }}>NC Short</th>
              <th style={{ padding: '12px 8px' }}>Hedge Long</th>
              <th style={{ padding: '12px 8px' }}>Hedge Short</th>
              <th style={{ padding: '12px 8px' }}>Long %</th>
              <th style={{ padding: '12px 8px' }}>Short %</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Net Pos</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, lookbacks.find(l => l.id === lookback)?.weeks || 12).map((row, i) => (
              <tr key={row.date} style={{ borderBottom: '1px solid #2c2c2e', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={{ padding: '12px 8px', textAlign: 'left', color: '#f8fafc', fontWeight: 600 }}>{row.date}</td>
                <td style={{ padding: '12px 8px', color: row.netChangePct > 0 ? '#4ade80' : row.netChangePct < 0 ? '#fca5a5' : '#8e8e93' }}>
                  {row.netChangePct.toFixed(2)}%
                </td>
                <td style={{ padding: '12px 8px', color: '#3b82f6' }}>{row.nonCommLong.toLocaleString()}</td>
                <td style={{ padding: '12px 8px', color: '#ef4444' }}>{row.nonCommShort.toLocaleString()}</td>
                <td style={{ padding: '12px 8px', color: '#3b82f6', opacity: 0.8 }}>{row.commLong.toLocaleString()}</td>
                <td style={{ padding: '12px 8px', color: '#ef4444', opacity: 0.8 }}>{row.commShort.toLocaleString()}</td>
                <td style={{ padding: '12px 8px' }}>{row.longPct.toFixed(2)}%</td>
                <td style={{ padding: '12px 8px' }}>{row.shortPct.toFixed(2)}%</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: row.netPosition > 0 ? '#3b82f6' : '#ef4444', fontWeight: 700 }}>
                  {row.netPosition.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'right', fontSize: '10px', color: '#48484a', letterSpacing: '0.1em' }}>
        MONSTAH INSTITUTIONAL GRADE FLOW MATRIX // NO MOCKUP DETECTED
      </div>
    </div>
  );
};

export default COTHistory;
