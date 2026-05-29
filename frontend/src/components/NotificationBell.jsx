/**
 * =============================================================================
 * QUERY.IN - NOTIFICATION BELL COMPONENT
 * =============================================================================
 * Bell icon with unread count badge and dropdown notification list.
 * Shows toast pop-ups for new notifications.
 *
 * @component NotificationBell
 */

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    toasts,
    markAsRead,
    markAllAsRead,
    removeToast,
  } = useNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification._id);
    }
    setDropdownOpen(false);

    if (notification.link_type === 'query') {
      navigate('/intern/my-queries');
    } else if (notification.link_type === 'announcement') {
      navigate('/intern/announcements');
    } else if (notification.link_type === 'faq' && notification.link_type === 'faq') {
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
    switch (type) {
      case 'peer_answer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'query_resolved':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'admin_alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'announcement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24c.183.855.53 1.498 1.042 1.998l2.86 2.092a1 1 0 001.492 0l3.954-1.45a1 1 0 001.042-1.198L22 6.592V5.882a1 1 0 00-.424-.876l-3.168-2.632A1 1 0 0017.373 2H6.627a1 1 0 00-.977.876L2.54 5.006a1 1 0 00-.424.876V6.592L2 19.24c.182.855.53 1.498 1.042 1.998l2.86 2.092a1 1 0 001.492 0l3.954-1.45a1 1 0 001.042-1.198L13.426 19.24V11a1 1 0 001.042-1.198l2.86-2.092a1 1 0 001.492 0l.728 1.082a1 1 0 001.042 1.198L18.1 20.03c.513.423 1.043.813 1.042 1.199V23a1 1 0 01-1 1H5a1 1 0 01-1-1v-1.769L3.072 21.23c-.513.423-1.043.813-1.042 1.199v-1.77l1.958.817L2 19.24" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="relative p-2 text-text-secondary hover:bg-gray-100 rounded-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-black rounded-sm shadow-elevated z-50">
            <div className="flex items-center justify-between p-4 border-b border-black">
              <h3 className="text-sm font-bold text-black">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-text-muted hover:text-black transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      w-full text-left p-4 border-b border-border-subtle hover:bg-gray-50 transition-colors
                      ${!notification.is_read ? 'bg-black/5' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-black' : 'text-text-secondary'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <span className="w-2 h-2 bg-black rounded-full block" />
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-3 border-t border-border-subtle text-center">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-xs text-black font-medium hover:underline"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          notification={toast}
          onClose={() => removeToast(toast.id)}
          onClick={() => handleNotificationClick(toast)}
        />
      ))}
    </>
  );
};

export default NotificationBell;
