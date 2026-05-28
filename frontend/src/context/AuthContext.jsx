/**
 * =============================================================================
 * QUERY.IN - AUTH CONTEXT
 * =============================================================================
 * React Context for managing authentication state across the application.
 * Stores the JWT token and user data, provides login/logout functions,
 * and automatically loads auth state from localStorage on mount.
 *
 * Architecture:
 * - Token stored in localStorage for persistence across page refreshes
 * - User object contains: id, email, role (from JWT payload)
 * - login() calls /api/auth/login and stores token + user
 * - logout() clears localStorage and resets state
 * - isAuthenticated boolean computed from !!token
 *
 * @module context/AuthContext
 */

import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

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