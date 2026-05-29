/**
 * =============================================================================
 * QUERY.IN - QUERY CONTROLLER
 * =============================================================================
 * Handles business logic for Query (escalation ticket) CRUD operations.
 * This is the core workflow controller managing the query lifecycle:
 * PENDING → PEER_ANSWERED → (AMBIGUOUS | HIGH_RATED_LOCKED | ESCALATED) → RESOLVED
 *
 * The submitQuery endpoint creates a new query after RAG/AI resolution fails.
 * The getAllQueries endpoint is used by admins/moderators to manage the queue.
 *
 * @module controllers/queryController
 */

const Query = require('../models/Query');
const NoFaq = require('../models/NoFaq');
const Response = require('../models/Response');

const MAX_UNRESOLVED_QUERIES = 5;

const similarityCheck = (str1, str2) => {
  const s1 = str1.toLowerCase().split(' ').filter(Boolean);
  const s2 = str2.toLowerCase().split(' ').filter(Boolean);
  const common = s1.filter(word => s2.includes(word));
  const avgLength = (s1.length + s2.length) / 2;
  return avgLength > 0 ? common.length / avgLength : 0;
};

/**
 * Submits a new query to the peer escalation queue.
 * Also logs the query to the no_faq collection for content gap tracking.
 *
 * @async
 * @function submitQuery
 * @param {Object} req - Express request object (body contains intern_id, query_text)
 * @param {Object} res - Express response object
 * @returns {JSON} The created Query document
 */
const submitQuery = async (req, res) => {
  try {
    const { intern_id, query_text } = req.body;

    if (!intern_id || !query_text) {
      return res.status(400).json({
        success: false,
        error: 'intern_id and query_text are required',
      });
    }

    const activeQueriesCount = await Query.countDocuments({
      intern_id,
      status: { $nin: ['Resolved', 'Ambiguous'] },
    });

    if (activeQueriesCount >= MAX_UNRESOLVED_QUERIES) {
      return res.status(429).json({
        success: false,
        error: `Escalation blocked: You already have ${MAX_UNRESOLVED_QUERIES} unresolved queries. Please wait for responses before submitting more.`,
        code: 'QUERY_CAP_REACHED',
      });
    }

    const similarQuery = await Query.findOne({
      query_text: { $regex: new RegExp(query_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      status: 'Pending',
    });

    if (similarQuery) {
      return res.status(429).json({
        success: false,
        error: 'A similar query is already in the peer queue. Please wait for that to be resolved.',
        code: 'SIMILAR_QUERY_EXISTS',
        similar_query_id: similarQuery._id,
      });
    }

    const newQuery = new Query({
      intern_id,
      query_text,
      status: 'Pending',
    });

    const savedQuery = await newQuery.save();

    const noFaqEntry = await NoFaq.findOne({ queryText: query_text });
    if (noFaqEntry) {
      noFaqEntry.occurrenceCount += 1;
      noFaqEntry.lastUpdatedDate = new Date();
      if (!noFaqEntry.impactedInterns.includes(intern_id)) {
        noFaqEntry.impactedInterns.push(intern_id);
      }
      await noFaqEntry.save();
    } else {
      await NoFaq.create({
        queryText: query_text,
        occurrenceCount: 1,
        impactedInterns: [intern_id],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Query submitted to peer escalation queue',
      data: savedQuery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while submitting query',
      message: error.message,
    });
  }
};

/**
 * Fetches all queries, optionally filtered by status.
 * Supports pagination via limit and skip query parameters.
 *
 * @async
 * @function getAllQueries
 * @param {Object} req - Express request object (query params: status, limit, skip)
 * @param {Object} res - Express response object
 * @returns {JSON} Array of Query documents
 */
const getAllQueries = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const queries = await Query.find(filter)
      .populate('intern_id', 'email role')
      .populate('responses')
      .populate('resolved_by', 'email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Query.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: queries.length,
      total,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching queries',
      message: error.message,
    });
  }
};

/**
 * Fetches a single query by ID with populated references.
 *
 * @async
 * @function getQueryById
 * @param {Object} req - Express request object (params: id)
 * @param {Object} res - Express response object
 * @returns {JSON} The Query document
 */
const getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('intern_id', 'email role')
      .populate('responses')
      .populate('resolved_by', 'email role');

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    res.status(200).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching query',
      message: error.message,
    });
  }
};

module.exports = { submitQuery, getAllQueries, getQueryById };