/**
 * =============================================================================
 * QUERY.IN - SERVER ENTRY POINT
 * =============================================================================
 * Initializes Express with Socket.IO and background cron jobs.
 *
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { connectDB } = require('./config/db');
const { initializeSocket } = require('./config/socket');
const { startSweeper } = require('./jobs/sweeper');

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/queries', require('./routes/queryRoutes'));
app.use('/api/ask', require('./routes/askAIRoutes'));
app.use('/api/peer', require('./routes/peerRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

server.listen(PORT, async () => {
  console.log(`🚀 Query.in server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  await connectDB();
  startSweeper();
});