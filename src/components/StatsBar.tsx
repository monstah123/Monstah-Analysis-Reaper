import React from 'react';
import type { AssetData } from '../data/assetRegistry';

interface StatsBarProps {
  assets: AssetData[];
}

const StatsBar: React.FC<StatsBarProps> = ({ assets }) => {
  const bullish = assets.filter((a) => a.bias === 'Very Bullish' || a.bias === 'Bullish').length;
  const bearish = assets.filter((a) => a.bias === 'Very Bearish' || a.bias === 'Bearish').length;
  const neutral = assets.filter((a) => a.bias === 'Neutral').length;
  const topAsset = assets[0];

  const stats = [
    {
      id: 'stat-total',
      label: 'Tracked Assets',
      value: assets.length,
      icon: '📋',
      sub: 'Active markets',
    },
    {
      id: 'stat-bullish',
      label: 'Bullish Signals',
      value: bullish,
      icon: '📈',
      sub: `${Math.round((bullish / assets.length) * 100)}% of watch list`,
      color: '#3b82f6',
    },
    {
      id: 'stat-bearish',
      label: 'Bearish Signals',
      value: bearish,
      icon: '📉',
      sub: `${Math.round((bearish / assets.length) * 100)}% of watch list`,
      color: '#ef4444',
    },
    {
      id: 'stat-neutral',
      label: 'Neutral',
      value: neutral,
      icon: '⚖️',
      sub: 'No strong bias',
      color: '#64748b',
    },
    {
      id: 'stat-top',
      label: 'Top Pick',
      value: topAsset?.name ?? '—',
      icon: '⭐',
      sub: topAsset ? `Score: +${topAsset.score} · ${topAsset.bias}` : '',
      color: '#6366f1',
    },
  ];

  return (
    <div className="stats-bar">
      {stats.map((stat) => (
        <div key={stat.id} id={stat.id} className="stat-card">
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-body">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value" style={stat.color ? { color: stat.color } : {}}>
              {stat.value}
            </span>
            <span className="stat-sub">{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
