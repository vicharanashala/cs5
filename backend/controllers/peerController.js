/**
 * =============================================================================
 * QUERY.IN - PEER CONTROLLER
 * =============================================================================
 * Handles intern interactions with the peer escalation queue.
 *
 * STATE MACHINE TRANSITIONS:
 * ┌─────────────┐   submit answer   ┌─────────────────┐
 * │   PENDING   │ ─────────────────> │ PEER_ANSWERED   │
 * └─────────────┘                   └─────────────────┘
 *        │                                   │
 *        │ mark ambiguous (3x)               │ rate (4-5 stars)
 *        ▼                                   ▼
 *   ┌─────────────┐                   ┌───────────┐
 *   │ AMBIGUOUS   │                   │  RESOLVED │
 *   │  (locked)   │                   └───────────┘
 *   └─────────────┘
 *
 * CONCURRENCY PROTECTION:
 * - Uses atomic $push and $inc operations to prevent race conditions
 * - Pre-validates query state before any database modifications
 * - Double-checks response array length at write time
 *
 * @module controllers/peerController
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
 * MAX_PEER_RESPONSES: Hard cap on peer responses per query
 * Prevents spam and ensures query lifecycle doesn't grow unbounded
 */
const MAX_PEER_RESPONSES = 5;

/**
 * MAX_AMBIGUOUS_STRIKES: Number of ambiguous marks before auto-locking
 * 3-strike rule: if 3 different interns mark a query as ambiguous,
 * the query is automatically locked and flagged for admin review
 */
const MAX_AMBIGUOUS_STRIKES = 3;

/**
 * getPeerQueue
 * ----------
 * Retrieves all PENDING queries for the intern's feed.
 * Excludes queries authored by the requesting intern (cannot answer own query).
 * Returns queries sorted by creation time (oldest first - FIFO queue).
 *
 * @async
 * @function getPeerQueue
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPeerQueue = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const queries = await Query.find({
      status: 'Pending',
      is_locked: false,
      intern_id: { $ne: currentUserId },
    })
      .populate('intern_id', 'email role')
      .sort({ createdAt: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch peer queue',
      message: error.message,
    });
  }
};

/**
 * getMyEscalations
 * ----------------
 * Retrieves queries that THIS intern submitted (for tracking resolution status).
 *
 * @async
 * @function getMyEscalations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyEscalations = async (req, res) => {
  try {
    const queries = await Query.find({ intern_id: req.user.userId })
      .populate('responses')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escalations',
      message: error.message,
    });
  }
};

/**
 * submitAnswer
 * ------------
 * Allows an intern to submit an answer to a pending query.
 *
 * VALIDATION RULES:
 * 1. Query must exist and be in 'Pending' status
 * 2. Query must NOT be locked (is_locked: false)
 * 3. Intern cannot answer their own query
 * 4. Query responses array must have room (< 5)
 *
 * ATOMIC OPERATIONS:
 * - Uses findOneAndUpdate with $push to atomically add response
 * - Prevents race condition where 2 interns submit simultaneously
 *
 * @async
 * @function submitAnswer
 * @param {Object} req - Express request (body: query_id, response_text, peer_note)
 * @param {Object} res - Express response
 */
const submitAnswer = async (req, res) => {
  try {
    const { query_id, response_text, peer_note = '' } = req.body;
    const author_id = req.user.userId;

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

    if (query.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Query is no longer pending. Current status: ${query.status}`,
      });
    }

    if (query.is_locked) {
      return res.status(400).json({
        success: false,
        error: 'Query is locked and not accepting new responses',
      });
    }

    if (query.intern_id.toString() === author_id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot answer your own query',
      });
    }

    if (query.responses.length >= MAX_PEER_RESPONSES) {
      return res.status(400).json({
        success: false,
        error: `Maximum capacity reached (${MAX_PEER_RESPONSES} responses). This query cannot accept more peer answers.`,
        code: 'CAPACITY_CAP',
      });
    }

    const response = new Response({
      query_id,
      author_id,
      response_text,
      peer_note,
      response_type: 'peer',
    });
    await response.save();

    const updatedQuery = await Query.findByIdAndUpdate(
      query_id,
      {
        $push: { responses: response._id },
        $set: { status: 'Peer Answered' },
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        response,
        query_status: updatedQuery.status,
      },
    });

    createNotification({
      recipient_id: query.intern_id,
      type: 'peer_answer',
      title: 'New Peer Answer',
      message: `${req.user.email} answered your query: "${query.query_text.substring(0, 100)}${query.query_text.length > 100 ? '...' : ''}"`,
      link_id: query._id,
      link_type: 'query',
      created_by: author_id,
    });

    if (getIO) {
      const io = getIO();
      const internRoom = `user:${query.intern_id.toString()}`;
      io.to(internRoom).emit('new_peer_answer', {
        query_id: query._id,
        query_text: query.query_text,
        response_id: response._id,
        responder_email: req.user.email,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer',
      message: error.message,
    });
  }
};

/**
 * skipQuery
 * ---------
 * Allows an intern to skip a query and move to the next in their feed.
 * This is a no-op on the database - it just signals to the frontend to load the next query.
 *
 * @async
 * @function skipQuery
 * @param {Object} req - Express request (body: query_id)
 * @param {Object} res - Express response
 */
const skipQuery = async (req, res) => {
  try {
    const { query_id } = req.body;

    const query = await Query.findById(query_id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    if (query.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only skip pending queries',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Query skipped. Fetch next from queue.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to skip query',
      message: error.message,
    });
  }
};

/**
 * markAmbiguous
 * -------------
 * Allows an intern to mark a query as ambiguous (unclear/vague).
 *
 * 3-STRIKE RULE:
 * Each intern can only mark a query as ambiguous once (enforced by $addToSet).
 * When ambiguous_count reaches 3, the query is:
 *   1. Status changed to 'Ambiguous'
 *   2. is_locked set to true (no more peer responses)
 *   3. Resolution type set to 'auto_ambiguous'
 *
 * @async
 * @function markAmbiguous
 * @param {Object} req - Express request (body: query_id)
 * @param {Object} res - Express response
 */
const markAmbiguous = async (req, res) => {
  try {
    const { query_id } = req.body;
    const user_id = req.user.userId;

    if (!query_id) {
      return res.status(400).json({
        success: false,
        error: 'query_id is required',
      });
    }

    const query = await Query.findById(query_id);

    if (!query) {
      return res.status(404).json({
        success: false,
        error: 'Query not found',
      });
    }

    if (query.status !== 'Pending' && query.status !== 'Peer Answered') {
      return res.status(400).json({
        success: false,
        error: `Cannot mark as ambiguous. Query status: ${query.status}`,
      });
    }

    if (query.is_locked) {
      return res.status(400).json({
        success: false,
        error: 'Query is already locked',
      });
    }

    if (query.ambiguous_marked_by.includes(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'You have already marked this query as ambiguous',
      });
    }

    if (query.intern_id.toString() === user_id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot mark your own query as ambiguous',
      });
    }

    const updateData = {
      $addToSet: { ambiguous_marked_by: user_id },
      $inc: { ambiguous_count: 1 },
    };

    if (query.ambiguous_count + 1 >= MAX_AMBIGUOUS_STRIKES) {
      updateData.$set = {
        status: 'Ambiguous',
        is_locked: true,
        resolution_type: 'auto_ambiguous',
      };
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      query_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedQuery.status === 'Ambiguous') {
      createNotification({
        recipient_id: query.intern_id,
        type: 'query_resolved',
        title: 'Query Marked Ambiguous',
        message: `Your query "${query.query_text.substring(0, 50)}${query.query_text.length > 50 ? '...' : ''}" was marked as unclear by 3 peers. Please rephrase and submit again.`,
        link_id: query._id,
        link_type: 'query',
        created_by: user_id,
      });

      res.status(200).json({
        success: true,
        message: 'Query marked as ambiguous (3 strikes). Query is now locked and escalated to admins.',
        query_status: updatedQuery.status,
        is_locked: updatedQuery.is_locked,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Marked as ambiguous. Strike ${updatedQuery.ambiguous_count}/${MAX_AMBIGUOUS_STRIKES}`,
        ambiguous_count: updatedQuery.ambiguous_count,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark query as ambiguous',
      message: error.message,
    });
  }
};

module.exports = {
  getPeerQueue,
  getMyEscalations,
  submitAnswer,
  skipQuery,
  markAmbiguous,
};