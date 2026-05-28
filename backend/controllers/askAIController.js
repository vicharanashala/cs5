/**
 * =============================================================================
 * QUERY.IN - ASK AI CONTROLLER
 * =============================================================================
 * Handles the full "Ask AI" intelligence pipeline:
 *
 * Phase 0: Auto-complete suggestions (keyword matching on FAQ keywords)
 * Phase 1: RAG Database Search (semantic text search on FAQ collection)
 * Phase 2: Grok LLM Fallback (if RAG fails or user downvotes)
 * Phase 3: Peer Escalation (if Grok answer downvoted)
 *
 * @module controllers/askAIController
 */

const FAQ = require('../models/FAQ');
const Query = require('../models/Query');
const NoFaq = require('../models/NoFaq');
const { getGrokResponse } = require('../services/grokService');

/**
 * PHASE 0: Auto-Complete Endpoint
 * Searches FAQ keywords for live suggestions as user types.
 * Returns up to 5 matching FAQs based on keyword similarity.
 *
 * @async
 * @function autoComplete
 */
const autoComplete = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const allFAQs = await FAQ.find({})
      .select('clean_question answer category keywords search_text tags')
      .lean();

    const searchTerms = q.toLowerCase().split(' ').filter(Boolean);
    const matches = allFAQs
      .map((faq) => {
        const searchable = `${faq.clean_question} ${faq.search_text || ''} ${faq.tags?.join(' ') || ''} ${faq.keywords?.join(' ') || ''}`.toLowerCase();
        const matchCount = searchTerms.filter((term) => searchable.includes(term)).length;
        const matchScore = matchCount / searchTerms.length;
        return { faq, matchScore };
      })
      .filter((m) => m.matchScore > 0.3)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map((m) => m.faq);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Auto-complete search failed',
      message: error.message,
    });
  }
};

/**
 * PHASE 1 & 2: Full Ask AI Pipeline
 *
 * If matched in RAG → return answer for upvote/downvote
 * If no match OR downvoted → trigger Grok LLM
 * If Grok answered AND upvoted → log and end
 * If Grok downvoted → escalate to peer queue
 *
 * @async
 * @function askAI
 */
const askAI = async (req, res) => {
  try {
    const { query, intern_id, action } = req.body;

    if (!query || !intern_id) {
      return res.status(400).json({
        success: false,
        error: 'Query and intern_id are required',
      });
    }

    const allFAQs = await FAQ.find({}).lean();

    if (action === 'autocomplete_select') {
      const faq = allFAQs.find((f) => f._id.toString() === req.body.faq_id);
      if (faq) {
        return res.status(200).json({
          success: true,
          source: 'autocomplete',
          resolution: 'instant',
          answer: faq.answer,
          faq_id: faq._id,
          category: faq.category,
          message: 'Resolved via Auto-Complete',
        });
      }
    }

    if (action === 'rag_upvote') {
      return res.status(200).json({
        success: true,
        resolution: 'resolved',
        message: 'Thank you for your feedback!',
      });
    }

    if (action === 'rag_downvote' || action === 'grok_downvote') {
      const newQuery = new Query({
        intern_id,
        query_text: query,
        status: 'Pending',
      });
      await newQuery.save();

      await NoFaq.findOneAndUpdate(
        { queryText: query },
        {
          $inc: { occurrenceCount: 1 },
          $addToSet: { impactedInterns: intern_id },
          lastUpdatedDate: new Date(),
        },
        { upsert: true, new: true }
      );

      return res.status(201).json({
        success: true,
        resolution: 'escalated',
        query_id: newQuery._id,
        message: 'Your query has been added to the peer escalation queue.',
      });
    }

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
    const ragMatches = allFAQs
      .map((faq) => {
        const searchable = `${faq.clean_question} ${faq.search_text} ${faq.tags?.join(' ') || ''}`.toLowerCase();
        const matchCount = searchTerms.filter((term) => searchable.includes(term)).length;
        const matchScore = matchCount / searchTerms.length;
        return { faq, matchScore };
      })
      .filter((m) => m.matchScore > 0.5)
      .sort((a, b) => b.matchScore - a.matchScore);

    if (ragMatches.length > 0) {
      const bestMatch = ragMatches[0].faq;
      return res.status(200).json({
        success: true,
        source: 'rag',
        resolution: 'pending_feedback',
        match_confidence: Math.round(ragMatches[0].matchScore * 100),
        answer: bestMatch.answer,
        faq_id: bestMatch._id,
        clean_question: bestMatch.clean_question,
        category: bestMatch.category,
        message: 'Please upvote if satisfied, or downvote to escalate.',
      });
    }

    const grokResult = await getGrokResponse(query, allFAQs);

    if (!grokResult.success) {
      return res.status(200).json({
        success: false,
        source: 'grok',
        resolution: 'failed',
        error: grokResult.error,
        stage: grokResult.stage,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'grok',
      resolution: 'pending_feedback',
      answer: grokResult.answer,
      message: 'Please upvote if satisfied, or downvote to escalate.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AI processing failed',
      message: error.message,
    });
  }
};

module.exports = { autoComplete, askAI };