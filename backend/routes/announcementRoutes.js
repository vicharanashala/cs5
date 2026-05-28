/**
 * =============================================================================
 * QUERY.IN - ANNOUNCEMENT ROUTES
 * =============================================================================
 *
 * Routes:
 * GET  /api/announcements - Get all announcements (public/protected)
 * POST /api/announcements - Create announcement (admin only)
 *
 * @module routes/announcementRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { getAllAnnouncements, createAnnouncement } = require('../controllers/announcementController');

router.get('/', getAllAnnouncements);
router.post('/', protect, authorizeRoles('admin'), createAnnouncement);

module.exports = router;