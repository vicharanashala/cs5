/**
 * =============================================================================
 * QUERY.IN - MAIN APPLICATION ROUTER
 * =============================================================================
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import FAQs from './pages/FAQs';

import AdminDashboard from './pages/admin/AdminDashboard';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import InternDashboard from './pages/intern/InternDashboard';
import AskAI from './pages/intern/AskAI';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/faqs" element={<FAQs />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <InternDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/ask"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <AskAI />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;