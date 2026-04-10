import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { AssetData } from '../data/mockData';
import { mockAssets, generateMockSparkline } from '../data/mockData';
import { fetchCryptoPrices, fetchCryptoPriceHistory } from '../services/coinGecko';
import { fetchForexRate, fetchForexHistory } from '../services/alphaVantage';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface ApiKeys {
  alphaVantage: string;
  fred: string;
  aiBaseUrl: string;
  aiModel: string;
  openaiKey: string;
  deepseekKey: string;
}

export interface AssetMarketData {
  price?: number;
  change24h?: number;
  history?: { date: string; value: number }[];
  currency?: string;
  lastUpdated?: number;
}

interface AppContextType {
  apiKeys: ApiKeys;
  setApiKeys: (keys: Partial<ApiKeys>) => void;
  assets: AssetData[];
  marketData: Record<string, AssetMarketData>;
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshData: () => void;
  selectedAsset: AssetData | null;
  setSelectedAsset: (a: AssetData | null) => void;
  activeView: string;
  setActiveView: (v: string) => void;
  aiInsightAsset: AssetData | null;
  setAiInsightAsset: (a: AssetData | null) => void;
  updateMarketPrice: (id: string, price: number) => void;
  addAsset: (asset: AssetData) => void;
  removeAsset: (id: string) => void;
  yields: { y2: number; y10: number; y30: number; y3m: number };
}

const Ctx = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

const DEFAULT_KEYS: ApiKeys = {
  alphaVantage: import.meta.env.VITE_ALPHA_VANTAGE_KEY || '',
  fred: import.meta.env.VITE_FRED_KEY || '',
  aiBaseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1',
  aiModel: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
  openaiKey: import.meta.env.VITE_OPENAI_KEY || '',
  deepseekKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
};

const CACHE_TTL = 1 * 60 * 1000; // 1 minute (Institutional Frequency)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeysRaw, setApiKeysRaw] = useLocalStorage<ApiKeys>('mar_api_keys', DEFAULT_KEYS);
  const [assets, setAssets] = useLocalStorage<AssetData[]>('mar_assets', mockAssets);
  const [marketData, setMarketData] = useState<Record<string, AssetMarketData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [activeView, setActiveView] = useState('landing');
  const [aiInsightAsset, setAiInsightAsset] = useState<AssetData | null>(null);
  const [yields, setYields] = useState({ y2: 4.52, y10: 4.18, y30: 4.35, y3m: 5.25 });
  const refreshRef = useRef(false);

  const apiKeys: ApiKeys = {
    alphaVantage: apiKeysRaw.alphaVantage || DEFAULT_KEYS.alphaVantage,
    fred: apiKeysRaw.fred || DEFAULT_KEYS.fred,
    aiBaseUrl: apiKeysRaw.aiBaseUrl || DEFAULT_KEYS.aiBaseUrl,
    aiModel: apiKeysRaw.aiModel || DEFAULT_KEYS.aiModel,
    openaiKey: apiKeysRaw.openaiKey || DEFAULT_KEYS.openaiKey,
    deepseekKey: apiKeysRaw.deepseekKey || DEFAULT_KEYS.deepseekKey,
  };

  const setApiKeys = useCallback((partial: Partial<ApiKeys>) => {
    setApiKeysRaw((prev) => ({ ...prev, ...partial }));
  }, [setApiKeysRaw]);

  const fetchMarketData = useCallback(async () => {
    if (refreshRef.current) return;
    refreshRef.current = true;
    setIsRefreshing(true);

    try {
      const updates: Record<string, AssetMarketData> = {};

      // 1. Fetch market prices (Snapshot current assets to avoid dependency loop)
      const cryptoAssets = assets.filter((a) => a.coingeckoId && a.category === 'Crypto');
      if (cryptoAssets.length) {
        try {
          const prices = await fetchCryptoPrices(cryptoAssets.map(a => a.coingeckoId!));
          for (const a of cryptoAssets) {
            const p = prices[a.coingeckoId!];
            if (p) {
              const history = await fetchCryptoPriceHistory(a.coingeckoId!, 30).catch(() => generateMockSparkline(a.trend, a.score, a.basePrice));
              updates[a.id] = { price: p.usd, change24h: p.usd_24h_change, history, currency: 'USD', lastUpdated: Date.now() };
            }
          }
        } catch (e) {}
      }

      // 2. Forex logic...
      const forexAssets = assets.filter((a) => a.avFrom && a.avTo);
      for (const a of forexAssets) {
        try {
          const rate = await fetchForexRate(a.avFrom!, a.avTo!, apiKeys.alphaVantage);
          const history = await fetchForexHistory(a.avFrom!, a.avTo!).catch(() => generateMockSparkline(a.trend, a.score, a.basePrice));
          updates[a.id] = { price: rate.rate, change24h: 0, history, currency: a.avTo, lastUpdated: Date.now() };
        } catch (e) {}
      }

      // 3. US Macro Scores...
      let scores = { gdp: 0, inflation: 0, interestRates: 0, employmentChange: 0, unemploymentRate: 0 };
      
      // --- 4. Official Institutional, Retail & Macro Neural Sync (Total Parity) ---
      let neuralData: Record<string, any> = {};
      let neuralMacro: any = null;
      let neuralYields: any = null;
      try {
        const res = await fetch(`/api/sentiment?_t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            neuralData = json.batch || {};
            neuralMacro = json.macro || null;
            neuralYields = json.yields || null;
          }
        }
      } catch (e) {}

      if (neuralYields) {
        setYields(neuralYields);
      }

      // Update global Macro scores from Neural Matrix 9.0
      if (neuralMacro) {
        scores.gdp = (neuralMacro.GDP || 2.0) >= 3 ? 2 : (neuralMacro.GDP || 2.0) >= 2 ? 1 : 0;
        scores.inflation = (neuralMacro.CPI || 3.0) >= 4.5 ? -2 : (neuralMacro.CPI || 3.0) >= 3.5 ? -1 : 0;
        scores.interestRates = (neuralMacro.FedRate || 5.0) >= 5.5 ? -1 : 0;
        scores.employmentChange = (neuralMacro.NFP || 200000) >= 250000 ? 2 : 1;
      }

      setAssets(prevAssets => {
        return prevAssets.map(a => {
          const data = neuralData[a.id];
          let rL = a.retailLong ?? 50;
          let rS = a.retailShort ?? 50;
          let cL = a.cotLong ?? 50;
          let cS = a.cotShort ?? 50;
          let rP = a.retailPos || 0;
          let cI = a.cot || 0;

          if (data) {
            // Institutional always comes from the Backend (CFTC or Neural)
            cL = data.iLong ?? a.cotLong ?? 50;
            cS = 100 - cL;
            
            // Retail only uses Backend (Neural) if ReaperSnatcher didn't grab it client-side
            if (!a.snatcherActive) {
              rL = data.long ?? a.retailLong ?? 50;
              rS = 100 - rL;
            }
          }

          // Proportion-aware Bias Scoring
          const rPct = (rL / (rL + rS)) * 100;
          const cPct = (cL / (cL + cS)) * 100;

          rP = rPct >= 75 ? -2 : rPct <= 25 ? 2 : 0;
          cI = cPct >= 75 ? 2 : cPct <= 35 ? -2 : 0;

          const newTotals = (a.trend || 0) + cI + rP + (a.seasonality || 0) + scores.gdp + scores.inflation + scores.interestRates + scores.employmentChange;
          
          let dynamicBias: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish' = 'Neutral';
          if (newTotals >= 5) dynamicBias = 'Very Bullish';
          else if (newTotals >= 2) dynamicBias = 'Bullish';
          else if (newTotals >= -1) dynamicBias = 'Neutral';
          else if (newTotals >= -5) dynamicBias = 'Bearish';
          else dynamicBias = 'Very Bearish';

          return {
            ...a, ...scores,
            retailLong: rL, retailShort: rS,
            cotLong: cL, cotShort: cS,
            retailPos: rP, cot: cI,
            score: newTotals,
            bias: dynamicBias
          };
        });
      });

      setMarketData((prev) => ({ ...prev, ...updates }));
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
      refreshRef.current = false;
    }
  }, [apiKeys.alphaVantage, apiKeys.fred]);

  const updateMarketPrice = useCallback((assetId: string, p: number) => {
    setMarketData((prev) => ({
      ...prev,
      [assetId]: { ...(prev[assetId] ?? {}), price: p, lastUpdated: Date.now() }
    }));
  }, []);

  const addAsset = useCallback((asset: AssetData) => {
    setAssets((prev) => prev.find(a => a.id === asset.id) ? prev : [...prev, asset]);
  }, [setAssets]);

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter(a => a.id !== id));
  }, [setAssets]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // Self-heal local storage to push new baseline assets (like UKOIL) to users who already cached older arrays
  useEffect(() => {
    setAssets((prev) => {
      const missing = mockAssets.filter(ma => !prev.find(pa => pa.id === ma.id));
      if (missing.length > 0) return [...prev, ...missing];
      return prev;
    });
  }, [setAssets]);

  // Keep the 'Live Snatcher' for Currency/Gold pulse, but AI takes the lead
  useEffect(() => {
    const handleSync = (e: any) => {
      const batch = e.detail;
      if (!batch) return;
      setAssets((prev) => prev.map(a => {
        const official = batch[a.id] || batch[a.id.replace('/', '')];
        if (official) {
          return { ...a, retailLong: official.long, retailShort: official.short, snatcherActive: true };
        }
        return a;
      }));
    };
    window.addEventListener('myfxbook_sync', handleSync);
    return () => window.removeEventListener('myfxbook_sync', handleSync);
  }, [setAssets]);

  return (
    <Ctx.Provider value={{
      apiKeys, setApiKeys, assets, marketData, isRefreshing, lastRefresh,
      refreshData: fetchMarketData, selectedAsset, setSelectedAsset,
      activeView, setActiveView, aiInsightAsset, setAiInsightAsset,
      updateMarketPrice, addAsset, removeAsset, yields
    }}>
      {children}
    </Ctx.Provider>
  );
};
