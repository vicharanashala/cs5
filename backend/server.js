/**
 * =============================================================================
 * QUERY.IN - SERVER ENTRY POINT
 * =============================================================================
 * Initializes the Express.js application with essential middleware for CORS,
 * JSON parsing, database connection, and environment configuration.
 * This serves as the single entry point for all backend API routes.
 *
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, async () => {
  console.log(`🚀 Query.in server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  await connectDB();
});