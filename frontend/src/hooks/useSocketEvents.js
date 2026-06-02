/**
 * =============================================================================
 * QUERY.IN - USE SOCKET EVENTS HOOK
 * =============================================================================
 * Custom hook for subscribing to Socket.IO events and refreshing data.
 * Used by pages to stay dynamic without manual refresh.
 *
 * @module hooks/useSocketEvents
 */

import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocketEvents = (eventHandlers = {}) => {
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('useSocketEvents: connected');
    });

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      if (typeof handler === 'function') {
        socket.on(event, handler);
      }
    });

    socket.on('disconnect', () => {
      console.log('useSocketEvents: disconnected');
    });

    return () => {
      Object.keys(eventHandlers).forEach((event) => {
        socket.off(event);
      });
      socket.disconnect();
    };
  }, [isAuthenticated, token]);
};

export default useSocketEvents;