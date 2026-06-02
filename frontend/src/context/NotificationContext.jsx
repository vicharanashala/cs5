/**
 * =============================================================================
 * QUERY.IN - NOTIFICATION CONTEXT
 * =============================================================================
 * Handles real-time notifications via Socket.IO and notification state.
 *
 * Features:
 * - Connects to Socket.IO when authenticated
 * - Maintains notification list and unread count
 * - Shows toast pop-ups for new notifications
 * - Listens for yellow_alert events for admin dashboard
 *
 * @module context/NotificationContext
 */

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [yellowAlert, setYellowAlert] = useState(null);

  const addToast = useCallback((notification) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Notification socket connected');
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
      addToast(notification);
    });

    newSocket.on('yellow_alert', (alert) => {
      setYellowAlert(alert);
    });

    newSocket.on('escalation_deleted', (data) => {
      setNotifications((prev) => prev.filter((n) => n.link_id !== data.query_id));
    });

    newSocket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token, addToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  const clearYellowAlert = useCallback(() => {
    setYellowAlert(null);
  }, []);

  const value = {
    notifications,
    unreadCount,
    toasts,
    yellowAlert,
    markAsRead,
    markAllAsRead,
    removeToast,
    clearYellowAlert,
    fetchNotifications,
    socket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
