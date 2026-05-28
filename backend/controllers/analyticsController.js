/**
 * =============================================================================
 * QUERY.IN - ANALYTICS CONTROLLER (AI FAQ Suggestion Engine)
 * =============================================================================
 * Tracks content gaps (unanswered queries) and triggers FAQ creation suggestions.
 *
 * CONTENT GAP TRACKING LOGIC:
 *
 * When LLM fails to answer a query, this engine tracks it in the NoFaq collection.
 *
 * CONDITION 1 - NEW CONTENT GAP:
 *   - queryText does not exist in NoFaq collection
 *   - Create new record with occurrenceCount = 1
 *   - Add intern's _id to impactedInterns array
 *
 * CONDITION 2 - EXISTING CONTENT GAP:
 *   - queryText already exists in NoFaq collection
 *   - Check if intern's _id is NOT in impactedInterns (prevents inflation)
 *   - If NOT present: push intern's _id to array AND increment occurrenceCount by 1
 *   - If ALREADY present: do nothing (same user, same gap = no double counting)
 *
 * ANTI-INFLATION MECHANISM:
 * The impactedInterns array ensures that a single intern cannot artificially
 * inflate the occurrenceCount by submitting the same query multiple times.
 * Each intern can only contribute +1 to the count, regardless of how many
 * times THEY personally hit the same content gap.
 *
 * 10-OCCURRENCE THRESHOLD:
 * When occurrenceCount >= 10, the gap is considered significant enough
 * to warrant creating a new FAQ. These are returned via GET /api/admin/faq-suggestions.
 *
 * @module controllers/analyticsController
 */

const NoFaq = require('../models/NoFaq');
const FAQ = require('../models/FAQ');

/**
 * PROMOTION_THRESHOLD: Minimum occurrences before suggesting FAQ creation
 */
const PROMOTION_THRESHOLD = 10;

/**
 * trackNoFaqQuery
 * ---------------
 * Called by the LLM fallback pipeline when it cannot answer a query.
 * Updates or creates a NoFaq record with proper anti-inflation logic.
 *
 * @async
 * @function trackNoFaqQuery
 * @param {string} queryText - The unanswered query text
 * @param {string} intern_id - The intern's user ID
 */
const trackNoFaqQuery = async (queryText, intern_id) => {
  const existing = await NoFaq.findOne({ queryText });

  if (!existing) {
    await NoFaq.create({
      queryText,
      occurrenceCount: 1,
      impactedInterns: [intern_id],
      firstLoggedDate: new Date(),
      lastUpdatedDate: new Date(),
    });
  } else {
    const alreadyImpacted = existing.impactedInterns.some(
      (id) => id.toString() === intern_id
    );

    if (!alreadyImpacted) {
      existing.impactedInterns.push(intern_id);
      existing.occurrenceCount += 1;
      existing.lastUpdatedDate = new Date();
      await existing.save();
    }
  }
};

/**
 * getFaqSuggestions
 * -----------------
 * Returns NoFaq records where occurrenceCount >= 10.
 * These represent significant content gaps that warrant FAQ creation.
 *
 * @async
 * @function getFaqSuggestions
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getFaqSuggestions = async (req, res) => {
  try {
    const suggestions = await NoFaq.find({
      occurrenceCount: { $gte: PROMOTION_THRESHOLD },
    })
      .populate('impactedInterns', 'email')
      .sort({ occurrenceCount: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      threshold: PROMOTION_THRESHOLD,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQ suggestions',
      message: error.message,
    });
  }
};

/**
 * dismissFaqSuggestion
 * --------------------
 * Admin can dismiss a suggestion (e.g., after creating FAQ manually).
 * This removes it from the suggestions list without deleting the record.
 *
 * @async
 * @function dismissFaqSuggestion
 * @param {Object} req - Express request (params: id)
 * @param {Object} res - Express response
 */
const dismissFaqSuggestion = async (req, res) => {
  try {
    const { id } = req.params;

    await NoFaq.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Suggestion dismissed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss suggestion',
      message: error.message,
    });
  }
};

/**
 * createFaqFromSuggestion
 * -----------------------
 * Converts a NoFaq suggestion into an actual FAQ.
 * Pre-populates the FAQ fields with the suggestion data.
 *
 * @async
 * @function createFaqFromSuggestion
 * @param {Object} req - Express request (params: id)
 * @param {Object} res - Express response
 */
const createFaqFromSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { clean_question, answer, category, keywords, tags } = req.body;

    const noFaq = await NoFaq.findById(id);

    if (!noFaq) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found',
      });
    }

    const search_text = `${clean_question} ${answer} ${tags?.join(' ') || ''} ${keywords?.join(' ') || ''}`;

    const faq = await FAQ.create({
      clean_question,
      answer,
      category: category || 'General',
      keywords: keywords || [],
      tags: tags || [],
      search_text,
      priority: 0,
    });

    await NoFaq.findByIdAndDelete(id);

    res.status(201).json({
      success: true,
      message: 'FAQ created from suggestion',
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ from suggestion',
      message: error.message,
    });
  }
};

/**
 * getAllNoFaqQueries
 * ------------------
 * Admin view of all content gaps (not just >= 10 occurrences).
 *
 * @async
 * @function getAllNoFaqQueries
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllNoFaqQueries = async (req, res) => {
  try {
    const queries = await NoFaq.find({})
      .populate('impactedInterns', 'email')
      .sort({ occurrenceCount: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch no_faq queries',
      message: error.message,
    });
  }
};

/**
 * getNoFaqStats
 * -------------
 * Returns analytics summary for the dashboard.
 *
 * @async
 * @function getNoFaqStats
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getNoFaqStats = async (req, res) => {
  try {
    const total = await NoFaq.countDocuments();
    const promoted = await NoFaq.countDocuments({
      occurrenceCount: { $gte: PROMOTION_THRESHOLD },
    });
    const avgOccurrences = await NoFaq.aggregate([
      { $group: { _id: null, avg: { $avg: '$occurrenceCount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_content_gaps: total,
        suggestions_ready: promoted,
        promotion_threshold: PROMOTION_THRESHOLD,
        average_occurrences: avgOccurrences[0]?.avg || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message,
    });
  }
};

module.exports = {
  trackNoFaqQuery,
  getFaqSuggestions,
  dismissFaqSuggestion,
  createFaqFromSuggestion,
  getAllNoFaqQueries,
  getNoFaqStats,
  PROMOTION_THRESHOLD,
};