/**
 * =============================================================================
 * QUERY.IN - SOCKET.IO CONFIGURATION
 * =============================================================================
 * Handles real-time WebSocket communication via Socket.IO.
 *
 * AUTHENTICATION FLOW:
 * 1. Client connects with JWT token in auth header or query param
 * 2. Socket middleware extracts and verifies JWT
 * 3. On success, user joins a room named after their user ID
 * 4. On failure, socket connection is rejected
 *
 * ROOMS:
 * - Each user joins a personal room: `user:${userId}`
 * - Admins join a global admin room: `room:admins`
 *
 * @module config/socket
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
      socket.user = {
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    socket.join(`user:${id}`);

    if (role === 'admin' || role === 'moderator') {
      socket.join('room:admins');
    }

    socket.on('disconnect', () => {
    });

    socket.on('join-query-room', (queryId) => {
      socket.join(`query:${queryId}`);
    });

    socket.on('leave-query-room', (queryId) => {
      socket.leave(`query:${queryId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };