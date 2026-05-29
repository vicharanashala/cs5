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
 * - POST /api/auth/bulk-register - Bulk register users (admin)
 * - GET /api/auth/me - Get current authenticated user (protected)
 * - GET /api/auth/users - Get all users (admin)
 *
 * @module routes/authRoutes
 */

const express = require('express');
const router = express.Router();
const { login, register, getMe, bulkRegister, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.post('/bulk-register', protect, authorizeRoles('admin'), bulkRegister);
router.get('/me', protect, getMe);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

module.exports = router;