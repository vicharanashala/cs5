/**
 * =============================================================================
 * QUERY.IN - AUTH ROUTES
 * =============================================================================
 * Express router mounting authentication endpoints.
 * Base path: /api/auth
 *
 * Routes:
 * - POST /api/auth/login - Authenticate user and return JWT
 * - POST /api/auth/register - Create new user account
 * - GET /api/auth/me - Get current authenticated user (protected)
 *
 * @module routes/authRoutes
 */

const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

module.exports = router;