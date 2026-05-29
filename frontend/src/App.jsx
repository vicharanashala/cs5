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
import AdminOverview from './pages/admin/AdminOverview';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminUserRegistration from './pages/admin/AdminUserRegistration';
import AdminAnnouncement from './pages/admin/AdminAnnouncement';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQueries from './pages/admin/AdminQueries';
import AdminFaqEditor from './pages/admin/AdminFaqEditor';
import AdminHighRated from './pages/admin/AdminHighRated';
import AdminAmbiguous from './pages/admin/AdminAmbiguous';
import AdminResolveHub from './pages/admin/AdminResolveHub';
import ModeratorOverview from './pages/moderator/ModeratorOverview';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import ModeratorQueries from './pages/moderator/ModeratorQueries';
import ModeratorHighRated from './pages/moderator/ModeratorHighRated';
import ModeratorAmbiguous from './pages/moderator/ModeratorAmbiguous';
import ModeratorResolveHub from './pages/moderator/ModeratorResolveHub';
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
              <AdminOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/registration"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserRegistration />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcement"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnnouncement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/queries"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminQueries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/faqs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFaqEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/high-rated"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHighRated />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ambiguous"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAmbiguous />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/resolve"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminResolveHub />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator/queries"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorQueries />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator/high-rated"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorHighRated />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator/ambiguous"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorAmbiguous />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator/resolve"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorResolveHub />
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