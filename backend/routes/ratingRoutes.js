/**
 * =============================================================================
 * QUERY.IN - RATING ROUTES
 * =============================================================================
 * Routes for intern rating of peer answers.
 *
 * Routes:
 * POST /api/ratings/:id - Rate a peer response (1-5 stars)
 * GET  /api/ratings/query/:id - Get ratings for a query
 *
 * @module routes/ratingRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { rateResponse, getResponseRatings } = require('../controllers/ratingController');

router.use(protect);

router.post('/:id', authorizeRoles('intern'), rateResponse);
router.get('/query/:id', authorizeRoles('intern'), getResponseRatings);

module.exports = router;