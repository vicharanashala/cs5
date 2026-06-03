/**
 * =============================================================================
 * QUERY.IN - RESOLUTION LOG MODEL
 * =============================================================================
 * Tracks every resolution event in the system for analytics.
 *
 * Resolution Types:
 * - auto_complete: User selected FAQ from auto-complete
 * - rag_resolved: User upvoted RAG answer
 * - llm_resolved: User upvoted LLM answer
 * - escalated: Query escalated to peer queue
 * - spam_blocked: Similar query in queue blocked
 * - cap_blocked: Query cap reached
 * - peer_approved: Admin approved peer response
 * - admin_override: Admin provided override response
 * - moderator_override: Moderator provided override response
 *
 * @model ResolutionLog
 */

const mongoose = require('mongoose');

const resolutionLogSchema = new mongoose.Schema({
  intern_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resolution_type: {
    type: String,
    enum: [
      'auto_complete',
      'rag_resolved',
      'rag_downvoted',
      'llm_resolved',
      'llm_downvoted',
      'escalated',
      'spam_blocked',
      'cap_blocked',
      'peer_approved',
      'admin_override',
      'moderator_override',
    ],
    required: true,
  },
  source: {
    type: String,
    enum: ['autocomplete', 'rag', 'llm', 'peer', 'admin', 'moderator'],
    default: null,
  },
  query_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query',
    default: null,
  },
  response_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    default: null,
  },
  faq_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ',
    default: null,
  },
  metadata: {
    model: String,
    category: String,
    match_confidence: Number,
    rating: Number,
  },
}, { timestamps: true });

resolutionLogSchema.index({ intern_id: 1 });
resolutionLogSchema.index({ resolution_type: 1 });
resolutionLogSchema.index({ createdAt: -1 });

const ResolutionLog = mongoose.model('ResolutionLog', resolutionLogSchema);

module.exports = ResolutionLog;