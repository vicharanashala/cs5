/**
 * =============================================================================
 * QUERY.IN - PROTECTED ROUTE COMPONENT
 * =============================================================================
 * A wrapper component that guards routes based on authentication and role.
 *
 * Flow:
 * 1. While auth is loading (checking localStorage), show nothing (prevents flash)
 * 2. If not authenticated, redirect to /login
 * 3. If authenticated but wrong role, redirect to their own dashboard
 * 4. If authenticated and authorized, render the child route
 *
 * Usage:
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @component ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const isAuthenticated = !!storedToken;
  const parsedUser = storedUser ? JSON.parse(storedUser) : user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(parsedUser?.role)) {
    const roleRoute = parsedUser?.role === 'admin' ? '/admin' : parsedUser?.role === 'moderator' ? '/moderator' : '/intern';
    return <Navigate to={roleRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;