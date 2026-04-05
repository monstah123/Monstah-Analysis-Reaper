import React from 'react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useApp } from '../contexts/AppContext';

const Watchlist: React.FC = () => {
  const { watchlist, removeFromWatchlist, watchlistLoading } = useWatchlist();
  const { assets, setSelectedAsset, marketData } = useApp();

  const enriched = watchlist.map((w) => {
    const asset = assets.find((a) => a.id === w.id);
    const mkt   = marketData[w.id];
    return { ...w, asset, mkt };
  });

  const formatPrice = (p?: number, currency?: string) => {
    if (p == null) return '—';
    const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 });
    return `${currency === 'USD' || !currency ? '$' : ''}${fmt.format(p)}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⭐ My Watchlist</h1>
          <p className="page-subtitle">Assets you're tracking — synced across all your devices.</p>
        </div>
        <div className="page-header-badge">
          {watchlist.length} asset{watchlist.length !== 1 ? 's' : ''}
        </div>
      </div>

      {watchlistLoading && (
        <div className="watchlist-loading">
          <div className="loading-spinner" />
          <p>Loading your watchlist…</p>
        </div>
      )}

      {!watchlistLoading && watchlist.length === 0 && (
        <div className="watchlist-empty">
          <div className="watchlist-empty-icon">⭐</div>
          <h3>Your watchlist is empty</h3>
          <p>Open any asset from the Dashboard or Analysis tables and click the ⭐ star to add it here.</p>
        </div>
      )}

      {!watchlistLoading && enriched.length > 0 && (
        <div className="watchlist-grid">
          {enriched.map(({ id, name, category, mkt, asset }) => {
            const price    = mkt?.price;
            const change   = mkt?.change24h ?? 0;
            const isUp     = change >= 0;
            const score    = asset?.score ?? 0;

            return (
              <div
                key={id}
                className="watchlist-card"
                onClick={() => asset && setSelectedAsset(asset)}
              >
                <div className="watchlist-card-header">
                  <div>
                    <p className="watchlist-card-name">{name}</p>
                    <p className="watchlist-card-category">{category}</p>
                  </div>
                  <button
                    className="watchlist-remove-btn"
                    title="Remove from watchlist"
                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(id); }}
                  >
                    ✕
                  </button>
                </div>

                <div className="watchlist-card-body">
                  <span className="watchlist-price">
                    {formatPrice(price, mkt?.currency)}
                  </span>
                  <span className={`watchlist-change ${isUp ? 'positive' : 'negative'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                </div>

                <div className="watchlist-card-footer">
                  <span className="watchlist-score-label">Confluence Score</span>
                  <span className={`watchlist-score-value ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`}>
                    {score > 0 ? `+${score}` : score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
