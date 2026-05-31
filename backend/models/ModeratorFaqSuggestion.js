/**
 * =============================================================================
 * QUERY.IN - MODERATOR FAQ SUGGESTION MODEL
 * =============================================================================
 * Tracks queries that moderators have suggested should be added to the FAQ database.
 * Admin can review these suggestions and create official FAQ entries.
 *
 * @model ModeratorFaqSuggestion
 * @field {ObjectId} query_id - Reference to the original Query
 * @field {ObjectId} suggested_by - Moderator who made the suggestion
 * @field {String} question_text - The query text that should become FAQ question
 * @field {String} suggested_answer - The approved response text that should become FAQ answer
 * @field {String} status - Enum: 'pending' | 'approved' | 'dismissed'
 */

const mongoose = require('mongoose');

const moderatorFaqSuggestionSchema = new mongoose.Schema(
  {
    query_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Query ID is required'],
      ref: 'Query',
    },
    suggested_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Suggested by is required'],
      ref: 'User',
    },
    question_text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    suggested_answer: {
      type: String,
      required: [true, 'Suggested answer is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'dismissed'],
        message: 'Status must be one of: pending, approved, dismissed',
      },
      default: 'pending',
    },
  },
  { timestamps: true }
);

moderatorFaqSuggestionSchema.index({ status: 1, createdAt: -1 });

const ModeratorFaqSuggestion = mongoose.model('ModeratorFaqSuggestion', moderatorFaqSuggestionSchema);

module.exports = ModeratorFaqSuggestion;