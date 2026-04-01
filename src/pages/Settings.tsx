import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { ApiKeys } from '../contexts/AppContext';

interface FieldConfig {
  key: keyof ApiKeys;
  label: string;
  placeholder: string;
  hint: string;
  link?: { label: string; url: string };
  type?: 'password' | 'text';
}

const FIELDS: FieldConfig[] = [
  {
    key: 'alphaVantage',
    label: 'Alpha Vantage API Key',
    placeholder: 'Enter your Alpha Vantage key…',
    hint: 'Used for live forex pair prices and price history.',
    link: { label: 'Get free key', url: 'https://www.alphavantage.co/support/#api-key' },
    type: 'password',
  },
  {
    key: 'fred',
    label: 'FRED API Key',
    placeholder: 'Enter your FRED key…',
    hint: 'Used for live US economic data (GDP, CPI, unemployment, rates).',
    link: { label: 'Get free key', url: 'https://fred.stlouisfed.org/docs/api/api_key.html' },
    type: 'password',
  },
  {
    key: 'openaiKey',
    label: 'OpenAI API Key (Primary)',
    placeholder: 'sk-proj-…',
    hint: 'Main high-performance reasoning engine.',
    link: { label: 'OpenAI keys', url: 'https://platform.openai.com/api-keys' },
    type: 'password',
  },
  {
    key: 'deepseekKey',
    label: 'DeepSeek API Key (Secondary)',
    placeholder: 'sk-…',
    hint: 'Backup reasoning model.',
    link: { label: 'DeepSeek keys', url: 'https://platform.deepseek.com/api_keys' },
    type: 'password',
  },
];

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
];

const AI_BASES = [
  { value: 'https://api.openai.com/v1', label: 'OpenAI' },
  { value: 'https://api.deepseek.com/v1', label: 'DeepSeek' },
];

const Settings: React.FC = () => {
  const { apiKeys, setApiKeys } = useApp();
  const [local, setLocal] = useState({ ...apiKeys });
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setApiKeys(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const onProviderChange = (url: string) => {
    const isDeepSeek = url.includes('deepseek');
    setLocal(prev => ({
      ...prev,
      aiBaseUrl: url,
      aiModel: isDeepSeek ? 'deepseek-reasoner' : 'gpt-4o'
    }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">⚙️ Settings</h1>
      <p className="page-sub">Configure API keys and AI preferences. OpenAI is now the primary driver. LFG.</p>

      {/* API Keys */}
      <div className="settings-card">
        <h2 className="settings-section-title">🔑 API Keys</h2>
        {FIELDS.map((f) => (
          <div key={f.key} className="settings-field">
            <label htmlFor={`settings-${f.key}`} className="settings-label">
              {f.label}
              {f.link && (
                <a href={f.link.url} target="_blank" rel="noopener noreferrer" className="settings-link">
                  {f.link.label} ↗
                </a>
              )}
            </label>
            <div className="settings-input-row">
              <input
                id={`settings-${f.key}`}
                type={visible[f.key] ? 'text' : (f.type ?? 'text')}
                className="settings-input"
                placeholder={f.placeholder}
                value={(local[f.key] as string) || ''}
                onChange={(e) => setLocal((p) => ({ ...p, [f.key]: e.target.value }))}
              />
              {f.type === 'password' && (
                <button
                  className="settings-eye-btn"
                  onClick={() => setVisible((p) => ({ ...p, [f.key]: !p[f.key] }))}
                  type="button"
                >
                  {visible[f.key] ? '🙈' : '👁'}
                </button>
              )}
            </div>
            <p className="settings-hint">{f.hint}</p>
          </div>
        ))}
      </div>

      {/* AI Config */}
      <div className="settings-card">
        <h2 className="settings-section-title">🤖 AI Configuration</h2>
        <div className="settings-row-2">
          <div className="settings-field">
            <label htmlFor="settings-base-url" className="settings-label">API Provider</label>
            <select
              id="settings-base-url"
              className="sort-select settings-select"
              value={local.aiBaseUrl}
              onChange={(e) => onProviderChange(e.target.value)}
            >
              {AI_BASES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div className="settings-field">
            <label htmlFor="settings-model" className="settings-label">AI Model</label>
            <select
              id="settings-model"
              className="sort-select settings-select"
              value={local.aiModel}
              onChange={(e) => setLocal((p) => ({ ...p, aiModel: e.target.value }))}
            >
              {AI_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button id="btn-save-settings" className="btn btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved!' : '💾 Save Settings'}
        </button>
      </div>

      <div className="settings-footer">
        <p>Monstah Analysis Reaper <span className="accent">v1.1.0</span> · Dual-Brain Architecture Implemented 🗡️</p>
      </div>
    </div>
  );
};

export default Settings;
