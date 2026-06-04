/**
 * =============================================================================
 * QUERY.IN - MODERATOR OVERVIEW PAGE
 * =============================================================================
 * Entry point for /moderator route. Shows navigation cards to each section.
 * Dynamic: Updates automatically when queries change.
 *
 * @module pages/moderator/ModeratorOverview
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import RollingCounter from '../../components/RollingCounter';
import api from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';

const ModeratorOverview = () => {
  const { socket } = useNotifications();
  const [stats, setStats] = useState({ pendingQueries: 0, resolvedToday: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/escalated?type=all');
      const allQueries = res.data.data || [];
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
      setStats({ pendingQueries: pendingCount, resolvedToday });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!socket) return;

    socket.on('query_resolved', fetchStats);
    socket.on('query_state_changed', fetchStats);

    return () => {
      socket.off('query_resolved', fetchStats);
      socket.off('query_state_changed', fetchStats);
    };
  }, [socket, fetchStats]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Moderator Dashboard</h1>
        <p className="text-text-secondary mt-1">Review and resolve escalated queries</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/moderator/resolve">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
            <div className="text-sm font-medium text-gray-500 mb-1">Pending Queries</div>
            <div className="text-3xl font-bold text-black">
              <RollingCounter value={stats.pendingQueries} duration={1200} rollDigitDuration={600} />
            </div>
          </div>
        </Link>
        <Link to="/moderator/resolve">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
            <div className="text-sm font-medium text-gray-500 mb-1">Resolved Today</div>
            <div className="text-3xl font-bold text-black">
              <RollingCounter value={stats.resolvedToday} duration={1200} rollDigitDuration={600} />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard
          to="/moderator/announcements"
          title="Announcements"
          description="View official announcements from administration"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          }
        />
        <NavCard
          to="/moderator/resolve"
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

const NavCard = ({ to, title, icon, description }) => {
  return (
    <Link
      to={to}
      className="block border-2 border-black rounded-lg p-6 hover:bg-gray-50 transition-colors hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="text-black">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-black">{title}</h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default ModeratorOverview;
