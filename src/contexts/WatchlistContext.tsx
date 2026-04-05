import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface WatchlistItem {
  id: string;         // asset id
  name: string;
  category: string;
  addedAt: number;    // timestamp
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  isInWatchlist: (id: string) => boolean;
  addToWatchlist: (item: WatchlistItem) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  watchlistLoading: boolean;
}

const WatchlistCtx = createContext<WatchlistContextType | null>(null);

export const useWatchlist = () => {
  const ctx = useContext(WatchlistCtx);
  if (!ctx) throw new Error('useWatchlist must be inside WatchlistProvider');
  return ctx;
};

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist]             = useState<WatchlistItem[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Real-time Firestore listener — scoped to the signed-in user
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    setWatchlistLoading(true);
    const ref = doc(db, 'watchlists', user.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setWatchlist(data.items ?? []);
      } else {
        // First-time user — create empty watchlist doc
        setDoc(ref, { items: [] });
        setWatchlist([]);
      }
      setWatchlistLoading(false);
    }, (err) => {
      console.error('[Watchlist] Firestore listener error:', err);
      setWatchlistLoading(false);
    });

    return unsub;
  }, [user]);

  const isInWatchlist = useCallback(
    (id: string) => watchlist.some((w) => w.id === id),
    [watchlist]
  );

  const addToWatchlist = useCallback(async (item: WatchlistItem) => {
    if (!user) return;
    const ref = doc(db, 'watchlists', user.uid);
    await updateDoc(ref, { items: arrayUnion(item) });
  }, [user]);

  const removeFromWatchlist = useCallback(async (id: string) => {
    if (!user) return;
    const ref       = doc(db, 'watchlists', user.uid);
    const snap      = await getDoc(ref);
    if (!snap.exists()) return;
    const existing  = (snap.data().items ?? []) as WatchlistItem[];
    const itemToRem = existing.find((w) => w.id === id);
    if (itemToRem) {
      await updateDoc(ref, { items: arrayRemove(itemToRem) });
    }
  }, [user]);

  return (
    <WatchlistCtx.Provider value={{ watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist, watchlistLoading }}>
      {children}
    </WatchlistCtx.Provider>
  );
};
