import React from 'react';

const analysisItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚡' },
  { id: 'fundamental', label: 'Fundamental', icon: '📊' },
  { id: 'sentiment', label: 'Sentiment', icon: '📡' },
  { id: 'technical', label: 'Technical', icon: '📈' },
  { id: 'ai-insight', label: 'AI Insight', icon: '🤖' },
];

const marketItems = [
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'indices', label: 'Indices', icon: '🏦' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
];

interface SidebarProps {
  activeView: string;
  onNavChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavChange }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">☠️</span>
        <span>
          Monstah <span>Reaper</span>
        </span>
      </div>

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
