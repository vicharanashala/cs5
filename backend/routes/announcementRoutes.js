/**
 * =============================================================================
 * QUERY.IN - ANNOUNCEMENT ROUTES
 * =============================================================================
 *
 * Routes:
 * GET    /api/announcements        - Get all announcements (public/protected)
 * POST   /api/announcements        - Create announcement (admin only)
 * PUT    /api/announcements/:id    - Update announcement (admin only)
 * DELETE /api/announcements/:id    - Delete announcement (admin only)
 *
 * @module routes/announcementRoutes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');
const { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.get('/', getAllAnnouncements);
router.post('/', protect, authorizeRoles('admin'), createAnnouncement);
router.put('/:id', protect, authorizeRoles('admin'), updateAnnouncement);
router.delete('/:id', protect, authorizeRoles('admin'), deleteAnnouncement);

module.exports = router;