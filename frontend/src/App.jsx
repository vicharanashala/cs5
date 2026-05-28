/**
 * =============================================================================
 * QUERY.IN - MAIN APPLICATION ROUTER
 * =============================================================================
 * Configures react-router-dom with protected routes for each role.
 *
 * Public Routes:
 * - /         → Landing page with 50/50 split layout
 * - /login    → Login portal
 *
 * Protected Routes (require JWT + correct role):
 * - /admin/*      → Admin dashboard (admin only)
 * - /moderator/*  → Moderator dashboard (moderator only)
 * - /intern/*     → Intern dashboard (intern only)
 *
 * The ProtectedRoute wrapper:
 * 1. Checks if user is authenticated (via AuthContext)
 * 2. Verifies user's role matches allowed roles for the route
 * 3. Redirects to /login if not authenticated
 * 4. Redirects to user's own dashboard if wrong role
 *
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';

import AdminDashboard from './pages/admin/AdminDashboard';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import InternDashboard from './pages/intern/InternDashboard';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes - admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Moderator Routes - moderator only */}
        <Route
          path="/moderator"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Intern Routes - intern only */}
        <Route
          path="/intern"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <InternDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;