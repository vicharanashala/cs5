/**
 * =============================================================================
 * QUERY.IN - FAQ ROUTES
 * =============================================================================
 * Express router mounting FAQ controller endpoints.
 * Base path: /api/faqs
 *
 * Routes:
 * - GET /api/faqs - Fetch all FAQs (public)
 * - POST /api/faqs - Create a new FAQ (admin only)
 * - GET /api/faqs/search?q= - Search FAQs by keyword
 * - PUT /api/faqs/:id - Update FAQ (admin only)
 * - DELETE /api/faqs/:id - Delete FAQ (admin only)
 *
 * @module routes/faqRoutes
 */

const express = require('express');
const router = express.Router();
const { getAllFAQs, createFAQ, searchFAQs, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllFAQs);
router.get('/search', searchFAQs);
router.post('/', protect, authorizeRoles('admin'), createFAQ);
router.put('/:id', protect, authorizeRoles('admin'), updateFAQ);
router.delete('/:id', protect, authorizeRoles('admin'), deleteFAQ);

module.exports = router;