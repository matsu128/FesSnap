'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1日経過で自動ログアウト
  useEffect(() => {
    const checkLastLogin = async () => {
      const lastLoginAt = localStorage.getItem('lastLoginAt');
      if (lastLoginAt) {
        const now = Date.now();
        if (now - Number(lastLoginAt) > 24 * 60 * 60 * 1000) {
          await supabase.auth.signOut();
          localStorage.removeItem('lastLoginAt');
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };
    checkLastLogin();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
      setLoading(false);
      if (user) {
        localStorage.setItem('lastLoginAt', Date.now().toString());
      }
      console.log('[AuthContext] checkLoginStatus user:', user, 'isLoggedIn:', !!user);
    };
    checkLoginStatus();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        localStorage.setItem('lastLoginAt', Date.now().toString());
      }
      console.log('[AuthContext] onAuthStateChange event:', event, 'user:', session?.user, 'isLoggedIn:', !!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('lastLoginAt');
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signInWithOAuth = async (provider) => {
    return await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, signOut, signIn, signUp, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 