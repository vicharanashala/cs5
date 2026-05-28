/**
 * =============================================================================
 * QUERY.IN - SERVER ENTRY POINT
 * =============================================================================
 * Initializes the Express.js application with essential middleware for CORS,
 * JSON parsing, and environment configuration. This serves as the single
 * entry point for all backend API routes.
 *
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: Enable Cross-Origin Resource Sharing for frontend-backend communication
// Configured to allow credentials and specific origin (configured in .env)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware: Parse incoming JSON payloads with a 10mb limit to accommodate
// potential large query texts or bulk data transfers
app.use(express.json({ limit: '10mb' }));

// Middleware: Parse URL-encoded bodies (for form submissions if needed)
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - useful for container orchestration and load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: Mount route modules here once created
// Example: app.use('/api/auth', require('./routes/auth'));
// Example: app.use('/api/queries', require('./routes/queries'));

app.listen(PORT, () => {
  console.log(`🚀 Query.in server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});