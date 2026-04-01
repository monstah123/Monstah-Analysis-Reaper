import React, { useMemo, useState } from 'react';
import StatsBar from '../components/StatsBar';
import AnalysisTable from '../components/AnalysisTable';
import { useApp } from '../contexts/AppContext';
import type { AssetData } from '../data/mockData';

type SortKey = keyof AssetData;
type FilterBias = 'All' | AssetData['bias'];
type FilterCat = 'All' | AssetData['category'];

const BIAS_FILTERS: FilterBias[] = ['All', 'Very Bullish', 'Bullish', 'Neutral', 'Bearish', 'Very Bearish'];
const CAT_FILTERS: FilterCat[] = ['All', 'Forex', 'Indices', 'Commodities', 'Crypto'];

const Dashboard: React.FC = () => {
  const { assets, isRefreshing, lastRefresh, refreshData, setSelectedAsset } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterBias, setFilterBias] = useState<FilterBias>('All');
  const [filterCat, setFilterCat] = useState<FilterCat>('All');
  const [search, setSearch] = useState('');

  const processed = useMemo(() => {
    let r = [...assets];
    if (search.trim()) r = r.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
    if (filterBias !== 'All') r = r.filter((a) => a.bias === filterBias);
    if (filterCat !== 'All') r = r.filter((a) => a.category === filterCat);
    r.sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      return av < bv ? (sortDir === 'asc' ? -1 : 1) : av > bv ? (sortDir === 'asc' ? 1 : -1) : 0;
    });
    return r;
  }, [assets, search, filterBias, filterCat, sortKey, sortDir]);

  return (
    <>
      <header className="header">
        <div className="header-title">
          <h1>Market Dashboard</h1>
          <p>Multi-factor analysis across {assets.length} global markets</p>
        </div>
        <div className="header-actions">
          <div className="last-updated">
            <span className={`pulse-dot${isRefreshing ? ' pulsing' : ''}`} />
            {isRefreshing ? 'Refreshing…' : lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Loading…'}
          </div>
          <button id="btn-refresh" className="btn btn-primary" onClick={refreshData} disabled={isRefreshing}>
            ↻ Refresh
          </button>
        </div>
      </header>

      <StatsBar assets={processed} />

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input id="search-assets" type="text" placeholder="Search assets…" value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="bias-filter-group">
          {BIAS_FILTERS.map((f) => (
            <button key={f} id={`filter-${f.replace(/\s+/g, '-').toLowerCase()}`} className={`bias-filter-btn ${filterBias === f ? 'active' : ''}`} onClick={() => setFilterBias(f)}>{f}</button>
          ))}
        </div>
        <div className="bias-filter-group">
          {CAT_FILTERS.map((c) => (
            <button key={c} id={`cat-${c.toLowerCase()}`} className={`bias-filter-btn cat-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
        <div className="sort-controls">
          <label className="sort-label" htmlFor="sort-key">Sort:</label>
          <select id="sort-key" className="sort-select" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="score">Score</option>
            <option value="name">Name</option>
            <option value="cot">COT</option>
            <option value="trend">Trend</option>
          </select>
          <button id="sort-direction" className="sort-dir-btn" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>{sortDir === 'desc' ? '↓' : '↑'}</button>
        </div>
      </div>

      <AnalysisTable assets={processed} onRowClick={setSelectedAsset} />

      <div className="legend">
        <span className="legend-title">Score Legend:</span>
        {[
          { label: '+2 Strong', cls: 'val-pos-high' },
          { label: '+1 Mild', cls: 'val-pos-mid' },
          { label: '0 Neutral', cls: 'val-neutral' },
          { label: '-1 Mild', cls: 'val-neg-mid' },
          { label: '-2 Strong', cls: 'val-neg-high' },
        ].map((l) => <span key={l.label} className={`legend-chip ${l.cls}`}>{l.label}</span>)}
      </div>
    </>
  );
};

export default Dashboard;
