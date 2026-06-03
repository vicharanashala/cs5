/**
 * =============================================================================
 * QUERY.IN - ADMIN OVERVIEW PAGE
 * =============================================================================
 * Entry point for /admin route. Shows navigation cards to each section.
 * User Registration, Spoiled Users, and User Management are all combined
 * into the single "User Management" page at /admin/users.
 * Dynamic: Updates automatically when queries or users change.
 *
 * @module pages/admin/AdminOverview
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';

const AdminOverview = () => {
  const { socket } = useNotifications();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingQueries: 0,
    resolvedToday: 0,
    activeAnnouncements: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const [usersRes, queriesRes, announcementsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/admin/escalated?type=all'),
        api.get('/announcements')
      ]);

      const allQueries = queriesRes.data.data || [];
      const pendingCount = allQueries.filter(q =>
        q.status === 'Pending' || q.status === 'Peer Answered'
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const resolvedToday = allQueries.filter(q => {
        if (q.status !== 'Resolved') return false;
        const resolvedAt = new Date(q.resolved_at || q.updatedAt);
        return resolvedAt >= today;
      }).length;

      setStats({
        totalUsers: usersRes.data.count || 0,
        pendingQueries: pendingCount,
        resolvedToday,
        activeAnnouncements: announcementsRes.data.count || 0
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', fetchStats);
    socket.on('escalation_deleted', fetchStats);
    socket.on('users_updated', fetchStats);
    socket.on('query_state_changed', fetchStats);
    socket.on('announcements_updated', fetchStats);

    return () => {
      socket.off('new_notification', fetchStats);
      socket.off('escalation_deleted', fetchStats);
      socket.off('users_updated', fetchStats);
      socket.off('query_state_changed', fetchStats);
      socket.off('announcements_updated', fetchStats);
    };
  }, [socket, fetchStats]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">Complete system management interface</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/admin/users">
          <StatCard label="Total Users" value={stats.totalUsers} />
        </Link>
        <Link to="/admin/resolve">
          <StatCard label="Pending Queries" value={stats.pendingQueries} />
        </Link>
        <Link to="/admin/resolve">
          <StatCard label="Resolved Today" value={stats.resolvedToday} />
        </Link>
        <Link to="/admin/announcement">
          <StatCard label="Announcements" value={stats.activeAnnouncements} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard
          to="/admin/users"
          title="User Management"
          description="Register users, manage accounts, view warnings, activate/deactivate"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
        />
        <NavCard
          to="/admin/announcement"
          title="Announcements"
          description="Publish global notices directly into the platform feed"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          }
        />

        <NavCard
          to="/admin/faqs"
          title="FAQ Editor"
          description="Create a new FAQ or update existing entries in the FAQ collection"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <NavCard
          to="/admin/resolve"
          title="Query Management"
          description="Review, approve, or override escalated queries from peers. Resolve ambiguous or low-rated tickets."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, value }) => (
  <Card className="border border-gray-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
    <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
    <div className="text-3xl font-bold text-black">{value}</div>
  </Card>
);

const NavCard = ({ to, title, icon, description }) => {
  return (
    <a
      href={to}
      className="block border-2 border-black rounded-lg p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="text-black">{icon}</div>
        <div>
          <h3 className="font-bold text-black">{title}</h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default AdminOverview;
