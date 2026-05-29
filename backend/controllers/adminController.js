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
const { createNotification } = require('./notificationController');

let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = null;
}

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

    let statusFilter = { is_locked: true, status: { $ne: 'Resolved' } };

    if (type === 'ambiguous') {
      statusFilter.status = 'Ambiguous';
    } else if (type === 'high' || type === 'low') {
      statusFilter.status = 'Peer Answered';
    }

    const queries = await Query.find(statusFilter)
      .populate('intern_id', 'email role')
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

    createNotification({
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

    createNotification({
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
      .populate('intern_id', 'email role')
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
    const { query_id } = req.body;

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

    res.status(200).json({
      success: true,
      message: 'FAQ creation endpoint - implement with FAQ model',
      query_text: query.query_text,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ',
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
};
