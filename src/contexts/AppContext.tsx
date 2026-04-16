import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { AssetData } from '../data/mockData';
import { TERMINAL_ASSETS, generateNeuralSparkline } from '../data/mockData';
import { fetchCryptoPrices, fetchCryptoPriceHistory } from '../services/coinGecko';
import { fetchForexRate, fetchForexHistory, fetchStockQuote, fetchSnatcherQuote } from '../services/alphaVantage';
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
  macroData: { GDP: number | null; CPI: number | null; FedRate: number | null; NFP: number | null; PMI: number | null } | null;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  playMoneySound: (isForce?: boolean) => void;
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
  const [assets, setAssets] = useLocalStorage<AssetData[]>('mar_assets', TERMINAL_ASSETS);
  const [marketData, setMarketData] = useState<Record<string, AssetMarketData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [activeView, setActiveView] = useState('landing');
  const [aiInsightAsset, setAiInsightAsset] = useState<AssetData | null>(null);
  const [yields, setYields] = useState({ y2: 4.52, y10: 4.18, y30: 4.35, y3m: 5.25 });
  const [macroData, setMacroData] = useState<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const lastSqueezeRef = useRef<Set<string>>(new Set());
  const refreshRef = useRef(false);

  const playMoneySound = useCallback((isForce = false) => {
    if (!audioEnabled && !isForce) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');
    audio.volume = 0.35;
    audio.play().catch(e => console.log('Audio blocked by browser:', e));
  }, [audioEnabled]);

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
      // 1. Fetch market prices (CoinGecko Multi-Stream)
      const coingeckoAssets = assets.filter((a) => a.coingeckoId);
      if (coingeckoAssets.length) {
        try {
          const prices = await fetchCryptoPrices(coingeckoAssets.map(a => a.coingeckoId!));
          for (const a of coingeckoAssets) {
            const p = prices[a.coingeckoId!];
            if (p) {
              const history = await fetchCryptoPriceHistory(a.coingeckoId!, 30).catch(() => generateNeuralSparkline(a.trend, a.score, a.basePrice));
              const updatedAsset = { price: p.usd, change24h: p.usd_24h_change, history, currency: 'USD', lastUpdated: Date.now() };
              updates[a.id] = updatedAsset;
              setMarketData(prev => ({ ...prev, [a.id]: updatedAsset }));
            }
          }
        } catch (e) {}
      }

      // 2. Forex logic...
      const forexAssets = assets.filter((a) => a.avFrom && a.avTo);
      for (const a of forexAssets) {
        try {
          const rate = await fetchForexRate(a.avFrom!, a.avTo!, apiKeys.alphaVantage);
          const history = await fetchForexHistory(a.avFrom!, a.avTo!).catch(() => generateNeuralSparkline(a.trend, a.score, a.basePrice));
          
          let change24h = 0;
          if (history.length >= 2) {
            const last = history[history.length - 1].value;
            const prev = history[history.length - 2].value;
            change24h = ((last - prev) / prev) * 100;
          }
          
          const updatedAsset = { price: rate.rate, change24h, history, currency: a.avTo, lastUpdated: Date.now() };
          updates[a.id] = updatedAsset;
          setMarketData(prev => ({ ...prev, [a.id]: updatedAsset }));
        } catch (e) {}
      }

      // 3. Stock/Index/Commodity logic (ReaperSnatcher Proxy - No Rate Limits)
      const snatchAssets = assets.filter(a => (a.category === 'Indices' || a.category === 'Commodities') && !a.coingeckoId);
      for (const a of snatchAssets) {
        try {
          const quote = await fetchSnatcherQuote(a.id);
          const updatedAsset = { ...quote, history: generateNeuralSparkline(a.trend, a.score, a.basePrice) };
          updates[a.id] = updatedAsset;
          setMarketData(prev => ({ ...prev, [a.id]: updatedAsset }));
        } catch (e: any) {
          // If Snatcher fails, try AlphaVantage Ticker (if available)
          if (a.ticker) {
            try {
              const quote = await fetchStockQuote(a.ticker, apiKeys.alphaVantage);
              const updatedResult = { ...quote, history: generateNeuralSparkline(a.trend, a.score, a.basePrice) };
              setMarketData(prev => ({ ...prev, [a.id]: updatedResult }));
              await new Promise(res => setTimeout(res, 12500)); // Stagger to respect free tier
            } catch (avError) {}
          }
        }
      }

      // 4. US Macro Scores...
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

      if (neuralMacro) {
        setMacroData(neuralMacro);
      }

      // Update global Macro scores from Neural Matrix 9.0
      if (neuralMacro) {
        scores.gdp = (neuralMacro.GDP || 0) >= 3 ? 2 : (neuralMacro.GDP || 0) >= 2 ? 1 : 0;
        scores.inflation = (neuralMacro.CPI || 0) >= 4.5 ? -2 : (neuralMacro.CPI || 0) >= 3.5 ? -1 : 0;
        scores.interestRates = (neuralMacro.FedRate || 0) >= 5.5 ? -1 : 0;
        scores.employmentChange = (neuralMacro.NFP || 0) >= 250000 ? 2 : 1;
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
            // Institutional Positioning (Raw counts from CFTC or ratios from Neural)
            cL = data.iLong ?? a.cotLong ?? 50;
            // If iShort is provided (like from CFTC), use it. Otherwise assume percentages.
            cS = data.iShort ?? (cL > 100 ? a.cotShort ?? 50 : 100 - cL);
            
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
          // 5-tier COT scoring: strong signals at extremes, mild signals for moderate positioning
          cI = cPct >= 70 ? 2 : cPct >= 57 ? 1 : cPct <= 30 ? -2 : cPct <= 43 ? -1 : 0;

          const newTotals = cI + rP + scores.gdp + scores.inflation + scores.interestRates + scores.employmentChange;
          
          let dynamicBias: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish' = 'Neutral';
          // Neutral = exactly 0. Any positive score is Bullish, any negative is Bearish.
          if (newTotals >= 5) dynamicBias = 'Very Bullish';
          else if (newTotals >= 1) dynamicBias = 'Bullish';
          else if (newTotals === 0) dynamicBias = 'Neutral';
          else if (newTotals >= -4) dynamicBias = 'Bearish';
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

  // Self-heal local storage to push new baseline assets and update existing configs (Parity Lockdown)
  useEffect(() => {
    setAssets((prev) => {
      const updated = prev.map(pa => {
        const baseline = TERMINAL_ASSETS.find(ma => ma.id === pa.id);
        if (baseline) {
          // Sync critical data-routing properties from the new baseline
          return { 
            ...pa, 
            ticker: baseline.ticker, 
            coingeckoId: baseline.coingeckoId,
            avFrom: baseline.avFrom,
            avTo: baseline.avTo,
            category: baseline.category // Ensure commodities aren't miscategorized
          };
        }
        // Nuclear Force Sync (v17.5): Strip legacy coingeckoIds from Commodities to fix Safari/Cache loops
        if (pa.category === 'Commodities' && pa.coingeckoId) {
          const { coingeckoId, ...rest } = pa;
          return rest;
        }
        return pa;
      });
      
      const missing = TERMINAL_ASSETS.filter(ma => !updated.find(pa => pa.id === ma.id));
      if (missing.length > 0) return [...updated, ...missing];
      return updated;
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

  // --- Neural Sound Scraper - Squeeze Alerts ---
  useEffect(() => {
    if (!audioEnabled) return;
    
    const currentSqueezes = new Set<string>();
    let triggered = false;

    assets.forEach(a => {
      // Institutional Thresholds: 65% is where the pain starts for the other side
      const iLP = ( (a.cotLong || 0) / ((a.cotLong || 0) + (a.cotShort || 0)) ) * 100;
      const rLP = ( (a.retailLong || 0) / ((a.retailLong || 0) + (a.retailShort || 0)) ) * 100;
      
      const isSqueeze = (iLP >= 65 && rLP <= 35) || (iLP <= 35 && rLP >= 65);
      
      if (isSqueeze) {
        currentSqueezes.add(a.id);
        if (!lastSqueezeRef.current.has(a.id)) triggered = true;
      }
    });

    if (triggered) {
      console.log('--- MONSTAH SQUEEZE DETECTED ---');
      playMoneySound(true);
    }
    lastSqueezeRef.current = currentSqueezes;
  }, [assets, audioEnabled, playMoneySound]);

  return (
    <Ctx.Provider value={{
      apiKeys, setApiKeys, assets, marketData, isRefreshing, lastRefresh,
      refreshData: fetchMarketData, selectedAsset, setSelectedAsset,
      activeView, setActiveView, aiInsightAsset, setAiInsightAsset,
      updateMarketPrice, addAsset, removeAsset, yields, macroData,
      audioEnabled, setAudioEnabled, playMoneySound
    }}>
      {children}
    </Ctx.Provider>
  );
};
