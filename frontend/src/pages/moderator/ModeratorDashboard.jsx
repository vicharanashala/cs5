/**
 * =============================================================================
 * QUERY.IN - MODERATOR DASHBOARD INDEX
 * =============================================================================
 * Entry point for /moderator route. Shows moderator queue overview.
 *
 * @module pages/moderator/ModeratorDashboard
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../utils/api';

const navItems = [
  {
    path: '/moderator',
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    path: '/moderator/queries',
    label: 'Query Review Queue',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  },
  {
    path: '/moderator/faqs',
    label: 'View FAQs',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    path: '/moderator/announcements',
    label: 'Announcements',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
];

const ModeratorDashboard = () => {
  const [stats, setStats] = useState({ pendingReview: 0, myResponses: 0, resolved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/queries?status=Pending&limit=0');
        setStats({
          pendingReview: res.data.total || 0,
          myResponses: 0,
          resolved: 0,
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
          <h1 className="text-2xl font-bold text-black">Moderator Dashboard</h1>
          <p className="text-text-secondary mt-1">Review and respond to escalated queries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-black">
            <Badge variant="filled" className="mb-3">Pending</Badge>
            <div className="text-3xl font-bold text-black">{stats.pendingReview}</div>
            <div className="text-sm text-text-secondary mt-1">Awaiting Review</div>
          </Card>
          <Card className="border border-black">
            <Badge variant="outline" className="mb-3">Active</Badge>
            <div className="text-3xl font-bold text-black">{stats.myResponses}</div>
            <div className="text-sm text-text-secondary mt-1">My Responses</div>
          </Card>
          <Card className="border border-black">
            <Badge variant="verified" className="mb-3">Resolved</Badge>
            <div className="text-3xl font-bold text-black">{stats.resolved}</div>
            <div className="text-sm text-text-secondary mt-1">Resolved</div>
          </Card>
        </div>

        <Card className="border border-black">
          <h2 className="text-lg font-semibold text-black mb-4">Review Queue</h2>
          <p className="text-text-muted text-sm">Escalated queries from interns that need official responses appear here.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;