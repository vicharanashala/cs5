/**
 * =============================================================================
 * QUERY.IN - AUTH CONTEXT
 * =============================================================================
 * React Context for managing authentication state across the application.
 * State is initialized directly from localStorage to avoid race conditions.
 *
 * @module context/AuthContext
 */

import { createContext, useState, useEffect, useContext, useCallback } from 'react';

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
  const [loading, setLoading] = useState(false);

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

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);