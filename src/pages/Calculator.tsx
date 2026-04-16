import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Calculator as CalcIcon, DollarSign, Percent, Target, AlertTriangle } from 'lucide-react';

export default function Calculator() {
  const { assets, marketData } = useApp();
  
  // Position Stats
  const [balance, setBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');

  // Sound Effect Helper
  const playMoneySound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (err) {}
  };

  const currentAsset = useMemo(() => 
    assets.find(a => a.id === selectedAssetId) || assets[0]
  , [selectedAssetId, assets]);

  const results = useMemo(() => {
    const riskAmount = (balance * riskPct) / 100;
    
    // Approximate pip value logic for Institutional Terminal
    // Standard Lot (100,000) pip value is roughly $10 for XXX/USD
    // This is a professional estimation used by traders in the field
    let pipValuePerLot = 10; 
    
    if (currentAsset?.category === 'Indices') {
        // For US30/SP500, 1 point often = $1 on standard contracts
        pipValuePerLot = 1; 
    } else if (currentAsset?.id === 'BTCUSDT' || currentAsset?.id === 'BITCOIN') {
        pipValuePerLot = 1;
    }

    const lotSize = stopLossPips > 0 ? (riskAmount / (stopLossPips * pipValuePerLot)) : 0;
    
    return {
      riskAmount,
      lotSize: lotSize.toFixed(2),
      units: Math.round(lotSize * 100000).toLocaleString()
    };
  }, [balance, riskPct, stopLossPips, currentAsset]);

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAssetId(e.target.value);
    playMoneySound();
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="title-group">
          <h1>Institutional Calculator</h1>
          <p className="subtitle">High-fidelity position sizing & risk management</p>
        </div>
        <div className="status-badge live">
          <CalcIcon size={14} />
          PRECISION MODE
        </div>
      </header>

      <div className="calculator-grid">
        {/* INPUTS SECTION */}
        <section className="settings-card">
          <h2 className="settings-section-title">Trade Parameters</h2>
          
          <div className="settings-field">
            <label className="settings-label">Account Balance (USD)</label>
            <div className="relative">
              <span className="input-icon"><DollarSign size={16} /></span>
              <input 
                type="number" 
                className="settings-input with-icon" 
                value={balance} 
                onChange={(e) => setBalance(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Risk Percentage (%)</label>
            <div className="relative">
              <span className="input-icon"><Percent size={16} /></span>
              <input 
                type="number" 
                className="settings-input with-icon" 
                value={riskPct} 
                onChange={(e) => setRiskPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Stop Loss (Pips / Points)</label>
            <div className="relative">
              <span className="input-icon"><Target size={16} /></span>
              <input 
                type="number" 
                className="settings-input with-icon" 
                value={stopLossPips} 
                onChange={(e) => setStopLossPips(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Asset</label>
            <select 
              className="settings-input" 
              value={selectedAssetId} 
              onChange={handleAssetChange}
              style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* RESULTS SECTION */}
        <section className="settings-card results-highlight">
          <div className="results-header">
             <h2 className="settings-section-title">Execution Details</h2>
             <div className="badge-risk">RISKING ${results.riskAmount.toLocaleString()}</div>
          </div>

          <div className="position-size-display">
            <div className="size-main">
              <span className="size-val">{results.lotSize}</span>
              <span className="size-unit">Standard Lots</span>
            </div>
            <div className="size-sub">
              ≃ {results.units} Units
            </div>
          </div>

          <div className="risk-warning shadow-glow">
            <AlertTriangle size={18} className="icon-warning" />
            <div className="warning-text">
              <strong>Risk Warning:</strong> At {riskPct}%, you are exposing ${results.riskAmount.toLocaleString()} of your capital to market volatility. Use 1:3 RR for optimal growth.
            </div>
          </div>

          <button className="btn-execute" onClick={playMoneySound}>
            Calculate Next Trade
          </button>
        </section>
      </div>

      <style>{`
        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }
        .relative { position: relative; }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          opacity: 0.5;
        }
        .settings-input.with-icon {
          padding-left: 38px;
        }
        .results-highlight {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(59, 130, 246, 0.05);
        }
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .badge-risk {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .position-size-display {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .size-main {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .size-val {
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(to bottom, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.4));
        }
        .size-unit {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #3b82f6;
          font-weight: 800;
          margin-top: 0.5rem;
        }
        .size-sub {
          margin-top: 1.5rem;
          font-family: monospace;
          color: #64748b;
          font-size: 0.9rem;
        }
        .risk-warning {
          margin: 2rem 0;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 12px;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          font-size: 0.85rem;
          color: #d1d5db;
          line-height: 1.5;
        }
        .icon-warning { color: #f59e0b; flex-shrink: 0; }
        .btn-execute {
          width: 100%;
          padding: 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .btn-execute:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        .btn-execute:active {
          transform: translateY(0);
        }
        @media (max-width: 1024px) {
          .calculator-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
