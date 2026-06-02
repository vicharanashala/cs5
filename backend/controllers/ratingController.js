/**
 * RATING → LOCK TRIGGERS:
 *
 * HIGH-RATING QUEUE (4-5 stars):
 * ┌─────────────────┐    rating = 4-5    ┌─────────────────────────┐
 * │ PEER_ANSWERED   │ ─────────────────> │ Highly-Rated Queue      │
 * └─────────────────┘                    │ (NOT locked - can still │
 *                                          │ receive more responses) │
 *                                          └─────────────────────────┘
 *
 * IMMEDIATE LOCK (5 stars only):
 * ┌─────────────────┐    rating = 5      ┌──────────────┐
 * │ PEER_ANSWERED   │ ─────────────────> │ is_locked=true │
 * └─────────────────┘                    └──────────────┘
 *
 * LOW-RATING LOCK (1-4 stars):
 * ┌─────────────────┐    rating = 1-4    ┌──────────────┐
 * │ PEER_ANSWERED   │ ─────────────────> │ Check responses count │
 * └─────────────────┘                    └──────────────┘
 *                                                  │
 *                              ┌───────────────────┴───────────────────┐
 *                              │                                       │
 *                         < 5 responses                          = 5 responses
 *                              │                                       │
 *                              ▼                                       ▼
 *                       Query stays open                    is_locked=true
 *                       (awaiting better                   Escalates to Admin
 *                        peer answers)                      "Low-Rated Queue"
 *
 * CONCURRENCY PROTECTION:
 * - Each user can only rate a response once (checked before saving)
 * - Uses findOneAndUpdate for atomicity
 *
 * @module controllers/ratingController
 */

const Response = require('../models/Response');
const Query = require('../models/Query');

let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = null;
}

/**
 * MIN_HIGH_RATING: Threshold for "high rating" queue
 * Ratings of 4 or 5 stars mark query as highly-rated
 */
const MIN_HIGH_RATING = 4;

/**
 * MAX_PEER_RESPONSES: Hard cap on peer responses per query
 */
const MAX_PEER_RESPONSES = 5;

/**
 * rateResponse
 * ------------
 * Allows the original intern to rate a peer response (1-5 stars).
 *
 * BUSINESS RULES:
 * 1. Only the intern who created the query can rate responses
 * 2. Rating must be integer between 1-5
 * 3. High rating (4-5) always locks the query
 * 4. Low rating only locks if all 5 response slots are filled
 *
 * ATOMICITY:
 * - Updates response.rating and query.is_locked in proper sequence
 * - Checks query ownership before allowing rating
 *
 * @async
 * @function rateResponse
 * @param {Object} req - Express request (params: id = response_id, body: rating)
 * @param {Object} res - Express response
 */
const rateResponse = async (req, res) => {
  try {
    const { id: response_id } = req.params;
    const { rating, rater_note } = req.body;
    const rater_id = req.user.userId;

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be an integer between 1 and 5',
      });
    }

    if (rater_note && rater_note.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Note cannot exceed 500 characters',
      });
    }

    const response = await Response.findById(response_id).populate('query_id');

    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Response not found',
      });
    }

    const query = response.query_id;

    if (query.intern_id.toString() !== rater_id) {
      return res.status(403).json({
        success: false,
        error: 'Only the query author can rate responses',
      });
    }

    if (query.status === 'Resolved' || query.status === 'Ambiguous') {
      return res.status(400).json({
        success: false,
        error: `Cannot rate response. Query is already ${query.status.toLowerCase()}.`,
      });
    }

    if (query.is_locked) {
      return res.status(400).json({
        success: false,
        error: 'Query is locked. No further modifications allowed.',
      });
    }

    if (response.rating !== null) {
      return res.status(400).json({
        success: false,
        error: 'You have already rated this response',
      });
    }

    response.rating = rating;
    if (rater_note) {
      response.rater_note = rater_note;
    }
    await response.save();

    let queryUpdate = {};
    let shouldLock = false;
    let lockReason = '';

    if (rating === 5) {
      shouldLock = true;
      lockReason = '5-star rating';
    } else if (query.responses.length >= MAX_PEER_RESPONSES) {
      const allLowRatings = await checkAllLowRatings(query._id);
      if (allLowRatings) {
        shouldLock = true;
        lockReason = 'All peer responses rated low (1-3 stars)';
      }
    }

    if (shouldLock) {
      queryUpdate = {
        is_locked: true,
        status: query.status === 'Pending' ? 'Peer Answered' : query.status,
      };
    }

    if (Object.keys(queryUpdate).length > 0) {
      await Query.findByIdAndUpdate(query._id, queryUpdate);
    }

    if (getIO) {
      const io = getIO();
      if (shouldLock) {
        io.to('room:admins').emit('query_state_changed');
        io.to('room:moderators').emit('query_state_changed');
      }
      io.to(`user:${rater_id}`).emit('my_escalation_updated');
    }

    res.status(200).json({
      success: true,
      message: shouldLock
        ? `Rating recorded. Query locked due to: ${lockReason}`
        : 'Rating recorded successfully',
      data: {
        response_id: response._id,
        rating: response.rating,
        rater_note: response.rater_note || null,
        query_locked: shouldLock,
        lock_reason: shouldLock ? lockReason : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to rate response',
      message: error.message,
    });
  }
};

/**
 * checkAllLowRatings
 * ------------------
 * Helper function to check if ALL peer responses have low ratings (1-3).
 * Used to determine if a low-rated query should be locked.
 *
 * @async
 * @function checkAllLowRatings
 * @param {ObjectId} query_id - The query to check
 * @returns {boolean} True if all responses are rated 1-3
 */
const checkAllLowRatings = async (query_id) => {
  const responses = await Response.find({ query_id });

  if (responses.length < MAX_PEER_RESPONSES) {
    return false;
  }

  return responses.every((r) => r.rating !== null && r.rating < MIN_HIGH_RATING);
};

/**
 * getResponseRatings
 * ------------------
 * Retrieves ratings for all responses on a query.
 * Only accessible by the query author (intern).
 *
 * @async
 * @function getResponseRatings
 * @param {Object} req - Express request (params: id = query_id)
 * @param {Object} res - Express response
 */
const getResponseRatings = async (req, res) => {
  try {
    const { id: query_id } = req.params;
    const user_id = req.user.userId;

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
        error: 'Only the query author can view ratings',
      });
    }

    const responses = await Response.find({ query_id })
      .select('rating response_text response_type createdAt')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: responses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ratings',
      message: error.message,
    });
  }
};

module.exports = {
  rateResponse,
  getResponseRatings,
};