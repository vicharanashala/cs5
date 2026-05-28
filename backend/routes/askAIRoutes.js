/**
 * =============================================================================
 * QUERY.IN - ASK AI ROUTES
 * =============================================================================
 * Express router for Ask AI pipeline endpoints.
 * Base path: /api/ask
 *
 * Routes:
 * - GET  /api/ask/autocomplete - Live suggestion search (public)
 * - POST /api/ask - Full AI pipeline (intern authenticated)
 *
 * @module routes/askAIRoutes
 */

const express = require('express');
const router = express.Router();
const { autoComplete, askAI } = require('../controllers/askAIController');
const { protect } = require('../middleware/authMiddleware');

router.get('/autocomplete', autoComplete);
router.post('/', protect, askAI);

module.exports = router;