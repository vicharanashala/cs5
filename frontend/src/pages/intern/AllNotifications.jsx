/**
 * =============================================================================
 * QUERY.IN - ALL NOTIFICATIONS PAGE
 * =============================================================================
 * Full page view of all notifications for the intern.
 *
 * @module pages/intern/AllNotifications
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?page=${pageNum}&limit=20`);
      const data = res.data.data || [];
      if (pageNum === 1) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.link_type === 'query') {
      navigate('/intern/my-queries');
    } else if (notification.link_type === 'announcement') {
      navigate('/intern/announcements');
    } else if (notification.link_type === 'faq') {
      navigate('/admin/suggestions');
    }
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTypeIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'peer_answer':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'query_resolved':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'admin_alert':
      case 'intern_warning':
        return (
          <svg className={`${iconClass} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'announcement':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24c.183.855.53 1.498 1.042 1.998l2.86 2.092a1 1 0 001.492 0l3.954-1.45a1 1 0 001.042-1.198V6.592L22 19.24" />
          </svg>
        );
      case 'faq_added':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getTypeBadgeColor = (type) => {
    if (type === 'admin_alert' || type === 'intern_warning') {
      return 'bg-red-100 text-red-700';
    }
    if (type === 'announcement') {
      return 'bg-blue-100 text-blue-700';
    }
    if (type === 'faq_added') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-black text-white';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">All Notifications</h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && notifications.length === 0 ? (
          <Card className="py-12 text-center border border-gray-100" hover={false}>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="py-12 text-center border border-gray-100" hover={false}>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">You're all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`p-5 hover:shadow-md transition-shadow border ${!notification.is_read ? 'border-l-4 border-l-black bg-gray-50/50' : 'border-gray-100'}`}
                hover={false}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    notification.type === 'admin_alert' || notification.type === 'intern_warning'
                      ? 'bg-red-100'
                      : notification.type === 'announcement'
                      ? 'bg-blue-100'
                      : notification.type === 'faq_added'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}>
                    <span className={`${
                      notification.type === 'admin_alert' || notification.type === 'intern_warning'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-black rounded-full" />
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTypeBadgeColor(notification.type)}`}>
                        {notification.type === 'admin_alert' ? 'Alert' :
                         notification.type === 'announcement' ? 'Announcement' :
                         notification.type === 'peer_answer' ? 'New Answer' :
                         notification.type === 'query_resolved' ? 'Resolved' :
                         notification.type === 'intern_warning' ? 'Warning' :
                         notification.type === 'faq_added' ? 'FAQ Added' : 'Notification'}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-xs text-gray-400 hover:text-black transition-colors"
                        title="Mark as read"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" onClick={() => fetchNotifications(page + 1)} disabled={loading}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllNotifications;
