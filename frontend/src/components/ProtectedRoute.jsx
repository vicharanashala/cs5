/**
 * =============================================================================
 * QUERY.IN - PROTECTED ROUTE COMPONENT
 * =============================================================================
 * Guards routes based on authentication and role.
 * Checks localStorage directly to avoid race conditions with React state.
 *
 * @component ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const storedToken = localStorage.getItem('token');
  const storedUserStr = localStorage.getItem('user');

  if (!storedToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let currentUser = user;
  if (storedUserStr && !currentUser) {
    try {
      currentUser = JSON.parse(storedUserStr);
    } catch {
      currentUser = null;
    }
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    const roleRoute = currentUser.role === 'admin' ? '/admin' : currentUser.role === 'moderator' ? '/moderator' : '/intern';
    return <Navigate to={roleRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;