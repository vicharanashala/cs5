/**
 * =============================================================================
 * QUERY.IN - SIMILAR QUERY INTEREST MODEL
 * =============================================================================
 * Tracks when an intern tries to submit a query similar to one already in the
 * peer queue. When the original query is resolved by an admin, all interested
 * interns are notified and the resolution is added to their My Escalations page.
 *
 * Flow:
 * 1. Intern A submits query similar to Intern B's pending query
 * 2. System blocks submission, saves interest in SimilarQueryInterest
 * 3. Admin resolves Intern B's query
 * 4. All interested interns are notified with the resolution
 * 5. Shadow Query created for each interested intern (appears in their My Escalations)
 *
 * @model SimilarQueryInterest
 * @field {ObjectId} original_query_id - The query that Intern B submitted
 * @field {ObjectId} interested_intern_id - Intern A who tried to submit similar query
 * @field {String} query_text - The text Intern A tried to submit
 * @field {Boolean} notified - Whether intern has been notified of resolution
 * @field {Date} createdAt - When the interest was recorded
 */

const mongoose = require('mongoose');

const similarQueryInterestSchema = new mongoose.Schema(
  {
    original_query_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Query',
      required: [true, 'Original query ID is required'],
    },
    interested_intern_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interested intern ID is required'],
    },
    query_text: {
      type: String,
      required: [true, 'Query text is required'],
      trim: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

similarQueryInterestSchema.index({ original_query_id: 1, interested_intern_id: 1 }, { unique: true });
similarQueryInterestSchema.index({ interested_intern_id: 1 });
similarQueryInterestSchema.index({ notified: 1 });

const SimilarQueryInterest = mongoose.model('SimilarQueryInterest', similarQueryInterestSchema);

module.exports = SimilarQueryInterest;