/**
 * =============================================================================
 * QUERY.IN - QUERY MODEL
 * =============================================================================
 * Represents the core escalation ticket in the Query.in workflow.
 * Created when an intern submits a question that could not be resolved by RAG/AI.
 * Moves through the state machine: PENDING → PEER_ANSWERED → RESOLVED/AMBIGUOUS.
 *
 * Relationships:
 * - intern_id: Reference to the User who created this query
 * - responses: Array of Response ObjectIds (max 5 peer responses, admin/mod responses not counted)
 * - resolved_by: Reference to the Admin/Mod who resolved it (nullable)
 * - ambiguous_marked_by: Array of User ObjectIds who marked this query as ambiguous
 *
 * State Machine:
 * - PENDING: Initial state after LLM downvote, awaiting peer answers
 * - PEER_ANSWERED: At least one peer has responded, intern is rating
 * - Ambiguous: Terminal state triggered by 3 peers marking as ambiguous
 * - Resolved: Terminal state after admin/mod approves a response or overrides
 *
 * @model Query
 * @field {ObjectId} intern_id - The intern who submitted this query
 * @field {String} query_text - The question text
 * @field {String} status - Enum: 'Pending' | 'Peer Answered' | 'Ambiguous' | 'Resolved'
 * @field {ObjectId[]} responses - Array of Response ObjectIds (max 5)
 * @field {Number} ambiguous_count - Number of peers who marked ambiguous (max 3)
 * @field {ObjectId[]} ambiguous_marked_by - Users who flagged this as ambiguous
 * @field {ObjectId} resolved_by - Admin/Mod who resolved (nullable)
 * @field {Date} resolved_at - Timestamp of resolution
 * @field {String} resolution_type - How it was resolved
 * @field {Boolean} is_locked - Locks the query from further peer responses
 */

const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    intern_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Intern ID is required'],
      ref: 'User',
    },
    query_text: {
      type: String,
      required: [true, 'Query text is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Peer Answered', 'Ambiguous', 'Resolved'],
        message: 'Status must be one of: Pending, Peer Answered, Ambiguous, Resolved',
      },
      default: 'Pending',
    },
    responses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Response',
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: 'A query can have a maximum of 5 peer responses',
      },
    },
    ambiguous_count: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    ambiguous_marked_by: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    resolution_type: {
      type: String,
      enum: {
        values: ['peer_approved', 'admin_override', 'moderator_override', 'auto_ambiguous'],
        message: 'Invalid resolution type',
      },
      default: null,
    },
    is_locked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

querySchema.index({ intern_id: 1 });
querySchema.index({ status: 1 });
querySchema.index({ createdAt: -1 });

const Query = mongoose.model('Query', querySchema);

module.exports = Query;