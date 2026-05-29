/**
 * =============================================================================
 * QUERY.IN - RESPONSE MODEL
 * =============================================================================
 * Represents a peer, moderator, or admin response to a Query escalation ticket.
 * Responses are attached to a Query via query_id and authored by a User.
 *
 * The peer_note field is optional and only visible to admins/moderators.
 * The rating field is set by the intern who submitted the original query (1-5 stars).
 * The approval field marks whether an admin/moderator has verified this response.
 *
 * @model Response
 * @field {ObjectId} query_id - Reference to the parent Query
 * @field {ObjectId} author_id - Reference to the responding User
 * @field {String} response_text - The actual answer content
 * @field {String} peer_note - Optional private note visible only to admins/mods
 * @field {String} response_type - Enum: 'peer' | 'moderator' | 'admin'
 * @field {Boolean} approval - Whether this response is officially approved
 * @field {Number} rating - Star rating (1-5) given by the intern query author
 */

const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    query_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Query ID is required'],
      ref: 'Query',
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Author ID is required'],
      ref: 'User',
    },
    response_text: {
      type: String,
      required: [true, 'Response text is required'],
    },
    peer_note: {
      type: String,
      default: '',
    },
    response_type: {
      type: String,
      enum: {
        values: ['peer', 'moderator', 'admin'],
        message: 'Response type must be: peer, moderator, or admin',
      },
      default: 'peer',
    },
    approval: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },
    rater_note: {
      type: String,
      default: '',
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

responseSchema.index({ query_id: 1 });
responseSchema.index({ author_id: 1 });

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;