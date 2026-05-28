/**
 * =============================================================================
 * QUERY.IN - ADMIN DASHBOARD INDEX
 * =============================================================================
 * Entry point for /admin route. Shows admin dashboard overview.
 *
 * @module pages/admin/AdminDashboard
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const navItems = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    path: '/admin/announcements',
    label: 'Broadcast Announcement',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  {
    path: '/admin/queries',
    label: 'Master Query Monitor',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
  {
    path: '/admin/faqs',
    label: 'FAQ Database',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    path: '/admin/suggestions',
    label: 'AI FAQ Suggestions',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalQueries: 0, totalFAQs: 0, pendingQueries: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, queriesRes, faqsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/queries?limit=0'),
          api.get('/faqs'),
        ]);
        setStats({
          totalUsers: 1,
          totalQueries: queriesRes.data.total || 0,
          totalFAQs: faqsRes.data.count || 0,
          pendingQueries: queriesRes.data.total || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
          <p className="text-text-secondary mt-1">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-black">
            <div className="text-3xl font-bold text-black">{stats.totalUsers}</div>
            <div className="text-sm text-text-secondary mt-1">Total Users</div>
          </Card>
          <Card className="border border-black">
            <div className="text-3xl font-bold text-black">{stats.totalQueries}</div>
            <div className="text-sm text-text-secondary mt-1">Total Queries</div>
          </Card>
          <Card className="border border-black">
            <div className="text-3xl font-bold text-black">{stats.totalFAQs}</div>
            <div className="text-sm text-text-secondary mt-1">FAQ Database</div>
          </Card>
          <Card className="border border-black">
            <div className="text-3xl font-bold text-black">{stats.pendingQueries}</div>
            <div className="text-sm text-text-secondary mt-1">Pending Escalations</div>
          </Card>
        </div>

        <Card className="border border-black">
          <h2 className="text-lg font-semibold text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/users" className="p-4 border border-border-subtle hover:border-black hover:shadow-card transition-all rounded-sm">
              <div className="font-medium text-black">Manage Users</div>
              <p className="text-sm text-text-muted mt-1">Add, edit, or remove user accounts</p>
            </a>
            <a href="/admin/announcements" className="p-4 border border-border-subtle hover:border-black hover:shadow-card transition-all rounded-sm">
              <div className="font-medium text-black">Broadcast</div>
              <p className="text-sm text-text-muted mt-1">Send system-wide announcement</p>
            </a>
            <a href="/admin/suggestions" className="p-4 border border-border-subtle hover:border-black hover:shadow-card transition-all rounded-sm">
              <div className="font-medium text-black">AI Suggestions</div>
              <p className="text-sm text-text-muted mt-1">Review no-FAQ content gaps</p>
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;