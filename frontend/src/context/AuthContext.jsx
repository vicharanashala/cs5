/**
 * =============================================================================
 * QUERY.IN - AUTH CONTEXT
 * =============================================================================
 * Simplified auth state - initialized synchronously from localStorage.
 *
 * @module context/AuthContext
 */

import { createContext, useState, useCallback, useContext } from 'react';

const AuthContext = createContext(null);

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user, isAuthenticated: !!token };
  } catch {
    return { token: null, user: null, isAuthenticated: false };
  }
};

export const AuthProvider = ({ children }) => {
  const initialAuth = getStoredAuth();

  const [user, setUser] = useState(initialAuth.user);
  const [token, setToken] = useState(initialAuth.token);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};