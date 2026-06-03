/**
 * =============================================================================
 * QUERY.IN - ANALYTICS ROUTES
 * =============================================================================
 * Routes for AI FAQ Suggestion Engine, content gap analytics, and dashboard.
 *
 * Routes:
 * GET  /api/analytics/dashboard           - Get all analytics for admin dashboard
 * GET  /api/analytics/faq-suggestions     - Get suggestions (>= 10 occurrences)
 * GET  /api/analytics/no-faq              - Get all no_faq records
 * GET  /api/analytics/stats               - Get no-faq stats summary
 * DELETE /api/analytics/suggestions/:id   - Dismiss a suggestion
 * POST  /api/analytics/create-faq         - Create FAQ from suggestion
 *
 * @module routes/analyticsRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  getDashboardAnalytics,
  getFaqSuggestions,
  getAllNoFaqQueries,
  getNoFaqStats,
  dismissFaqSuggestion,
  createFaqFromSuggestion,
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/dashboard', authorizeRoles('admin'), getDashboardAnalytics);
router.get('/faq-suggestions', authorizeRoles('admin', 'moderator'), getFaqSuggestions);
router.get('/no-faq', authorizeRoles('admin', 'moderator'), getAllNoFaqQueries);
router.get('/stats', authorizeRoles('admin', 'moderator'), getNoFaqStats);
router.delete('/suggestions/:id', authorizeRoles('admin'), dismissFaqSuggestion);
router.post('/create-faq', authorizeRoles('admin'), createFaqFromSuggestion);

module.exports = router;