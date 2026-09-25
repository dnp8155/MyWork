import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getSupabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState(null);

  useEffect(() => {
    let unsubscribe = null;

    const init = async () => {
      try {
        const supabase = await getSupabase();

        // onAuthStateChange fires INITIAL_SESSION when the client finishes
        // recovering the session from localStorage — we wait for that
        // before marking auth as loaded, so we don't prematurely redirect.
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'INITIAL_SESSION') {
            if (session?.user) {
              setUser(session.user);
              setIsAuthenticated(true);
            }
            setAuthChecked(true);
            setIsLoadingAuth(false);
            setIsLoadingPublicSettings(false);
          } else if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAuthenticated(false);
          }
        });
        unsubscribe = data.subscription.unsubscribe;
      } catch (error) {
        console.error('Auth init failed:', error);
        setAuthError({ type: 'unknown', message: error.message });
        setAuthChecked(true);
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const checkUserAuth = async () => {
    try {
      const supabase = await getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
      setIsLoadingAuth(false);
    } catch (error) {
      setIsAuthenticated(false);
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkAppState = checkUserAuth;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};