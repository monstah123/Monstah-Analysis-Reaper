import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AssetData } from '../data/mockData';
import { useApp } from '../contexts/AppContext';
import { useWatchlist } from '../contexts/WatchlistContext';
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
    'GBPUSD': 'FX:GBPUSD',
    'GBPNZD': 'FX:GBPNZD',
    'AUDUSD': 'FX:AUDUSD',
    'USDJPY': 'FX:USDJPY',
    'NZDUSD': 'FX:NZDUSD',
    'USDCAD': 'FX:USDCAD',
    'BITCOIN': 'BINANCE:BTCUSDT',
    'ETHEREUM': 'BINANCE:ETHUSDT',
    'SOLANA': 'BINANCE:SOLUSDT',
    'GOLD': 'TVC:GOLD',
    'SILVER': 'TVC:SILVER',
    'USOIL': 'TVC:USOIL',
    'UKOIL': 'TVC:UKOIL',
    'COPPER': 'TVC:COPPER',
    'US30': 'TVC:DJI',
    'DAX': 'TVC:DEU40',
    'NIKKEI': 'TVC:NI225',
    'SP500': 'TVC:SPX',
    'NASDAQ': 'TVC:NDX',
  };
  return map[id] || null;
};
const AssetDrawer: React.FC = () => {
  const { selectedAsset, setSelectedAsset, marketData, setActiveView, setAiInsightAsset, isRefreshing, removeAsset } = useApp();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isFullscreenChart, setIsFullscreenChart] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const open = !!selectedAsset;

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreenChart(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
    // Play Money Sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    setAiInsightAsset(selectedAsset);
    setActiveView('ai-insight');
    setSelectedAsset(null);
  };

  return (
    <>
      <div className="drawer-overlay visible" onClick={() => setSelectedAsset(null)} />
      <aside className="asset-drawer open">
        {/* Header */}
        <div className="drawer-header" style={{ position: 'relative' }}>
          <div className="drawer-title-group">
            <h2 className="drawer-asset-name">{selectedAsset.name}</h2>
            <span className={`bias-badge ${getBiasClass(selectedAsset.bias)}`}>{selectedAsset.bias}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className={`watchlist-star-btn ${isInWatchlist(selectedAsset.id) ? 'starred' : ''}`}
              onClick={() => {
                if (isInWatchlist(selectedAsset.id)) {
                  removeFromWatchlist(selectedAsset.id);
                } else {
                  addToWatchlist({ id: selectedAsset.id, name: selectedAsset.name, category: selectedAsset.category, addedAt: Date.now() });
                }
              }}
              title={isInWatchlist(selectedAsset.id) ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInWatchlist(selectedAsset.id) ? '⭐ Watching' : '☆ Watch'}
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                className="drawer-close" 
                onClick={() => setShowDeleteConfirm(true)} 
                title="Remove asset"
                style={{ fontSize: '1rem', opacity: 0.5, border: showDeleteConfirm ? '1px solid #ef4444' : undefined }}
              >
                🗑️
              </button>
              
              {showDeleteConfirm && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0, width: 'max-content',
                  background: '#1a2333', border: '1px solid #ef4444', padding: '12px',
                  borderRadius: '8px', zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                    Are you sure you want to delete {selectedAsset.name}?
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        removeAsset(selectedAsset.id);
                        setSelectedAsset(null);
                      }}
                      style={{ background: '#ef4444', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="drawer-close" onClick={() => setSelectedAsset(null)} aria-label="Close">✕</button>
          </div>
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
              <InteractiveChart tvSymbol={getTvSymbol(selectedAsset.id)!} containerId="tv_drawer" />
            </div>
          </div>
        )}

        {/* Fullscreen Chart Modal (Portal to body to escape drawer constraints) */}
        {isFullscreenChart && createPortal(
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#090c12', zIndex: 99999, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{selectedAsset.name} — Professional Full Analysis</h1>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsFullscreenChart(false)}
                style={{ background: '#ef4444', border: 'none', padding: '10px 20px', fontWeight: 700 }}
              >
                Close Fullscreen [Esc]
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e2d48', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
              <InteractiveChart tvSymbol={getTvSymbol(selectedAsset.id)!} containerId="tv_fullscreen" />
            </div>
          </div>,
          document.body
        )}

        {/* Score Breakdown */}
        <div className="drawer-section">
          <p className="drawer-section-title">Score Breakdown</p>
          <ScoreBreakdown asset={selectedAsset} />
        </div>

        {/* AI Button */}
        <div className="drawer-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* INSTITUTIONAL HERO SETUP MANAGER (v28.0) */}
          <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '10px', color: '#71717a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900 }}>🎯 Hero Setup Manager</p>
                {/* @ts-ignore */}
                {((window as any)._appCtx?.activeSetup) && (
                   <button 
                     onClick={() => (window as any)._appCtx?.setActiveSetup(null)}
                     style={{ background: '#ef444422', border: '1px solid #ef444444', color: '#ef4444', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
                   >
                     CLEAR ACTIVE
                   </button>
                )}
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>ENTRY</label>
                   <input 
                     type="number" 
                     id="hero-entry" 
                     defaultValue={md?.price || selectedAsset.basePrice}
                     step="0.00001"
                     style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc', padding: '6px', borderRadius: '4px', fontSize: '12px' }} 
                   />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>TARGET</label>
                   <input 
                     type="number" 
                     id="hero-target" 
                     placeholder="TP Level"
                     step="0.00001"
                     style={{ width: '100%', background: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc', padding: '6px', borderRadius: '4px', fontSize: '12px' }} 
                   />
                </div>
             </div>
             <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                  id="hero-type-short"
                  onClick={() => {(window as any)._heroType = 'SHORT'; document.getElementById('hero-type-short')!.style.background = '#ef4444'; document.getElementById('hero-type-long')!.style.background = '#1e293b';}}
                  style={{ flex: 1, background: '#ef4444', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  SHORT
                </button>
                <button 
                  id="hero-type-long"
                  onClick={() => {(window as any)._heroType = 'LONG'; document.getElementById('hero-type-long')!.style.background = '#10b981'; document.getElementById('hero-type-short')!.style.background = '#1e293b';}}
                  style={{ flex: 1, background: '#1e293b', border: 'none', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                   LONG
                </button>
             </div>
             <button 
               className="btn btn-secondary" 
               style={{ width: '100%', padding: '10px', fontSize: '11px', fontWeight: 900, background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', border: 'none' }}
               onClick={() => {
                  const entry = parseFloat((document.getElementById('hero-entry') as HTMLInputElement).value);
                  const target = parseFloat((document.getElementById('hero-target') as HTMLInputElement).value);
                  const type = (window as any)._heroType || 'SHORT';
                  
                  // @ts-ignore
                  const { setActiveSetup, playMoneySound } = (window as any)._appCtx; 
                  
                  setActiveSetup({
                    assetId: selectedAsset.id,
                    name: selectedAsset.name,
                    entry,
                    target,
                    type,
                    status: 'IRON HOLD'
                  });
                  playMoneySound(true);
                  setSelectedAsset(null);
               }}
             >
                🎯 LOCK HERO SETUP
             </button>
          </div>

          <button className="btn btn-primary drawer-ai-btn" onClick={handleAI} id="btn-drawer-ai" style={{ width: '100%' }}>
            🤖 Generate AI Analysis
          </button>
        </div>
      </aside>
    </>
  );
};

export default AssetDrawer;
