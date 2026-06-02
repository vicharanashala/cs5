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
const SimilarQueryInterest = require('../models/SimilarQueryInterest');
const Notification = require('../models/Notification');
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

    const myAnsweredQueryIds = await Response.find({ author_id: currentUserId }).distinct('query_id');

    const queries = await Query.find({
      status: { $in: ['Pending', 'Peer Answered'] },
      is_locked: false,
      intern_id: { $ne: currentUserId },
      _id: { $nin: myAnsweredQueryIds },
      ambiguous_marked_by: { $ne: currentUserId },
      skipped_by: { $ne: currentUserId },
    })
      .populate('intern_id', '_id email role warning_count')
      .sort({ createdAt: 1 })
      .limit(20);

    const filteredQueries = queries.filter((q) => {
      return q.responses.length < MAX_PEER_RESPONSES;
    });

    res.status(200).json({
      success: true,
      count: filteredQueries.length,
      data: filteredQueries,
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
      .populate('resolved_by', 'email role')
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
 * - Uses findOneAndUpdate with $expr condition to atomically check
 *   responses array length DURING the update, preventing race conditions
 *   where 2 interns submit simultaneously and bypass the capacity cap
 * - The condition `{ $expr: { $lt: [{ $size: "$responses" }, 5] } }` ensures
 *   that the update ONLY succeeds if responses.length < 5 at the moment
 *   the atomic update occurs in MongoDB
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

    if (query.status !== 'Pending' && query.status !== 'Peer Answered') {
      return res.status(400).json({
        success: false,
        error: `Query is no longer accepting responses. Current status: ${query.status}`,
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

    const response = new Response({
      query_id,
      author_id,
      response_text,
      peer_note,
      response_type: 'peer',
    });
    await response.save();

    const updatedQuery = await Query.findOneAndUpdate(
      {
        _id: query_id,
        status: { $in: ['Pending', 'Peer Answered'] },
        is_locked: false,
        $expr: { $lt: [{ $size: '$responses' }, MAX_PEER_RESPONSES] },
      },
      {
        $push: { responses: response._id },
        $set: { status: 'Peer Answered' },
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuery) {
      await Response.findByIdAndDelete(response._id);
      const currentQuery = await Query.findById(query_id);
      if (currentQuery && currentQuery.responses.length >= MAX_PEER_RESPONSES) {
        return res.status(400).json({
          success: false,
          error: `Maximum capacity reached (${MAX_PEER_RESPONSES} responses). This query cannot accept more peer answers.`,
          code: 'CAPACITY_CAP',
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Query is no longer accepting responses.',
      });
    }

    await createNotification({
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

    res.status(201).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        response,
        query_status: updatedQuery.status,
      },
    });
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
        error: 'Can only skip pending queries',
      });
    }

    if (query.intern_id.toString() === user_id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot skip your own query',
      });
    }

    if (query.skipped_by.map(id => id.toString()).includes(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'You have already skipped this query',
      });
    }

    await Query.findByIdAndUpdate(query_id, {
      $addToSet: { skipped_by: user_id },
    });

    res.status(200).json({
      success: true,
      message: 'Query skipped. It will not appear again.',
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
      await createNotification({
        recipient_id: query.intern_id,
        type: 'query_resolved',
        title: 'Query Marked Ambiguous',
        message: `Your query "${query.query_text.substring(0, 50)}${query.query_text.length > 50 ? '...' : ''}" was marked as unclear by 3 peers. Please rephrase and submit again.`,
        link_id: query._id,
        link_type: 'query',
        created_by: user_id,
      });

      if (getIO) {
        const io = getIO();
        io.to(`user:${query.intern_id.toString()}`).emit('query_resolved', {
          query_id: query._id,
          resolution_type: 'auto_ambiguous',
        });
      }

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

/**
 * getInternStats
 * --------------
 * Returns dashboard stats for an intern:
 * - activeQueries: Count of user's pending/peer-answered queries (not resolved/ambiguous)
 * - peerResponses: Count of user's submitted peer answers
 * - resolved: Count of user's queries that were resolved (peer_approved or admin_override)
 *
 * @async
 * @function getInternStats
 * @param {Object} req - Express request object (req.user.userId available via protect middleware)
 * @param {Object} res - Express response object
 */
const getInternStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const activeQueries = await Query.countDocuments({
      intern_id: userId,
      status: { $nin: ['Resolved', 'Ambiguous'] },
    });

    const peerResponses = await Response.countDocuments({
      author_id: userId,
      response_type: 'peer',
    });

    const resolved = await Query.countDocuments({
      intern_id: userId,
      status: 'Resolved',
    });

    res.status(200).json({
      success: true,
      data: {
        activeQueries,
        peerResponses,
        resolved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch intern stats',
      message: error.message,
    });
  }
};

/**
 * deleteEscalation
 * ---------------
 * Allows an intern to delete their own escalation.
 * Only the query author can delete their query.
 * Cannot delete queries that have been resolved, approved, or have approved responses.
 *
 * CLEANUP OPERATIONS (Cascading Deletion):
 * 1. Delete all Response documents for this query
 * 2. Delete all SimilarQueryInterest records referencing this query
 * 3. Delete all Notification records where link_id references this query
 * 4. Delete any shadow queries created for interested interns (they reference original_query_id interest tracking)
 * 5. Emit socket event to refresh UI for connected clients
 *
 * @async
 * @function deleteEscalation
 * @param {Object} req - Express request (params: query_id)
 * @param {Object} res - Express response
 */
const deleteEscalation = async (req, res) => {
  try {
    const { query_id } = req.params;
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

    if (query.intern_id.toString() !== user_id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own escalations',
      });
    }

    if (query.status === 'Resolved' || query.status === 'Ambiguous') {
      return res.status(400).json({
        success: false,
        error: `Cannot delete ${query.status.toLowerCase()} queries`,
      });
    }

    const hasApprovedResponse = await Response.findOne({
      query_id: query._id,
      approval: true,
    });

    if (hasApprovedResponse) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete queries with approved responses',
      });
    }

    await Query.findByIdAndDelete(query_id);

    await Response.deleteMany({ query_id: query._id });

    await SimilarQueryInterest.deleteMany({ original_query_id: query._id });

    await Notification.deleteMany({
      $or: [
        { link_id: query._id, link_type: 'query' },
        { link_id: query._id, link_type: null },
      ],
    });

    if (getIO) {
      const io = getIO();
      io.to(`user:${user_id}`).emit('escalation_deleted', {
        query_id: query._id,
      });
      io.to('room:admins').emit('escalation_deleted', {
        query_id: query._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Escalation deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete escalation',
      message: error.message,
    });
  }
};

module.exports = {
  getPeerQueue,
  getMyEscalations,
  getInternStats,
  submitAnswer,
  skipQuery,
  markAmbiguous,
  deleteEscalation,
};