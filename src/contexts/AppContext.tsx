import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { AssetData } from '../data/mockData';
import { TERMINAL_ASSETS, generateNeuralSparkline } from '../data/mockData';
import { fetchCryptoPrices, fetchCryptoPriceHistory } from '../services/coinGecko';
import { fetchSnatcherQuote } from '../services/alphaVantage';
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

export interface HeroSetup {
  assetId: string;
  name: string;
  entry: number;
  target: number;
  type: 'LONG' | 'SHORT';
  status: 'IRON HOLD' | 'DISTRIBUTING' | 'REVERSING' | 'LIQUIDATED';
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
  activeSetup: HeroSetup | null;
  setActiveSetup: (s: HeroSetup | null) => void;
  dataSyncStatus: { institutional: boolean; retail: boolean; yields: boolean };
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
  const [dataSyncStatus, setDataSyncStatus] = useState({ institutional: false, retail: false, yields: false });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeSetup, setActiveSetup] = useLocalStorage<HeroSetup | null>('mar_hero_setup', {
    assetId: 'EURUSD',
    name: 'Euro / US Dollar',
    entry: 1.18045,
    target: 1.1600,
    type: 'SHORT',
    status: 'IRON HOLD'
  });
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

      // 2 & 3. Institutional Priority Data (ReaperSnatcher Proxy - Fast & Parallel)
      const primaryAssets = assets.filter(a => a.category !== 'Crypto');
      const SENTINEL_BOUNDS: Record<string, [number, number]> = {
        'GOLD': [2000, 6000], 'SILVER': [20, 150], 'USOIL': [50, 250], 'UKOIL': [50, 250],
        'DAX': [15000, 35000], 'SP500': [4000, 10000], 'NASDAQ': [15000, 35000], 
        'US30': [30000, 60000], 'NIKKEI': [35000, 75000], 'EURUSD': [0.8, 1.5],
        'GBPUSD': [0.9, 1.8], 'AUDUSD': [0.4, 1.0], 'USDJPY': [70, 200], 'USDCAD': [1.1, 1.6]
      };

      // Parallelize the Primary Pulse (v28.8)
      await Promise.all(primaryAssets.map(async (a) => {
        try {
          // Attempt Snatcher first (Direct JSON Node)
          const quote = await fetchSnatcherQuote(a.id);
          
          const bounds = SENTINEL_BOUNDS[a.id];
          if (bounds && (quote.price! < bounds[0] || quote.price! > bounds[1])) {
             return; // Silent purge for safety
          }

          const updatedAsset = { ...quote, history: generateNeuralSparkline(a.trend, a.score, a.basePrice) };
          updates[a.id] = updatedAsset;
          
          // Immediate individual state update for UI responsiveness
          setMarketData(prev => ({ ...prev, [a.id]: updatedAsset }));
        } catch (e: any) {
          // Stage 2: Secondary Node Fallback (Handled sequentially to protect API keys)
          const ticker = a.ticker || (a.avFrom && a.avTo ? `${a.avFrom}${a.avTo}` : null);
          if (ticker && !activeSetup || activeSetup?.assetId !== a.id) { // Don't stall on Hero Trade
             // Fallback logic for non-hero assets...
          }
        }
      }));

      // Dedicated Hero Pulse (v28.8)
      if (activeSetup) {
        try {
          const heroQuote = await fetchSnatcherQuote(activeSetup.assetId);
          setMarketData(prev => ({ ...prev, [activeSetup.assetId]: { ...heroQuote, lastUpdated: Date.now() } }));
        } catch (e) {}
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
        setDataSyncStatus(prev => ({ ...prev, yields: true }));
      }

      if (neuralMacro) {
        setMacroData(neuralMacro);
        setDataSyncStatus(prev => ({ ...prev, institutional: true }));
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
            // Institutional Positioning (Raw counts from CFTC)
            cL = data.iLong ?? null;
            cS = data.iShort ?? null;
            
            // Retail Positioning (Official Sync)
            if (!a.snatcherActive) {
              rL = data.long ?? null;
              rS = data.short ?? null;
            }
          } else {
            // Stage 3: Fuzzy Normalization for Institutional Feeds (DAX, Oil, Spreads)
            const fuzzyKey = a.id.toUpperCase();
            let matchedData = null;
            
            if (fuzzyKey.includes('DAX')) matchedData = neuralData['DE30'] || neuralData['GER30'];
            if (fuzzyKey.includes('USOIL')) matchedData = neuralData['WTI'];
            if (fuzzyKey.includes('UKOIL')) matchedData = neuralData['BRENT'];
            if (fuzzyKey.includes('US30')) matchedData = neuralData['DIA'] || neuralData['DOW'];
            if (fuzzyKey.includes('NASDAQ')) matchedData = neuralData['NDX'] || neuralData['QQQ'];
            if (fuzzyKey.includes('SP500')) matchedData = neuralData['SPX'] || neuralData['SPY'];
            if (fuzzyKey.includes('COPPER')) matchedData = neuralData['HG'];

            if (matchedData) {
              cL = matchedData.iLong ?? null;
              cS = matchedData.iShort ?? null;
            }
          }

          // Strict Bias Scoring (Only if Live Data exists)
          let cPct: number | null = null;
          let rPct: number | null = null;
          
          if (cL !== null && cS !== null && (cL !== 0 || cS !== 0)) cPct = (cL / (cL + cS)) * 100;
          if (rL !== null && rS !== null) rPct = (rL / (rL + rS)) * 100;

          rP = (rPct !== null) ? (rPct >= 75 ? -2 : rPct <= 25 ? 2 : 0) : 0;
          cI = (cPct !== null) ? (cPct >= 70 ? 2 : cPct >= 57 ? 1 : cPct <= 30 ? -2 : cPct <= 43 ? -1 : 0) : 0;

          const liveSignalsCount = [cPct, rPct, scores.gdp, scores.inflation].filter(s => s !== null).length;
          
          // Total Matrix Score (v29.5 - Execution Grade)
          const newTotals = (cPct !== null ? cI : 0) + (rPct !== null ? rP : 0) + 
                            (scores.gdp || 0) + (scores.inflation || 0) + 
                            (scores.interestRates || 0) + (scores.employmentChange || 0);
          
          let dynamicBias: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish' = 'Neutral';
          if (liveSignalsCount > 0) {
            if (newTotals >= 5) dynamicBias = 'Very Bullish';
            else if (newTotals >= 1) dynamicBias = 'Bullish';
            else if (newTotals === 0) dynamicBias = 'Neutral';
            else if (newTotals >= -4) dynamicBias = 'Bearish';
            else dynamicBias = 'Very Bearish';
          }

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
          return { 
            ...pa, 
            ticker: baseline.ticker, 
            coingeckoId: baseline.coingeckoId,
            avFrom: baseline.avFrom,
            avTo: baseline.avTo,
            category: baseline.category 
          };
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
    setDataSyncStatus(prev => ({ ...prev, retail: true }));
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

  const contextValue = {
    apiKeys, setApiKeys, assets, marketData, isRefreshing, lastRefresh,
    refreshData: fetchMarketData, selectedAsset, setSelectedAsset,
    activeView, setActiveView, aiInsightAsset, setAiInsightAsset,
    updateMarketPrice, addAsset, removeAsset, yields, macroData,
    audioEnabled, setAudioEnabled, playMoneySound,
    activeSetup, setActiveSetup, dataSyncStatus
  };

  useEffect(() => {
    (window as any)._appCtx = contextValue;
  }, [contextValue]);

  return (
    <Ctx.Provider value={contextValue}>
      {children}
    </Ctx.Provider>
  );
};
