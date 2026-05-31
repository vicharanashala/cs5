/**
 * =============================================================================
 * QUERY.IN - FAQ CONTROLLER
 * =============================================================================
 * Handles business logic for FAQ CRUD operations.
 * The getAllFAQs endpoint is used by the RAG service for semantic search.
 * The createFAQ endpoint is used by admins to expand the knowledge base.
 *
 * @module controllers/faqController
 */

const FAQ = require('../models/FAQ');
const { broadcastFAQAdded } = require('./notificationController');

/**
 * Fetches all FAQs from the database, ordered by priority descending.
 * Used for initial FAQ listing and RAG preprocessing.
 *
 * @async
 * @function getAllFAQs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Array of FAQ documents
 */
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({}).sort({ priority: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching FAQs',
      message: error.message,
    });
  }
};

/**
 * Creates a new FAQ entry in the knowledge base.
 * Only accessible by Admin users (RBAC middleware enforces this).
 *
 * @async
 * @function createFAQ
 * @param {Object} req - Express request object (body contains FAQ data)
 * @param {Object} res - Express response object
 * @returns {JSON} The created FAQ document
 */
const createFAQ = async (req, res) => {
  try {
    const { clean_question, answer, category, tags, keywords, search_text, intent, priority, related_questions, escalate_if_uncertain } = req.body;

    const faq = new FAQ({
      clean_question,
      answer,
      category,
      tags: tags || [],
      keywords: keywords || [],
      search_text: search_text || `${clean_question} ${answer}`,
      intent,
      priority: priority || 0,
      related_questions: related_questions || [],
      escalate_if_uncertain: escalate_if_uncertain || false,
    });

    const savedFAQ = await faq.save();

    await broadcastFAQAdded(savedFAQ, req.user.userId);

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: savedFAQ,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while creating FAQ',
      message: error.message,
    });
  }
};

/**
 * Searches FAQs using text matching on keywords and search_text fields.
 * Used for live auto-complete and keyword-based FAQ matching.
 *
 * @async
 * @function searchFAQs
 * @param {Object} req - Express request object (query contains search term)
 * @param {Object} res - Express response object
 * @returns {JSON} Array of matching FAQ documents
 */
const searchFAQs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const faqs = await FAQ.find({
      $or: [
        { keywords: { $regex: q, $options: 'i' } },
        { clean_question: { $regex: q, $options: 'i' } },
        { search_text: { $regex: q, $options: 'i' } },
      ],
    }).sort({ priority: -1 });

    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while searching FAQs',
      message: error.message,
    });
  }
};

/**
 * Updates an existing FAQ entry.
 * Only accessible by Admin users.
 *
 * @async
 * @function updateFAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { clean_question, answer, category, tags, keywords, search_text, intent, priority, related_questions, escalate_if_uncertain } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      id,
      {
        clean_question,
        answer,
        category,
        tags: tags || [],
        keywords: keywords || [],
        search_text: search_text || `${clean_question} ${answer}`,
        intent,
        priority: priority || 0,
        related_questions: related_questions || [],
        escalate_if_uncertain: escalate_if_uncertain || false,
      },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while updating FAQ',
      message: error.message,
    });
  }
};

/**
 * Deletes an FAQ entry.
 * Only accessible by Admin users.
 *
 * @async
 * @function deleteFAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting FAQ',
      message: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await FAQ.distinct('category');
    res.status(200).json({ success: true, data: categories.sort() });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching categories',
      message: error.message,
    });
  }
};

module.exports = { getAllFAQs, createFAQ, searchFAQs, updateFAQ, deleteFAQ, getCategories };