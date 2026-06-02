/**
 * =============================================================================
 * QUERY.IN - MODERATOR OVERVIEW PAGE
 * =============================================================================
 * Entry point for /moderator route. Shows navigation cards to each section.
 *
 * @module pages/moderator/ModeratorOverview
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

const ModeratorOverview = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        const data = res.data.data || [];
        setAnnouncements(data);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        setHasNew(data.some(a => new Date(a.createdAt) > oneDayAgo));
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Moderator Dashboard</h1>
        <p className="text-text-secondary mt-1">Review and resolve escalated queries</p>
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
          hasNew={hasNew}
        />
        <NavCard
          to="/moderator/resolve"
          title="Resolve Hub"
          description="Central command terminal for reviewing, approving, or overriding escalated queries"
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

const NavCard = ({ to, title, icon, description, hasNew }) => {
  return (
    <Link
      to={to}
      className="block border-2 border-black rounded-lg p-6 hover:bg-gray-50 transition-colors hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="text-black relative">
          {icon}
          {hasNew && (
            <span className="absolute -top-1 -right-1 relative">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            </span>
          )}
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
