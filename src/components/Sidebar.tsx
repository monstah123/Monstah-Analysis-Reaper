import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';

const analysisItems = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '⚡' },
  { id: 'watchlist',   label: 'Watchlist',    icon: '⭐' },
  { id: 'fundamental', label: 'Fundamental',  icon: '📊' },
  { id: 'sentiment',   label: 'Sentiment',    icon: '📡' },
  { id: 'technical',   label: 'Technical',    icon: '📈' },
  { id: 'yield-spreads',  label: 'Yield Spreads',  icon: '🏛️' },
  { id: 'news-terminal',  label: 'News Terminal',  icon: '📻' },
  { id: 'ai-terminal',    label: 'AI Terminal',    icon: '🌪️' },
  { id: 'calendar',       label: 'Calendar',       icon: '📅' },
  { id: 'correlation',    label: 'Correlation',    icon: '🌡️' },
  { id: 'cot-deep-dive',  label: 'COT Deep-Dive',  icon: '🗳️' },
  { id: 'calculator',     label: 'Calculator',     icon: '🧮' },
  { id: 'research',       label: 'Global Intel',   icon: '🌍' },
  { id: 'masterclass',    label: 'Masterclass',    icon: '🎓' },
];

const marketItems = [
  { id: 'forex',       label: 'Forex',       icon: '💱' },
  { id: 'indices',     label: 'Indices',     icon: '🏦' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️' },
  { id: 'crypto',      label: 'Crypto',      icon: '₿'  },
];

interface SidebarProps {
  activeView: string;
  onNavChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavChange }) => {
  const { assets, setSelectedAsset } = useApp();
  const { user, logout }             = useAuth();
  const { watchlist }                = useWatchlist();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const topReaps = [...assets]
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ position: 'relative', overflow: 'visible', paddingBottom: '0.5rem' }}>
        <span className="logo-icon">☠️</span>
        <span style={{
          background: 'linear-gradient(90deg, #fff 0%, #fff 45%, #6366f1 50%, #fff 55%, #fff 100%)',
          backgroundSize: '250% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'logoSweep 4s ease-in-out infinite',
          fontWeight: 900,
          display: 'flex',
          gap: '0.3rem'
        }}>
          Monstah <span style={{ color: 'inherit' }}>Reaper</span>
        </span>

        {/* CSS Keyframes for the Brush Sweep */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes logoSweep {
            0% { background-position: 100% 0; }
            50% { background-position: 0% 0; }
            100% { background-position: 100% 0; }
          }
        `}} />
      </div>

      <button 
        className="nav-item"
        onClick={() => onNavChange('landing')}
        style={{ 
          margin: '0 1rem 1.5rem', 
          padding: '0.6rem 1rem',
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.15em',
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          color: '#6366f1',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: 'calc(100% - 2rem)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textTransform: 'uppercase'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
          e.currentTarget.style.borderColor = '#6366f1';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
          e.currentTarget.style.color = '#6366f1';
        }}
      >
        <span style={{ fontSize: '1rem' }}>🛰️</span>
        EXIT TO LOBBY
      </button>

      {/* ── User profile strip ─────────────────────────────────── */}
      {user && (
        <div className="sidebar-user" onClick={() => setShowUserMenu((p) => !p)}>
          <img
            src={user.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? 'U')}&background=3b82f6&color=fff`}
            alt="avatar"
            className="sidebar-avatar"
          />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.displayName ?? 'User'}</span>
            <span className="sidebar-user-email">{user.email}</span>
          </div>
          <span className="sidebar-user-chevron">{showUserMenu ? '▲' : '▼'}</span>

          {showUserMenu && (
            <div className="sidebar-user-menu">
              <button className="sidebar-user-menu-item" onClick={(e) => { e.stopPropagation(); logout(); }}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      <nav className="nav-group">
        <p className="nav-title">Top Reaps (Confluence)</p>
        {topReaps.map((asset) => (
          <button
            key={asset.id}
            className="nav-item reap-item"
            onClick={() => setSelectedAsset(asset)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', opacity: 0.8 }}
          >
            <span className="nav-icon" style={{ fontSize: '1rem' }}>{asset.score > 0 ? '📈' : '📉'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 700 }}>{asset.name}</span>
              <span style={{ fontSize: '0.7rem', color: asset.score > 0 ? '#3b82f6' : '#ef4444' }}>
                Score: {asset.score > 0 ? `+${asset.score}` : asset.score}
              </span>
            </div>
          </button>
        ))}
      </nav>

      <nav className="nav-group">
        <p className="nav-title">Analysis</p>
        {analysisItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavChange(item.id)}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {/* Watchlist badge */}
            {item.id === 'watchlist' && watchlist.length > 0 && (
              <span className="nav-watchlist-badge">{watchlist.length}</span>
            )}
          </button>
        ))}
      </nav>

      <nav className="nav-group">
        <p className="nav-title">Markets</p>
        {marketItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavChange(item.id)}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button
        id="nav-settings"
        className={`nav-item settings-nav-item ${activeView === 'settings' ? 'active' : ''}`}
        onClick={() => onNavChange('settings')}
      >
        <span className="nav-icon">⚙️</span>
        Settings
      </button>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot live" />
          <span>Live Data</span>
        </div>
        <p className="version-label">v13.7.1-ULTRA</p>
      </div>
    </aside>
  );
};

export default Sidebar;
