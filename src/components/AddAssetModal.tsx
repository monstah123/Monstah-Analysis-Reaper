import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { AssetData, AssetCategory } from '../data/mockData';

interface AddAssetModalProps {
  onClose: () => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose }) => {
  const { addAsset } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Forex');
  const [id, setId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !id) return;

    const newAsset: AssetData = {
      id: id.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      name: name,
      category: category,
      bias: 'Neutral',
      score: 0,
      cot: 0,
      retailPos: 0,
      seasonality: 0,
      trend: 0,
      gdp: 0,
      mPMI: 0,
      sPMI: 0,
      retailSales: 0,
      inflation: 0,
      employmentChange: 0,
      unemploymentRate: 0,
      interestRates: 0,
      basePrice: category === 'Forex' ? 1.0 : category === 'Crypto' ? 50000 : 2000,
    };

    if (category === 'Forex') {
      const parts = name.split('/');
      if (parts.length === 2) {
        newAsset.avFrom = parts[0].trim().toUpperCase();
        newAsset.avTo = parts[1].trim().toUpperCase();
      }
    } else if (category === 'Crypto') {
        newAsset.coingeckoId = name.toLowerCase().replace(/[^a-z]/g, '');
    }

    addAsset(newAsset);
    onClose();
  };

  return (
    <div className="drawer-overlay visible" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="settings-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease-out' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 800 }}>➕ Add New Asset</h2>
        <form onSubmit={handleSubmit}>
          <div className="settings-field">
            <label className="settings-label">Asset Name (e.g. GBP/JPY)</label>
            <input 
              className="settings-input" 
              value={name} 
              onChange={(e) => {
                  setName(e.target.value);
                  if (!id) setId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
              }} 
              placeholder="GBP/JPY or Bitcoin"
              required 
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Unique ID (e.g. GBPJPY)</label>
            <input 
              className="settings-input" 
              value={id} 
              onChange={(e) => setId(e.target.value)} 
              placeholder="GBPJPY"
              required 
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Category</label>
            <select className="sort-select settings-select" value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)}>
              <option value="Forex">Forex</option>
              <option value="Indices">Indices</option>
              <option value="Commodities">Commodities</option>
              <option value="Crypto">Crypto</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add to reaper</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
