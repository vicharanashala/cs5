/**
 * =============================================================================
 * QUERY.IN - AUTH MIDDLEWARE (RBAC)
 * =============================================================================
 * Security gatekeepers for protecting endpoints and enforcing role-based access.
 *
 * protect middleware:
 * - Extracts Bearer token from Authorization header
 * - Verifies JWT signature using JWT_SECRET
 * - Attaches decoded user to req.user
 * - Returns 401 if token missing/invalid
 *
 * authorizeRoles middleware:
 * - Higher-order function that returns a middleware
 * - Checks if req.user.role is in allowed roles array
 * - Returns 403 Forbidden if not authorized
 * - Returns 401 if no user attached (protect must run first)
 *
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Middleware: Verify JWT token and attach user to request.
 * Must be used on any route that requires authentication.
 *
 * Flow:
 * 1. Extract token from "Bearer <token>" in Authorization header
 * 2. Verify token signature using JWT_SECRET
 * 3. Decode payload and attach to req.user
 * 4. Pass control to next middleware/handler
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next()
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * Middleware Factory: Authorize specific roles.
 * Must be used AFTER protect middleware (relies on req.user).
 *
 * Flow:
 * 1. Check if req.user exists (protect must have run)
 * 2. Check if req.user.role is in the allowed roles array
 * 3. If authorized, pass to next()
 * 4. If not authorized, return 403 Forbidden
 *
 * @param {...String} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware function
 *
 * @example
 * // Single role
 * router.get('/admin-only', protect, authorizeRoles('admin'), handler);
 *
 * @example
 * // Multiple roles
 * router.get('/mod-or-admin', protect, authorizeRoles('admin', 'moderator'), handler);
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Your role (${req.user.role}) is not authorized for this resource.`,
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };