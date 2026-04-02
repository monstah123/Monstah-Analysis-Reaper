import React from 'react';

const analysisItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
  { id: 'fundamental', label: 'Fundamental', icon: '📊' },
  { id: 'sentiment', label: 'Sentiment', icon: '📡' },
  { id: 'technical', label: 'Technical', icon: '📈' },
  { id: 'ai-insight', label: 'AI Insight', icon: '🤖' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
];

const marketItems = [
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'indices', label: 'Indices', icon: '🏦' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
];

import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  activeView: string;
  onNavChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavChange }) => {
  const { assets, setSelectedAsset } = useApp();
  
  const topReaps = [...assets]
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">☠️</span>
        <span>
          Monstah <span>Reaper</span>
        </span>
      </div>

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
        <p className="version-label">v1.0.0-beta</p>
      </div>
    </aside>
  );
};

export default Sidebar;
