/**
 * =============================================================================
 * QUERY.IN - FAQ MODEL
 * =============================================================================
 * Represents the official Knowledge Base entries used for RAG-based semantic search.
 * Each FAQ has a clean question, answer, category, tags, and keywords for matching.
 *
 * The search_text field is indexed and used by the RAG service for fuzzy/vector matching.
 * The intent field captures the underlying user intent behind the question.
 * The related_questions array stores semantically similar question phrasings.
 * The escalate_if_uncertain flag signals the AI to escalate to peers if confidence is low.
 *
 * @model FAQ
 * @field {String} clean_question - Sanitized, canonical question text
 * @field {String} answer - Official answer content
 * @field {String} category - Classification category for the FAQ
 * @field {String[]} tags - Descriptive tags for filtering and discovery
 * @field {String[]} keywords - High-weight keywords for live auto-complete matching
 * @field {String} search_text - Indexed text field combining question + answer for RAG
 * @field {String} intent - Underlying user intent classification
 * @field {Number} priority - Ordering priority (higher = more important)
 * @field {String[]} related_questions - Alternate phrasings of the same question
 * @field {Boolean} escalate_if_uncertain - Flag for AI to escalate if match confidence is low
 */

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    clean_question: {
      type: String,
      required: [true, 'Clean question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
    search_text: {
      type: String,
      required: [true, 'Search text is required for RAG matching'],
    },
    intent: {
      type: String,
      trim: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    related_questions: {
      type: [String],
      default: [],
    },
    escalate_if_uncertain: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

faqSchema.index({ search_text: 'text' });
faqSchema.index({ keywords: 1 });
faqSchema.index({ category: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;