/**
 * =============================================================================
 * QUERY.IN - ADMIN ROUTES
 * =============================================================================
 * Routes for admin/moderator resolution of escalated queries.
 *
 * Routes:
 * GET  /api/admin/escalated - Get escalated queries
 * GET  /api/admin/query/:id - Get query details
 * POST /api/admin/approve - Approve peer response
 * POST /api/admin/override - Admin override answer
 * POST /api/admin/create-faq - Create FAQ from query
 *
 * @module routes/adminRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  getEscalatedQueries,
  approvePeerResponse,
  overrideWithAdminResponse,
  getQueryDetails,
  createFAQFromQuery,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorizeRoles('admin', 'moderator'));

router.get('/escalated', getEscalatedQueries);
router.get('/query/:id', getQueryDetails);
router.post('/approve', approvePeerResponse);
router.post('/override', overrideWithAdminResponse);
router.post('/create-faq', createFAQFromQuery);

module.exports = router;