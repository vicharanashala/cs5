/**
 * =============================================================================
 * QUERY.IN - QUERY ROUTES
 * =============================================================================
 * Express router mounting Query controller endpoints.
 * Base path: /api/queries
 *
 * Routes:
 * - GET /api/queries - Fetch all queries (filtered by status if provided)
 * - GET /api/queries/:id - Fetch a single query by ID
 * - POST /api/queries - Submit a new query to the peer queue
 *
 * @module routes/queryRoutes
 */

const express = require('express');
const router = express.Router();
const { submitQuery, getAllQueries, getQueryById } = require('../controllers/queryController');

router.get('/', getAllQueries);
router.get('/:id', getQueryById);
router.post('/', submitQuery);

module.exports = router;