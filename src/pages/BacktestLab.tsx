import React, { useState } from 'react';
import { History, Calendar, Play, ShieldAlert, BarChart3, ArrowUpRight, ArrowDownRight, Info, Loader2 } from 'lucide-react';

export default function BacktestLab() {
  const [asset, setAsset] = useState('XAUUSD');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
    <div className="page-container">
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

      <div className="backtest-controls">
        <div className="input-group">
          <label>Target Asset</label>
          <select value={asset} onChange={(e) => setAsset(e.target.value)}>
            <option value="XAUUSD">XAUUSD (Gold)</option>
            <option value="EURUSD">EURUSD</option>
            <option value="GBPUSD">GBPUSD</option>
            <option value="BTCUSD">BTCUSD</option>
            <option value="NAS100">NAS100</option>
          </select>
        </div>

        <div className="input-group">
          <label>Simulation Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
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
        <div className="backtest-results fade-in">
          <div className="result-main-card">
            <div className="verdict-banner" data-verdict={result.verdict.toLowerCase()}>
              <h2>{result.verdict} SIGNAL</h2>
              <div className="historical-price">Price: {result.price}</div>
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
          <div className="lab-graphic">
            <div className="oscillator"></div>
          </div>
          <h3>The Lab is Idle</h3>
          <p>Select an asset and a historical date to see how the Reaper would have analyzed the market.</p>
        </div>
      )}

      <style>{`
        .backtest-controls {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          background: rgba(15, 23, 42, 0.6);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 2rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .input-group label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.05em;
        }
        .input-group select, .input-group input {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          outline: none;
        }
        .simulate-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          height: 46px;
          transition: all 0.2s;
        }
        .simulate-btn:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
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
          padding: 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .verdict-banner[data-verdict="buy"] h2 { color: #22c55e; }
        .verdict-banner[data-verdict="sell"] h2 { color: #ef4444; }
        .verdict-banner[data-verdict="neutral"] h2 { color: #94a3b8; }
        .historical-price {
          font-family: monospace;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding: 2rem;
        }
        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .bar-bg {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .bar-fill { height: 100%; background: #22c55e; }
        .bar-fill.blue { background: #3b82f6; }
        .bar-fill.yellow { background: #eab308; }

        .reasoning-box {
          padding: 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .reasoning-box h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 1rem;
        }
        .reasoning-box p {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .empty-lab {
          text-align: center;
          padding: 5rem 0;
          color: #475569;
        }
        .oscillator {
          width: 60px;
          height: 60px;
          border: 4px solid #3b82f6;
          border-radius: 50%;
          border-top-color: transparent;
          margin: 0 auto 1.5rem;
          animation: spin 2s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .backtest-controls { flex-direction: column; align-items: stretch; }
          .metrics-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
