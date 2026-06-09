/** NOTE: This feature has been removed from the project but the file still remains so if we found a better way to implement in we can
 * =============================================================================
 * QUERY.IN - NOFAQ MODEL (Content Gap Tracking)
 * =============================================================================
 * Tracks queries that could not be matched to any existing FAQ.
 * When occurrenceCount reaches >= 10, it triggers an Admin alert to create a new FAQ.
 * This collection is read-heavy and used by the AI FAQ Suggestion Engine (Milestone 8).
 *
 * The impactedInterns array prevents metric inflation from the same intern
 * generating multiple no_faq entries for the same unanswered question.
 *
 * @model NoFaq
 * @field {String} queryText - The unmatched query text (unique to prevent duplicates)
 * @field {Number} occurrenceCount - Number of times this query was hit (alerts at >= 10)
 * @field {ObjectId[]} impactedInterns - Distinct interns who encountered this gap
 * @field {Date} firstLoggedDate - When this gap was first logged
 * @field {Date} lastUpdatedDate - Most recent occurrence
 */

const mongoose = require('mongoose');

const noFaqSchema = new mongoose.Schema(
  {
    queryText: {
      type: String,
      required: [true, 'Query text is required'],
      unique: true,
      trim: true,
    },
    occurrenceCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    impactedInterns: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    firstLoggedDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

noFaqSchema.index({ occurrenceCount: -1 });
noFaqSchema.index({ queryText: 'text' });

const NoFaq = mongoose.model('NoFaq', noFaqSchema);

module.exports = NoFaq;