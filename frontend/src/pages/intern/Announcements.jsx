/**
 * =============================================================================
 * QUERY.IN - ANNOUNCEMENTS PAGE (Intern)
 * =============================================================================
 * Displays announcements from admins/moderators to interns.
 *
 * @module pages/intern/Announcements
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';
import { useNotifications } from '../../context/NotificationContext';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useNotifications();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewAnnouncement = (notification) => {
      if (notification.type === 'announcement') {
        const newAnnouncement = {
          _id: notification.link_id,
          heading: notification.title,
          content: notification.message,
          priority: 'medium',
          createdAt: notification.createdAt || new Date().toISOString(),
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      }
    };

    socket.on('new_notification', handleNewAnnouncement);

    return () => {
      socket.off('new_notification', handleNewAnnouncement);
    };
  }, [socket]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Announcements</h1>
          <p className="text-text-secondary mt-1">Official updates from the administration</p>
        </div>

        {loading ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <p className="text-text-muted">Loading...</p>
          </Card>
        ) : announcements.length === 0 ? (
          <Card className="border-2 border-black rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="text-text-muted">No announcements yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const priorityColors = {
                high: 'bg-red-600 text-white',
                medium: 'bg-yellow-400 text-black',
                low: 'bg-green-800 text-white',
              };
              return (
              <Card key={ann._id} className="border-2 border-black rounded-lg p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted uppercase tracking-wider">Admin</span>
                    {ann.priority && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ann.priority]}`}>
                        {ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-text-muted">
                    {formatDate(ann.createdAt)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-black mb-3">{ann.heading}</h3>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{ann.content}</p>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Announcements;