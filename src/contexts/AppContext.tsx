import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { AssetData } from '../data/mockData';
import { mockAssets, generateMockSparkline } from '../data/mockData';
import { fetchCryptoPrices, fetchCryptoPriceHistory } from '../services/coinGecko';
import { fetchForexRate, fetchForexHistory } from '../services/alphaVantage';
import { fetchAllFredData } from '../services/fred';
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

  // Merge the defaults from .env if the local storage values are empty
  const apiKeys: ApiKeys = {
    alphaVantage: apiKeysRaw.alphaVantage || DEFAULT_KEYS.alphaVantage,
    fred: apiKeysRaw.fred || DEFAULT_KEYS.fred,
    aiBaseUrl: apiKeysRaw.aiBaseUrl || DEFAULT_KEYS.aiBaseUrl,
    aiModel: apiKeysRaw.aiModel || DEFAULT_KEYS.aiModel,
    openaiKey: apiKeysRaw.openaiKey || DEFAULT_KEYS.openaiKey,
    deepseekKey: apiKeysRaw.deepseekKey || DEFAULT_KEYS.deepseekKey,
  };
  const [assets, setAssets] = useLocalStorage<AssetData[]>('mar_assets', mockAssets);
  const [marketData, setMarketData] = useState<Record<string, AssetMarketData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [aiInsightAsset, setAiInsightAsset] = useState<AssetData | null>(null);
  const refreshRef = useRef(false);

  const setApiKeys = useCallback((partial: Partial<ApiKeys>) => {
    setApiKeysRaw((prev) => ({ ...prev, ...partial }));
  }, [setApiKeysRaw]);

  const fetchMarketData = useCallback(async () => {
    if (refreshRef.current) return;
    refreshRef.current = true;
    setIsRefreshing(true);

    const updates: Record<string, AssetMarketData> = {};

    // Crypto via CoinGecko (no key needed)
    const cryptoAssets = assets.filter((a) => a.coingeckoId && a.category === 'Crypto');
    if (cryptoAssets.length) {
      try {
        const ids = cryptoAssets.map((a) => a.coingeckoId!);
        const prices = await fetchCryptoPrices(ids);
        for (const a of cryptoAssets) {
          const p = prices[a.coingeckoId!];
          if (p) {
            let history: { date: string; value: number }[] | undefined;
            try {
              history = await fetchCryptoPriceHistory(a.coingeckoId!, 30);
            } catch {
              history = generateMockSparkline(a.trend, a.score, a.basePrice);
            }
            updates[a.id] = { price: p.usd, change24h: p.usd_24h_change, history, currency: 'USD', lastUpdated: Date.now() };
          }
        }
      } catch (e) {
        console.warn('[AppContext] CoinGecko fetch failed:', e);
      }
    }

    // Forex via Frankfurter (No key needed)
    const forexAssets = assets.filter((a) => a.avFrom && a.avTo);
    for (const a of forexAssets) {
      try {
        const rate = await fetchForexRate(a.avFrom!, a.avTo!, apiKeys.alphaVantage);
        let history: { date: string; value: number }[] | undefined;
        try {
          history = await fetchForexHistory(a.avFrom!, a.avTo!);
        } catch {
          history = generateMockSparkline(a.trend, a.score, a.basePrice);
        }
        updates[a.id] = { price: rate.rate, change24h: 0, history, currency: a.avTo, lastUpdated: Date.now() };
      } catch (e) {
        console.warn(`[AppContext] Frankfurter forex ${a.id} failed:`, e);
        const history = generateMockSparkline(a.trend, a.score, a.basePrice);
        updates[a.id] = { price: a.basePrice, change24h: 0, history, currency: a.avTo, lastUpdated: Date.now() };
      }
    }

    // 3. Fetch US Macro Fundamentals via FRED
    let scores = { gdp: 0, inflation: 0, interestRates: 0, employmentChange: 0, unemploymentRate: 0 };
    if (apiKeys.fred) {
      try {
        const fredData = await fetchAllFredData(apiKeys.fred);
        const gdpV = fredData.GDP_GROWTH?.[0]?.value ?? 2.0; 
        const cpiV = fredData.CPI?.[0]?.value ?? 3.0;
        const unempV = fredData.UNEMPLOYMENT?.[0]?.value ?? 4.0;
        const ratesV = fredData.FED_FUNDS?.[0]?.value ?? 5.25;
        const jobsV = (fredData.NONFARM_PAYROLLS?.[0]?.value || 0) - (fredData.NONFARM_PAYROLLS?.[1]?.value || 0);

        const getGdpScore = (v: number) => v >= 3 ? 2 : v >= 2 ? 1 : v < 0 ? -2 : v < 1 ? -1 : 0;
        const getCpiScore = (v: number) => v >= 4.5 ? -2 : v >= 3.5 ? -1 : v <= 2.5 ? 2 : 0;
        const getRatesScore = (v: number) => v >= 5.0 ? -1 : v <= 2.5 ? 1 : 0;
        const getJobsScore = (v: number) => v >= 250 ? 2 : v >= 150 ? 1 : v < 50 ? -2 : 0;

        scores = {
          gdp: getGdpScore(gdpV),
          inflation: getCpiScore(cpiV),
          interestRates: getRatesScore(ratesV),
          employmentChange: getJobsScore(jobsV),
          unemploymentRate: unempV > 4.2 ? -1 : unempV < 3.8 ? 1 : 0
        };
      } catch (e) {
        console.warn('[AppContext] FRED fetch failed:', e);
      }
    }

    // --- 4. Official Institutional COT Positioning (Via Pure CFTC Proxy) ---
    let cotData: Record<string, any> = {};
    try {
      const cotRes = await fetch('/api/cot', {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (cotRes.ok) {
        const cotJson = await cotRes.json();
        if (cotJson.success) cotData = cotJson.cot;
      }
    } catch (e) {
      console.warn('[AppContext] COT Feed (CFTC) not available.');
    }

    // Apply all layers of data to assets using functional update to avoid loop
    setAssets(prevAssets => {
      return prevAssets.map(a => {
        const cot = cotData[a.id];
        let cotImpact = a.cot || 0;
        let cotL = a.cotLong; 
        let cotS = a.cotShort;

        if (cot) {
          const total = cot.long + cot.short;
          const longPct = total > 0 ? cot.long / total : 0.5;
          cotImpact = longPct >= 0.70 ? 2 : longPct >= 0.60 ? 1 : longPct <= 0.30 ? -2 : longPct <= 0.45 ? -1 : 0;
          cotL = Math.round(cot.long / 1000);
          cotS = Math.round(cot.short / 1000);
        }

        const newTotals = (a.trend || 0) + cotImpact + (a.retailPos || 0) + (a.seasonality || 0) + scores.gdp + scores.inflation + scores.interestRates + scores.employmentChange + scores.unemploymentRate;
        
        return {
          ...a,
          ...scores,
          cotLong: cotL,
          cotShort: cotS,
          cot: cotImpact,
          score: newTotals
        };
      });
    });

    setMarketData((prev) => ({ ...prev, ...updates }));
    setLastRefresh(new Date());
    setIsRefreshing(false);
    refreshRef.current = false;
  }, [apiKeys.alphaVantage, apiKeys.fred]);

  const updateMarketPrice = useCallback((assetId: string, p: number) => {
    setMarketData((prev) => ({
      ...prev,
      [assetId]: {
        ...(prev[assetId] ?? {}),
        price: p,
        lastUpdated: Date.now()
      }
    }));
  }, []);

  const addAsset = useCallback((asset: AssetData) => {
    setAssets((prev) => {
      if (prev.find(a => a.id === asset.id)) return prev;
      return [...prev, asset];
    });
  }, [setAssets]);

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter(a => a.id !== id));
  }, [setAssets]);

  // Initial load + 15-min auto-refresh
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  return (
    <Ctx.Provider
      value={{
        apiKeys, setApiKeys,
        assets,
        marketData,
        isRefreshing, lastRefresh,
        refreshData: fetchMarketData,
        selectedAsset, setSelectedAsset,
        activeView, setActiveView,
        aiInsightAsset, setAiInsightAsset,
        updateMarketPrice,
        addAsset,
        removeAsset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
