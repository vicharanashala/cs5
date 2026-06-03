/**
 * =============================================================================
 * QUERY.IN - ADMIN CONTROLLER
 * =============================================================================
 * Handles admin/moderator resolution of escalated queries.
 *
 * RESOLUTION PATHS:
 *
 * PATH 1: APPROVE PEER RESPONSE
 * Query is locked after peer answers with high rating.
 * Admin approves peer response as official answer.
 *
 * PATH 2: ADMIN OVERRIDE
 * Admin/Mod provides own official answer, bypassing peer answers.
 *
 * @module controllers/adminController
 */

const Query = require('../models/Query');
const Response = require('../models/Response');
const User = require('../models/User');
const ModeratorFaqSuggestion = require('../models/ModeratorFaqSuggestion');
const SimilarQueryInterest = require('../models/SimilarQueryInterest');
const { createNotification, warnIntern } = require('./notificationController');

let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = null;
}

const notifyInterestedInterns = async (resolvedQuery, approvedResponse, resolutionType, resolverId) => {
  try {
    const interestedInterns = await SimilarQueryInterest.find({
      original_query_id: resolvedQuery._id,
      notified: false,
    }).populate('interested_intern_id', 'email');

    for (const interest of interestedInterns) {
      const interestedIntern = interest.interested_intern_id;
      if (!interestedIntern) continue;

      await createNotification({
        recipient_id: interestedIntern._id,
        type: 'query_resolved',
        title: 'Similar Query Resolved',
        message: `The query you were interested in has been resolved. "${resolvedQuery.query_text.substring(0, 50)}${resolvedQuery.query_text.length > 50 ? '...' : ''}"`,
        link_id: resolvedQuery._id,
        link_type: 'query',
        created_by: resolverId,
      });

      if (getIO) {
        const io = getIO();
        io.to(`user:${interestedIntern._id.toString()}`).emit('query_resolved', {
          query_id: resolvedQuery._id,
          query_text: resolvedQuery.query_text,
          resolution_type: resolutionType,
          resolved_by: resolverId,
        });
      }

      const shadowQuery = new Query({
        intern_id: interestedIntern._id,
        query_text: interest.query_text,
        status: 'Resolved',
        responses: approvedResponse ? [approvedResponse._id] : [],
        resolved_by: resolverId,
        resolved_at: new Date(),
        resolution_type: resolutionType,
        is_locked: true,
      });
      await shadowQuery.save();

      interest.notified = true;
      await interest.save();
    }

    if (interestedInterns.length > 0) {
      console.log(`[Admin] Notified ${interestedInterns.length} interested interns about query ${resolvedQuery._id} resolution`);
    }
  } catch (error) {
    console.error('[Admin] Failed to notify interested interns:', error.message);
  }
};

/**
 * getEscalatedQueries
 * -------------------
 * Retrieves all escalated queries for admin review.
 * Escalated = is_locked: true AND status NOT 'Resolved'
 *
 * Two sub-queues:
 * - Highly-Rated Queue: Queries locked due to 4-5 star ratings
 * - Low-Rated Queue: Queries locked after 5 low-rated peer responses
 * - Ambiguous Queue: Queries auto-flagged by 3-strike rule
 *
 * @async
 * @function getEscalatedQueries
 * @param {Object} req - Express request (query: type = 'high' | 'low' | 'ambiguous' | 'all')
 * @param {Object} res - Express response
 */
const getEscalatedQueries = async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    let statusFilter = {};
    let isLockedFilter = {};

    if (type === 'all') {
      // Return all queries except pending (for Archive to work)
      statusFilter = {};
      isLockedFilter = {};
    } else if (type === 'ambiguous') {
      statusFilter.status = 'Ambiguous';
    } else if (type === 'high' || type === 'low') {
      statusFilter.status = 'Peer Answered';
    }

    const queries = await Query.find({
      ...statusFilter,
      ...isLockedFilter,
      ...(type !== 'all' ? { is_locked: true } : {}),
    })
      .populate('intern_id', '_id email role warning_count')
      .populate('resolved_by', 'email role')
      .populate('responses')
      .sort({ updatedAt: -1 });

    let filteredQueries = queries;
    if (type === 'high') {
      filteredQueries = queries.filter((q) => {
        return q.responses.some((r) => r.rating >= 4);
      });
    } else if (type === 'low') {
      filteredQueries = queries.filter((q) => {
        const hasLowRatings = q.responses.some((r) => r.rating && r.rating < 4);
        const allResponded = q.responses.length >= 5;
        return hasLowRatings && allResponded;
      });
    }

    res.status(200).json({
      success: true,
      count: filteredQueries.length,
      queue_type: type,
      data: filteredQueries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escalated queries',
      message: error.message,
    });
  }
};

/**
 * approvePeerResponse
 * -------------------
 * Admin/Mod approves a peer response as the official answer.
 *
 * ACTIONS:
 * 1. Mark Response.approval = true
 * 2. Update Query.status = 'Resolved'
 * 3. Set Query.resolved_by = admin's user ID
 * 4. Set Query.resolution_type = 'peer_approved'
 * 5. Set Query.resolved_at = now
 *
 * @async
 * @function approvePeerResponse
 * @param {Object} req - Express request (body: query_id, response_id)
 * @param {Object} res - Express response
 */
const approvePeerResponse = async (req, res) => {
  try {
    const { query_id, response_id } = req.body;
    const admin_id = req.user.userId;

    if (!query_id || !response_id) {
      return res.status(400).json({
        success: false,
        error: 'query_id and response_id are required',
      });
    }

    const query = await Query.findById(query_id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    if (query.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        error: 'Query is already resolved',
      });
    }

    const response = await Response.findById(response_id);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Response not found',
      });
    }

    if (response.query_id.toString() !== query_id) {
      return res.status(400).json({
        success: false,
        error: 'Response does not belong to this query',
      });
    }

    response.approval = true;
    await response.save();

    await Query.findByIdAndUpdate(query_id, {
      $set: {
        status: 'Resolved',
        resolved_by: admin_id,
        resolved_at: new Date(),
        resolution_type: 'peer_approved',
        is_locked: true,
      },
    });

    await createNotification({
      recipient_id: query.intern_id,
      type: 'query_resolved',
      title: 'Query Resolved',
      message: 'Your query has been resolved. A peer response was approved.',
      link_id: query._id,
      link_type: 'query',
      created_by: admin_id,
    });

    if (getIO) {
      const io = getIO();
      const internRoom = `user:${query.intern_id.toString()}`;
      io.to(internRoom).emit('query_resolved', {
        query_id: query._id,
        query_text: query.query_text,
        resolution_type: 'peer_approved',
        resolved_by: admin_id,
      });
    }

    await notifyInterestedInterns(query, response, 'peer_approved', admin_id);

    res.status(200).json({
      success: true,
      message: 'Peer response approved. Query resolved.',
      data: {
        query_id: query._id,
        response_id: response._id,
        resolution_type: 'peer_approved',
        resolved_by: admin_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to approve response',
      message: error.message,
    });
  }
};

/**
 * overrideWithAdminResponse
 * -------------------------
 * Admin/Mod provides their own official answer, bypassing peer answers.
 *
 * BYPASSES 5-RESPONSE CAP:
 * Admin responses are stored separately and do not count toward the peer cap.
 *
 * ACTIONS:
 * 1. Create new Response with response_type: 'admin'
 * 2. Update Query.status = 'Resolved'
 * 3. Set Query.resolved_by = admin's user ID
 * 4. Set Query.resolution_type = 'admin_override'
 * 5. Set Query.resolved_at = now
 *
 * @async
 * @function overrideWithAdminResponse
 * @param {Object} req - Express request (body: query_id, response_text)
 * @param {Object} res - Express response
 */
const overrideWithAdminResponse = async (req, res) => {
  try {
    const { query_id, response_text, peer_note = '' } = req.body;
    const admin_id = req.user.userId;

    if (!query_id || !response_text) {
      return res.status(400).json({
        success: false,
        error: 'query_id and response_text are required',
      });
    }

    const query = await Query.findById(query_id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    if (query.status === 'Resolved') {
      return res.status(400).json({
        success: false,
        error: 'Query is already resolved',
      });
    }

    const adminResponse = new Response({
      query_id,
      author_id: admin_id,
      response_text,
      peer_note,
      response_type: 'admin',
      approval: true,
    });
    await adminResponse.save();

    await Query.findByIdAndUpdate(query_id, {
      $push: { responses: adminResponse._id },
      $set: {
        status: 'Resolved',
        resolved_by: admin_id,
        resolved_at: new Date(),
        resolution_type: 'admin_override',
        is_locked: true,
      },
    });

    await createNotification({
      recipient_id: query.intern_id,
      type: 'query_resolved',
      title: 'Query Resolved',
      message: 'Your query has been resolved with an official response.',
      link_id: query._id,
      link_type: 'query',
      created_by: admin_id,
    });

    if (getIO) {
      const io = getIO();
      const internRoom = `user:${query.intern_id.toString()}`;
      io.to(internRoom).emit('query_resolved', {
        query_id: query._id,
        query_text: query.query_text,
        resolution_type: 'admin_override',
        resolved_by: admin_id,
      });
    }

    await notifyInterestedInterns(query, adminResponse, 'admin_override', admin_id);

    res.status(201).json({
      success: true,
      message: 'Admin override accepted. Query resolved.',
      data: {
        query_id: query._id,
        response_id: adminResponse._id,
        resolution_type: 'admin_override',
        resolved_by: admin_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create admin override',
      message: error.message,
    });
  }
};

/**
 * getQueryDetails
 * ---------------
 * Admin/Mod views full details of a query including all responses.
 *
 * @async
 * @function getQueryDetails
 * @param {Object} req - Express request (params: id = query_id)
 * @param {Object} res - Express response
 */
const getQueryDetails = async (req, res) => {
  try {
    const { id: query_id } = req.params;

    const query = await Query.findById(query_id)
      .populate('intern_id', '_id email role warning_count')
      .populate('resolved_by', 'email role');

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    const responses = await Response.find({ query_id })
      .populate('author_id', 'email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        query,
        responses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch query details',
      message: error.message,
    });
  }
};

/**
 * createFAQFromQuery
 * ------------------
 * Admin creates an official FAQ from a resolved query.
 * Extracts clean_question and answer to create new FAQ entry.
 *
 * @async
 * @function createFAQFromQuery
 * @param {Object} req - Express request (body: query_id)
 * @param {Object} res - Express response
 */
const createFAQFromQuery = async (req, res) => {
  try {
    const { query_id, category = 'General', tags = [], priority = 0 } = req.body;

    const query = await Query.findById(query_id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    if (query.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        error: 'Can only create FAQ from resolved queries',
      });
    }

    const responses = await Response.find({ query_id }).sort({ rating: -1, createdAt: 1 });
    let answerText = '';
    let response_author = null;

    const approvedResponse = responses.find((r) => r.approval === true);
    if (approvedResponse) {
      answerText = approvedResponse.response_text;
      response_author = approvedResponse.author_id;
    }

    if (!answerText) {
      return res.status(400).json({
        success: false,
        error: 'No approved response found to create FAQ from',
      });
    }

    const FAQ = require('../models/FAQ');
    const ModeratorFaqSuggestion = require('../models/ModeratorFaqSuggestion');
    const clean_question = query.query_text.trim();
    const search_text = `${clean_question} ${answerText}`;
    const keywords = tags.length > 0 ? tags : [];

    const newFAQ = new FAQ({
      clean_question,
      answer: answerText,
      category,
      tags,
      keywords,
      search_text,
      priority,
      related_questions: [],
      escalate_if_uncertain: false,
    });

    await newFAQ.save();

    await ModeratorFaqSuggestion.findOneAndUpdate(
      { query_id, status: 'pending' },
      { status: 'approved' },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully from query',
      data: {
        faq_id: newFAQ._id,
        clean_question: newFAQ.clean_question,
        category: newFAQ.category,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ',
      message: error.message,
    });
  }
};

/**
 * clearAllData
 * ------------
 * Admin clears all data except users and FAQs.
 * Clears: Query, Response, NoFaq, Notification collections.
 * Use for testing/reset purposes.
 *
 * @async
 * @function clearAllData
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const clearAllData = async (req, res) => {
  try {
    const Query = require('../models/Query');
    const Response = require('../models/Response');
    const NoFaq = require('../models/NoFaq');
    const Notification = require('../models/Notification');

    const queryCount = await Query.countDocuments();
    const responseCount = await Response.countDocuments();
    const noFaqCount = await NoFaq.countDocuments();
    const notificationCount = await Notification.countDocuments();

    await Response.deleteMany({});
    await Query.deleteMany({});
    await NoFaq.deleteMany({});
    await Notification.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'All data cleared (users and FAQs preserved)',
      data: {
        cleared: {
          queries: queryCount,
          responses: responseCount,
          no_faqs: noFaqCount,
          notifications: notificationCount,
        },
        preserved: ['users', 'faqs'],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear data',
      message: error.message,
    });
  }
};

const warnUser = async (req, res) => {
  try {
    const { intern_id, query_id, warning_message } = req.body;
    const admin_id = req.user.userId;

    if (!intern_id) {
      return res.status(400).json({
        success: false,
        error: 'intern_id is required',
      });
    }

    const intern = await User.findById(intern_id);
    if (!intern) {
      return res.status(404).json({
        success: false,
        error: 'Intern not found',
      });
    }

    if (intern.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot warn an admin',
      });
    }

    const nextWarning = await warnIntern(intern_id, warning_message, admin_id, query_id);

    intern.warning_count = nextWarning;
    await intern.save();

    if (nextWarning >= 5) {
      intern.is_disabled = true;
      await intern.save();

      await createNotification({
        recipient_id: intern_id,
        type: 'query_resolved',
        title: 'Account Disabled',
        message: 'Your account has been disabled due to repeated misuse of the system.',
        created_by: admin_id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Warning ${nextWarning} of 5 sent to ${intern.email}`,
      data: {
        warning_count: nextWarning,
        is_disabled: nextWarning >= 5,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send warning',
      message: error.message,
    });
  }
};

const getSpoiledUsers = async (req, res) => {
  try {
    const spoiledUsers = await User.find({
      warning_count: { $gt: 0 },
      role: 'intern',
    })
      .select('email warning_count is_disabled createdAt')
      .sort({ warning_count: -1 });

    res.status(200).json({
      success: true,
      count: spoiledUsers.length,
      data: spoiledUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch spoiled users',
      message: error.message,
    });
  }
};

const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    await Response.deleteMany({ query_id: id });

    await Query.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Query deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete query',
      message: error.message,
    });
  }
};

const suggestFaqFromQuery = async (req, res) => {
  try {
    const { query_id, suggested_answer } = req.body;
    const suggested_by = req.user.userId;

    if (!query_id || !suggested_answer) {
      return res.status(400).json({
        success: false,
        error: 'query_id and suggested_answer are required',
      });
    }

    const query = await Query.findById(query_id);
    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    const existingSuggestion = await ModeratorFaqSuggestion.findOne({
      query_id,
      status: 'pending',
    });

    if (existingSuggestion) {
      return res.status(400).json({
        success: false,
        error: 'A suggestion for this query is already pending review',
      });
    }

    const suggestion = new ModeratorFaqSuggestion({
      query_id,
      suggested_by,
      question_text: query.query_text,
      suggested_answer,
    });

    await suggestion.save();

    res.status(201).json({
      success: true,
      message: 'FAQ suggestion submitted for admin review',
      data: {
        suggestion_id: suggestion._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit FAQ suggestion',
      message: error.message,
    });
  }
};

const getModeratorSuggestions = async (req, res) => {
  try {
    const suggestions = await ModeratorFaqSuggestion.find({ status: 'pending' })
      .populate('suggested_by', 'email role')
      .populate('query_id', 'query_text intern_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderator suggestions',
      message: error.message,
    });
  }
};

const dismissModeratorSuggestion = async (req, res) => {
  try {
    const { id } = req.params;

    const suggestion = await ModeratorFaqSuggestion.findByIdAndUpdate(
      id,
      { status: 'dismissed' },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found',
      });
    }

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

module.exports = {
  getEscalatedQueries,
  approvePeerResponse,
  overrideWithAdminResponse,
  getQueryDetails,
  createFAQFromQuery,
  clearAllData,
  warnUser,
  getSpoiledUsers,
  deleteQuery,
  suggestFaqFromQuery,
  getModeratorSuggestions,
  dismissModeratorSuggestion,
};
