/**
 * =============================================================================
 * QUERY.IN - PEER ROUTES
 * =============================================================================
 * Routes for intern peer queue interactions.
 * All routes are protected (require authentication).
 *
 * Routes:
 * GET  /api/peer/queue        - Get pending queries for peer answering
 * GET  /api/peer/my-escalations - Get queries I submitted
 * POST /api/peer/answer       - Submit an answer to a query
 * POST /api/peer/skip         - Skip a query (no-op on DB)
 * POST /api/peer/ambiguous    - Mark a query as ambiguous (3-strike rule)
 *
 * @module routes/peerRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const {
  getPeerQueue,
  getMyEscalations,
  submitAnswer,
  skipQuery,
  markAmbiguous,
} = require('../controllers/peerController');

router.use(protect);

router.get('/queue', authorizeRoles('intern', 'moderator', 'admin'), getPeerQueue);
router.get('/my-escalations', authorizeRoles('intern'), getMyEscalations);
router.post('/answer', authorizeRoles('intern'), submitAnswer);
router.post('/skip', authorizeRoles('intern'), skipQuery);
router.post('/ambiguous', authorizeRoles('intern', 'moderator', 'admin'), markAmbiguous);

module.exports = router;