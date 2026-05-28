/**
 * =============================================================================
 * QUERY.IN - PROTECTED ROUTE COMPONENT
 * =============================================================================
 * @component ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const roleRoute = user.role === 'admin' ? '/admin' : user.role === 'moderator' ? '/moderator' : '/intern';
    if (location.pathname !== roleRoute) {
      return <Navigate to={roleRoute} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;