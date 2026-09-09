// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

function normalizeUser(payload) {
  if (!payload) return null;
  const nested = payload.user || payload;
  const normalized = {
    ...(nested || {}),
    role: nested?.role || payload?.role || nested?.userRole || nested?.type || 'USER',
  };
  if (normalized.email === undefined && payload?.email) normalized.email = payload.email;
  return normalized;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const tk = tokenStorage.getAccess();
      if (!tk) { setLoading(false); return; }
      try {
        const data = await authApi.getMe();
        setUser(normalizeUser(data));
      } catch {
        tokenStorage.clearTokens();
      } finally {
        setLoading(false);
      }
    };
    restore();
    const handler = () => { setUser(null); tokenStorage.clearTokens(); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    const nextUser = normalizeUser(data);
    setUser(nextUser);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authApi.register(userData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
