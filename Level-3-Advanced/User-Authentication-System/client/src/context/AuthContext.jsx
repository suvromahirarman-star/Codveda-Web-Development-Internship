/**
 * AUTHGUARD - Authentication Context & Provider
 * Manages user authentication state, token storage strategy,
 * session lifecycle, and provides authentication hooks.
 * Codveda Level 3 Task 2 - User Authentication System
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'auth_guard_token';
const STORAGE_KEY_USER = 'auth_guard_user';

/**
 * Safely parse a JWT without external libraries.
 * Handles base64url encoding.
 */
function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Initialize state from sessionStorage (or memory fallback)
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_TOKEN) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Parse claims from active token
  const decodedToken = useMemo(() => parseJwt(token), [token]);

  // Synchronize state with sessionStorage
  const persistSession = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      if (newToken) {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, newToken);
      } else {
        sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      }
      if (newUser) {
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (storageError) {
      console.warn('Unable to persist session to sessionStorage:', storageError);
    }
  }, []);

  // Clear session on logout
  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  // Verify active session with backend on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyInitialSession() {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      // Check if client-side token is expired
      if (decodedToken && decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        logout();
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await api.getMe(token);
        if (isMounted && response?.user) {
          setUser(response.user);
          try {
            sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
          } catch {}
        }
      } catch (err) {
        // If server rejected token (e.g., tokenVersion mismatch or revoked), clear local session
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifyInitialSession();

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  // User Registration
  const register = useCallback(
    async (name, email, password) => {
      const res = await api.register(name, email, password);
      if (res?.user && res?.token) {
        persistSession(res.token, res.user);
      }
      return res;
    },
    [persistSession]
  );

  // User Login
  const login = useCallback(
    async (email, password) => {
      const res = await api.login(email, password);
      if (res?.user && res?.token) {
        persistSession(res.token, res.user);
      }
      return res;
    },
    [persistSession]
  );

  // Profile Update (Name & Email only - Role is immutable)
  const updateProfile = useCallback(
    async (profileData) => {
      if (!token) throw new Error('Not authenticated');
      const res = await api.updateProfile(profileData, token);
      if (res?.user) {
        setUser(res.user);
        try {
          sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
        } catch {}
      }
      return res;
    },
    [token]
  );

  // Password Change (invalidates old sessions and issues fresh token)
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!token) throw new Error('Not authenticated');
      const res = await api.changePassword(currentPassword, newPassword, token);
      if (res?.token) {
        setToken(res.token);
        try {
          sessionStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        } catch {}
        setUser((prev) => {
          if (!prev) return null;
          const updated = {
            ...prev,
            tokenVersion: (prev.tokenVersion || 0) + 1,
          };
          try {
            sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
      return res;
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      decodedToken,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, token, decodedToken, loading, login, register, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

