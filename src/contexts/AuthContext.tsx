import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, provider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Auth] Setting up auth listener');
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[Auth] Timeout - forcing loading=false');
        setLoading(false);
      }
    }, 10000);

    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      console.log('[Auth] State changed:', u ? 'logged in' : 'logged out', u);
      if (!cancelled) {
        clearTimeout(timeout);
        setUser(u);
        setLoading(false);
      }
    }, (error: Error) => {
      console.error('[Auth] Failed to read authentication state:', error);
      if (!cancelled) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      unsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    setSignInError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err);
      const errorCode = typeof err === 'object' && err !== null && 'code' in err
        ? err.code
        : null;
      setSignInError(
        errorCode === 'auth/unauthorized-domain'
          ? `This address (${window.location.hostname}) is not authorized for sign-in. In Firebase Console, open Authentication → Settings → Authorized domains and add ${window.location.hostname}.`
          : errorCode === 'auth/cancelled-popup-request'
            ? 'Another Google sign-in window is already open. Close it and try again once.'
            : errorCode === 'auth/popup-blocked'
              ? 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.'
              : errorCode === 'auth/popup-closed-by-user'
                ? 'Google sign-in was canceled. Try again when you are ready.'
          : 'Google sign-in failed. Check the browser console for details and try again.',
      );
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[Auth] Sign-out failed:', err);
    }
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signInError, signInWithGoogle, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};
