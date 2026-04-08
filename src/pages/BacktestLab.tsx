import { useState, useEffect } from 'react';
import { History, Play, Info, Loader2, Maximize2, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function BacktestLab() {
  const [asset, setAsset] = useState('XAUUSD');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Load TradingView Widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": asset.includes('USD') ? `FX:${asset}` : asset,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tv_chart_container",
          "hide_top_toolbar": false,
          "save_image": false,
          "backgroundColor": "rgba(15, 23, 42, 1)",
          "gridColor": "rgba(255, 255, 255, 0.05)"
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      // Cleanup script if needed, though usually fine to keep for session
    };
  }, [asset]);

  const [trades, setTrades] = useState<any[]>([]);
  const [balance] = useState(100000);
  const [lotSize, setLotSize] = useState(1);

  const executeTrade = (type: 'BUY' | 'SELL') => {
    if (!result) {
      alert("You must run a Simulation first to get the entry price.");
      return;
    }
    const newTrade = {
      id: Date.now(),
      asset,
      date,
      type,
      entry: parseFloat(result.price.replace(/[^0-9.]/g, '')),
      status: 'OPEN',
      outcome: 'PENDING',
      lotSize: lotSize
    };
    setTrades([newTrade, ...trades]);
  };

  const runBacktest = async () => {
    if (!asset || !date) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, date }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.report);
      } else {
        alert(data.error || "Simulation failed");
      }
    } catch (err) {
      console.error(err);
      alert("System error during simulation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container backtest-page">
      <header className="page-header">
        <div className="title-group">
          <h1>Backtest Lab</h1>
          <p className="subtitle">Historical Protocol Simulation & Strategy Validation</p>
        </div>
        <div className="status-badge">
          <History size={14} />
          TIME-TRAVEL ENABLED
        </div>
      </header>

      <div className="lab-layout">
        <div className="main-simulation-area">
          <div className="chart-section shadow-glow">
            <div id="tv_chart_container" style={{ height: '550px', width: '100%' }}></div>
          </div>

          <div className="simulated-trades-panel">
            <div className="panel-header">
              <div className="balance-display shadow-glow">
                <span className="balance-label">ACCOUNT BALANCE</span>
                <span className="balance-amount">${balance.toLocaleString()}</span>
              </div>
              <div className="journal-title">
                <BarChart3 size={16} />
                <h3>GHOST JOURNAL</h3>
              </div>
            </div>
            
            <div className="trades-table">
              {trades.length === 0 ? (
                <p className="no-trades">No active simulations. Execute a trade below.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ASSET</th>
                      <th>DATE</th>
                      <th>TYPE</th>
                      <th>ENTRY</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => (
                      <tr key={trade.id}>
                        <td>{trade.asset}</td>
                        <td>{trade.date}</td>
                        <td className={trade.type === 'BUY' ? 'text-green' : 'text-red'}>{trade.type}</td>
                        <td className="mono">{trade.entry}</td>
                        <td><span className="badge-pending">OPEN</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="controls-section">
          <div className="backtest-controls">
            <div className="input-group">
              <label>Target Asset</label>
              <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                <option value="XAUUSD">FX:XAUUSD (Gold)</option>
                <option value="EURUSD">FX:EURUSD</option>
                <option value="GBPUSD">FX:GBPUSD</option>
                <option value="BTCUSD">BINANCE:BTCUSDT</option>
                <option value="NAS100">OANDA:NAS100USD</option>
              </select>
            </div>

            <div className="input-group">
              <label>Reconstruction Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="input-group">
              <label>Risk (Lots)</label>
              <input 
                type="number" 
                step="0.01" 
                value={lotSize} 
                onChange={(e) => setLotSize(parseFloat(e.target.value))}
              />
            </div>

            <button 
              className={`simulate-btn ${loading ? 'loading' : ''}`} 
              onClick={runBacktest}
              disabled={loading || !date}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Play size={18} />}
              <span>{loading ? 'Reconstructing...' : 'Simulate Reap'}</span>
            </button>
          </div>

          {result && (
            <div className="execution-panel fade-in">
              <div className="result-main-card">
                <div className="verdict-banner" data-verdict={result.verdict.toLowerCase()}>
                  <h2>{result.verdict} SIGNAL</h2>
                  <div className="historical-price">Simulated Entry: {result.price}</div>
                </div>

                <div className="simulation-broker">
                  <button className="trade-btn buy" onClick={() => executeTrade('BUY')}>
                    <ArrowUpRight size={20} />
                    BUY
                  </button>
                  <button className="trade-btn sell" onClick={() => executeTrade('SELL')}>
                    <ArrowDownRight size={20} />
                    SELL
                  </button>
                </div>
                
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="label">Sentiment</span>
                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${result.sentiment}%` }}></div></div>
                    <span className="value">{result.sentiment}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="label">Macro</span>
                    <div className="bar-bg"><div className="bar-fill blue" style={{ width: `${result.macro}%` }}></div></div>
                    <span className="value">{result.macro}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="label">Institutional</span>
                    <div className="bar-bg"><div className="bar-fill yellow" style={{ width: `${result.institutional}%` }}></div></div>
                    <span className="value">{result.institutional}%</span>
                  </div>
                </div>

                <div className="reasoning-box">
                  <h3><Info size={16} /> Strategy Logic</h3>
                  <p>{result.reasoning}</p>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="empty-lab">
              <Maximize2 className="faint-icon animate-pulse" size={40} />
              <h3>The Lab is Ready</h3>
              <p>Pick a date on the calendar above to sync the Reaper Intelligence with the chart price action.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .lab-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .main-simulation-area {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .chart-section {
          background: #0f172a;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        .simulated-trades-panel {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .balance-display {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 1rem 2rem;
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          flex-direction: column;
        }
        .balance-label {
          font-size: 0.6rem;
          color: #3b82f6;
          letter-spacing: 0.2em;
          font-weight: 800;
        }
        .balance-amount {
          font-size: 1.5rem;
          color: white;
          font-weight: 900;
          font-family: monospace;
        }
        .journal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #94a3b8;
        }
        .journal-title h3 { margin: 0; font-size: 0.9rem; letter-spacing: 0.1em; }
        
        .trades-table {
          overflow-x: auto;
        }
        .trades-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .trades-table th {
          text-align: left;
          font-size: 0.7rem;
          color: #64748b;
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .trades-table td {
          padding: 1rem 0.75rem;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .mono { font-family: monospace; }
        .text-green { color: #22c55e; }
        .text-red { color: #ef4444; }
        .badge-pending {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .simulation-broker {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .trade-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border: none;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .trade-btn.buy { background: #22c55e; color: #052e16; }
        .trade-btn.sell { background: #ef4444; color: #450a0a; }
        .trade-btn:hover { transform: scale(1.02); filter: brightness(1.1); }
        .trade-btn:active { transform: scale(0.98); }

        .shadow-glow {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.1);
        }
        .controls-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .backtest-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: rgba(15, 23, 42, 0.6);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-group label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .input-group select, .input-group input {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem;
          border-radius: 10px;
          outline: none;
          font-size: 1rem;
        }
        .simulate-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s;
        }
        .simulate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
        }
        .simulate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .result-main-card {
          background: rgba(30, 41, 59, 0.4);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .verdict-banner {
          padding: 1.5rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .verdict-banner h2 { font-size: 1.5rem; margin: 0; }
        .verdict-banner[data-verdict="buy"] h2 { color: #22c55e; }
        .verdict-banner[data-verdict="sell"] h2 { color: #ef4444; }
        .verdict-banner[data-verdict="neutral"] h2 { color: #94a3b8; }
        .historical-price {
          font-family: monospace;
          color: #64748b;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 1.5rem;
        }
        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .metric-item .label { font-size: 0.75rem; color: #94a3b8; }
        .bar-bg {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .bar-fill { height: 100%; background: #22c55e; border-radius: 10px; }
        .bar-fill.blue { background: #3b82f6; }
        .bar-fill.yellow { background: #eab308; }

        .reasoning-box {
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .reasoning-box h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }
        .reasoning-box p {
          color: #cbd5e1;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .empty-lab {
          text-align: center;
          padding: 3rem 0;
          color: #475569;
          background: rgba(15, 23, 42, 0.3);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .faint-icon { margin-bottom: 1rem; opacity: 0.2; }

        @media (max-width: 1200px) {
          .lab-layout { grid-template-columns: 1fr; }
          .chart-section { min-height: 400px; }
        }
      `}</style>
    </div>
  );
}
