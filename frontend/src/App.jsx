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
import AdminSuggestions from './pages/admin/AdminSuggestions';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import InternDashboard from './pages/intern/InternDashboard';
import AskAI from './pages/intern/AskAI';
import PeerQueue from './pages/intern/PeerQueue';
import MyEscalations from './pages/intern/MyEscalations';
import ViewFAQs from './pages/intern/ViewFAQs';
import Announcements from './pages/intern/Announcements';

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

        <Route
          path="/intern/peer-queue"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <PeerQueue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/my-queries"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <MyEscalations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/faqs"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <ViewFAQs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/intern/announcements"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <Announcements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/suggestions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSuggestions />
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