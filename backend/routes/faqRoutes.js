/**
 * =============================================================================
 * QUERY.IN - FAQ ROUTES
 * =============================================================================
 * Express router mounting FAQ controller endpoints.
 * Base path: /api/faqs
 *
 * Routes:
 * - GET /api/faqs - Fetch all FAQs (public or auth required based on middleware)
 * - POST /api/faqs - Create a new FAQ (admin only)
 * - GET /api/faqs/search?q= - Search FAQs by keyword
 *
 * @module routes/faqRoutes
 */

const express = require('express');
const router = express.Router();
const { getAllFAQs, createFAQ, searchFAQs } = require('../controllers/faqController');

router.get('/', getAllFAQs);
router.get('/search', searchFAQs);
router.post('/', createFAQ);

module.exports = router;