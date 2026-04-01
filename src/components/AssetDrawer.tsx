import React, { useState } from 'react';
import type { AssetData } from '../data/mockData';
import { useApp } from '../contexts/AppContext';
import InteractiveChart from './InteractiveChart';
import ScoreBreakdown from './ScoreBreakdown';
import TradingViewPrice from './TradingViewPrice';

const getBiasClass = (bias: AssetData['bias']) => {
  const map: Record<string, string> = {
    'Very Bullish': 'bias-very-bullish',
    'Bullish': 'bias-bullish',
    'Neutral': 'bias-neutral',
    'Bearish': 'bias-bearish',
    'Very Bearish': 'bias-very-bearish',
  };
  return map[bias] ?? 'bias-neutral';
};

const getTvSymbol = (id: string): string | null => {
  const map: Record<string, string> = {
    'EURUSD': 'FX:EURUSD',
    'GBPNZD': 'FX:GBPNZD',
    'AUDUSD': 'FX:AUDUSD',
    'USDJPY': 'FX:USDJPY',
    'NZDUSD': 'FX:NZDUSD',
    'BITCOIN': 'BINANCE:BTCUSDT',
    'ETHEREUM': 'BINANCE:ETHUSDT',
    'SOLANA': 'BINANCE:SOLUSDT',
    'GOLD': 'OANDA:XAUUSD',
    'SILVER': 'OANDA:XAGUSD',
    'USOIL': 'TVC:USOIL',
    'COPPER': 'COMEX:HG1!',
    'DOW': 'DJ:DJI',
    'DAX': 'XETR:DAX',
    'NIKKEI': 'TVC:NI225',
    'SP500': 'TVC:SPX',
    'NASDAQ': 'TVC:NDX',
  };
  return map[id] || null;
};

const AssetDrawer: React.FC = () => {
  const { selectedAsset, setSelectedAsset, marketData, setActiveView, setAiInsightAsset, isRefreshing } = useApp();
  const [isFullscreenChart, setIsFullscreenChart] = useState(false);
  const open = !!selectedAsset;

  if (!selectedAsset) return (
    <>
      <div className={`drawer-overlay${open ? ' visible' : ''}`} onClick={() => setSelectedAsset(null)} />
      <aside className="asset-drawer" />
    </>
  );

  const md = marketData[selectedAsset.id];
  const isBullish = selectedAsset.score >= 0;
  const priceDisplay = md?.price
    ? md.price > 1000
      ? `$${md.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : md.price > 10
        ? md.price.toFixed(2)
        : md.price.toFixed(5)
    : null;
  const changeDisplay = md?.change24h != null
    ? `${md.change24h >= 0 ? '+' : ''}${md.change24h.toFixed(2)}%`
    : null;

  const handleAI = () => {
    setAiInsightAsset(selectedAsset);
    setActiveView('ai-insight');
    setSelectedAsset(null);
  };

  return (
    <>
      <div className="drawer-overlay visible" onClick={() => setSelectedAsset(null)} />
      <aside className="asset-drawer open">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2 className="drawer-asset-name">{selectedAsset.name}</h2>
            <span className={`bias-badge ${getBiasClass(selectedAsset.bias)}`}>{selectedAsset.bias}</span>
          </div>
          <button className="drawer-close" onClick={() => setSelectedAsset(null)} aria-label="Close">✕</button>
        </div>

        {/* Score + Category */}
        <div className="drawer-meta">
          <div className="drawer-score-chip" style={{ color: isBullish ? '#3b82f6' : '#ef4444' }}>
            <span className="drawer-score-num">{selectedAsset.score > 0 ? `+${selectedAsset.score}` : selectedAsset.score}</span>
            <span className="drawer-score-label">Overall Score</span>
          </div>
          <div className="drawer-category-chip">{selectedAsset.category}</div>
        </div>

        {/* Live Price */}
        <div className="drawer-section">
          <p className="drawer-section-title">Live TradingView Price</p>
          {getTvSymbol(selectedAsset.id) ? (
            <div style={{ height: '90px', marginTop: '-10px' }}>
              <TradingViewPrice symbol={getTvSymbol(selectedAsset.id)!} />
            </div>
          ) : (
            <>
              {isRefreshing ? (
                <div className="drawer-price-loading">Fetching live data…</div>
              ) : priceDisplay ? (
                <div className="drawer-price-row">
                  <span className="drawer-price">{priceDisplay}</span>
                  {changeDisplay && (
                    <span className={`drawer-change ${(md?.change24h ?? 0) >= 0 ? 'pos' : 'neg'}`}>{changeDisplay} 24h</span>
                  )}
                </div>
              ) : (
                <div className="drawer-price-placeholder">
                  <span>Not connected</span>
                  <button className="drawer-connect-btn" onClick={() => { setSelectedAsset(null); setActiveView('settings'); }}>
                    Connect Live Data →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Advanced Market Chart */}
        {getTvSymbol(selectedAsset.id) && (
          <div className="drawer-section">
            <div className="drawer-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="drawer-section-title">Institutional Advanced Chart</p>
              <button 
                className="btn-text" 
                style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 8px', borderRadius: '4px' }}
                onClick={() => setIsFullscreenChart(true)}
              >
                ⛶ Fullscreen
              </button>
            </div>
            <div className="drawer-chart" style={{ height: '450px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e2d48' }}>
              <InteractiveChart tvSymbol={getTvSymbol(selectedAsset.id)!} />
            </div>
          </div>
        )}

        {/* Fullscreen Chart Modal */}
        {isFullscreenChart && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#090c12', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedAsset.name} — Full Analysis</h2>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsFullscreenChart(false)}
                style={{ background: '#ef4444', border: 'none' }}
              >
                Close Fullscreen [Esc]
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e2d48' }}>
              <InteractiveChart tvSymbol={getTvSymbol(selectedAsset.id)!} />
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        <div className="drawer-section">
          <p className="drawer-section-title">Score Breakdown</p>
          <ScoreBreakdown asset={selectedAsset} />
        </div>

        {/* AI Button */}
        <div className="drawer-footer">
          <button className="btn btn-primary drawer-ai-btn" onClick={handleAI} id="btn-drawer-ai">
            🤖 Generate AI Analysis
          </button>
        </div>
      </aside>
    </>
  );
};

export default AssetDrawer;
