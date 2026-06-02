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
const SimilarQueryInterest = require('../models/SimilarQueryInterest');
const { trackNoFaqQuery, trackResolution, ResolutionType } = require('./analyticsController');
const { getGrokResponse } = require('../services/grokService');

let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = null;
}

const MAX_UNRESOLVED_QUERIES = 5;

const trackSimilarQueryInterest = async (similarQuery, intern_id, query_text) => {
  try {
    await SimilarQueryInterest.findOneAndUpdate(
      {
        original_query_id: similarQuery._id,
        interested_intern_id: intern_id,
      },
      {
        original_query_id: similarQuery._id,
        interested_intern_id: intern_id,
        query_text,
        notified: false,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Failed to track similar query interest:', error.message);
  }
};

const validateQuery = (text) => {
  const trimmed = text.trim();

  if (trimmed.length < 5) {
    return 'Please enter a more detailed question (at least 5 characters).';
  }

  if (trimmed.length > 1000) {
    return 'Query is too long. Please limit to 1000 characters.';
  }

  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  const totalChars = trimmed.replace(/\s/g, '').length;
  if (letterCount < 4) {
    return 'Please enter a valid question with actual words.';
  }

  const specialCharRatio = totalChars > 0 ? (totalChars - letterCount) / totalChars : 0;
  if (specialCharRatio > 0.3) {
    return 'Please enter a valid question without too many special characters.';
  }

  if (/^(.)\1{2,}$/.test(trimmed)) {
    return 'Please enter a valid question without repeated characters.';
  }

  if (!/[a-zA-Z]{3,}/.test(trimmed)) {
    return 'Please enter a valid question with at least 3 consecutive letters.';
  }

  const uniqueLetters = new Set(trimmed.toLowerCase().match(/[a-z]/g) || []);
  const requiredUnique = Math.min(6, Math.max(3, Math.floor(letterCount * 0.4)));
  if (uniqueLetters.size < requiredUnique) {
    return `Please enter a valid question with at least ${requiredUnique} different letters.`;
  }

  const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'how', 'why', 'who', 'what', 'when', 'where', 'which', 'their', 'there', 'have', 'has', 'been', 'will', 'this', 'that', 'with', 'would', 'from', 'they', 'them', 'than'];
  const lowerTrimmed = trimmed.toLowerCase();
  const hasCommonWord = commonWords.some(word => lowerTrimmed.includes(word));
  if (letterCount > 20 && !hasCommonWord && uniqueLetters.size < 8) {
    return 'Please enter a meaningful question.';
  }

  const sequentialCount = (trimmed.match(/(.)\1{1,}/g) || []).join('').length;
  if (sequentialCount > trimmed.length * 0.4) {
    return 'Please enter a valid question without repeated patterns.';
  }

  return null;
};

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

    const validationError = validateQuery(query);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError,
        code: 'INVALID_QUERY',
      });
    }

    const allFAQs = await FAQ.find({}).lean();

    if (action === 'autocomplete_select') {
      const faq = allFAQs.find((f) => f._id.toString() === req.body.faq_id);
      if (faq) {
        await trackResolution(intern_id, ResolutionType.AUTO_COMPLETE, { faq_id: faq._id, category: faq.category });
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
      await trackResolution(intern_id, ResolutionType.RAG_RESOLVED, { action: 'rag_upvote' });
      return res.status(200).json({
        success: true,
        resolution: 'resolved',
        message: 'Thank you for your feedback!',
      });
    }

    if (action === 'grok_upvote') {
      await trackResolution(intern_id, ResolutionType.LLM_RESOLVED, { action: 'grok_upvote' });
      return res.status(200).json({
        success: true,
        resolution: 'resolved',
        message: 'Thank you for your feedback!',
      });
    }

    if (action === 'rag_downvote') {
      const grokResult = await getGrokResponse(query, allFAQs);

      if (!grokResult.success) {
        const activeCount = await Query.countDocuments({
          intern_id,
          status: { $nin: ['Resolved', 'Ambiguous'] },
        });

        if (activeCount >= MAX_UNRESOLVED_QUERIES) {
          await trackResolution(intern_id, ResolutionType.CAP_BLOCKED, { query, cap: MAX_UNRESOLVED_QUERIES });
          return res.status(429).json({
            success: false,
            error: `Escalation blocked: You have ${MAX_UNRESOLVED_QUERIES} unresolved queries.`,
            code: 'QUERY_CAP_REACHED',
          });
        }

        const similarQuery = await Query.findOne({
          query_text: { $regex: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
          status: 'Pending',
        });

        if (similarQuery) {
          await trackSimilarQueryInterest(similarQuery, intern_id, query);
          await trackResolution(intern_id, ResolutionType.SPAM_BLOCKED, { query, similar_id: similarQuery._id });
          return res.status(429).json({
            success: false,
            error: 'Similar query already in peer queue. You will be notified when the existing query is resolved.',
            code: 'SIMILAR_QUERY_EXISTS',
          });
        }

        const newQuery = new Query({
          intern_id,
          query_text: query,
          status: 'Pending',
        });
        await newQuery.save();
        
        if (getIO) {
          const io = getIO();
          io.to('room:admins').emit('query_state_changed');
          io.to('room:moderators').emit('query_state_changed');
          io.emit('new_query_in_queue');
        }

        await trackNoFaqQuery(query, intern_id);
        await trackResolution(intern_id, ResolutionType.ESCALATED, { query_id: newQuery._id });

        return res.status(201).json({
          success: true,
          resolution: 'escalated',
          query_id: newQuery._id,
          message: 'AI service unavailable. Your query has been added to the peer escalation queue.',
        });
      }

      await trackResolution(intern_id, ResolutionType.LLM_RESOLVED, { model: grokResult.model, stage: grokResult.stage });

      return res.status(200).json({
        success: true,
        source: 'grok',
        resolution: 'pending_feedback',
        answer: grokResult.answer,
        message: 'Please upvote if satisfied, or downvote to escalate.',
      });
    }

    if (action === 'grok_downvote') {
      const activeCount = await Query.countDocuments({
        intern_id,
        status: { $nin: ['Resolved', 'Ambiguous'] },
      });

      if (activeCount >= MAX_UNRESOLVED_QUERIES) {
        await trackResolution(intern_id, ResolutionType.CAP_BLOCKED, { query, cap: MAX_UNRESOLVED_QUERIES });
        return res.status(429).json({
          success: false,
          error: `Escalation blocked: You have ${MAX_UNRESOLVED_QUERIES} unresolved queries.`,
          code: 'QUERY_CAP_REACHED',
        });
      }

      const similarQuery = await Query.findOne({
        query_text: { $regex: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        status: 'Pending',
      });

      if (similarQuery) {
        await trackSimilarQueryInterest(similarQuery, intern_id, query);
        await trackResolution(intern_id, ResolutionType.SPAM_BLOCKED, { query, similar_id: similarQuery._id });
        return res.status(429).json({
          success: false,
          error: 'Similar query already in peer queue. You will be notified when the existing query is resolved.',
          code: 'SIMILAR_QUERY_EXISTS',
        });
      }

      const newQuery = new Query({
        intern_id,
        query_text: query,
        status: 'Pending',
      });
      await newQuery.save();

      if (getIO) {
        const io = getIO();
        io.to('room:admins').emit('query_state_changed');
        io.to('room:moderators').emit('query_state_changed');
        io.emit('new_query_in_queue');
      }

      await trackNoFaqQuery(query, intern_id);
      await trackResolution(intern_id, ResolutionType.ESCALATED, { query_id: newQuery._id });

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
      const activeCount = await Query.countDocuments({
        intern_id,
        status: { $nin: ['Resolved', 'Ambiguous'] },
      });

      if (activeCount >= MAX_UNRESOLVED_QUERIES) {
        await trackResolution(intern_id, ResolutionType.CAP_BLOCKED, { query, cap: MAX_UNRESOLVED_QUERIES });
        return res.status(429).json({
          success: false,
          error: `Escalation blocked: You have ${MAX_UNRESOLVED_QUERIES} unresolved queries.`,
          code: 'QUERY_CAP_REACHED',
        });
      }

      const similarQuery = await Query.findOne({
        query_text: { $regex: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        status: 'Pending',
      });

      if (similarQuery) {
        await trackSimilarQueryInterest(similarQuery, intern_id, query);
        await trackResolution(intern_id, ResolutionType.SPAM_BLOCKED, { query, similar_id: similarQuery._id });
        return res.status(429).json({
          success: false,
          error: 'Similar query already in peer queue. You will be notified when the existing query is resolved.',
          code: 'SIMILAR_QUERY_EXISTS',
        });
      }

      const newQuery = new Query({
        intern_id,
        query_text: query,
        status: 'Pending',
      });
      await newQuery.save();

      if (getIO) {
        const io = getIO();
        io.to('room:admins').emit('query_state_changed');
        io.to('room:moderators').emit('query_state_changed');
        io.emit('new_query_in_queue');
      }

      await trackNoFaqQuery(query, intern_id);
      await trackResolution(intern_id, ResolutionType.ESCALATED, { query_id: newQuery._id });

      return res.status(201).json({
        success: true,
        resolution: 'escalated',
        query_id: newQuery._id,
        message: 'Your query has been added to the peer escalation queue.',
      });
    }

    await trackResolution(intern_id, ResolutionType.LLM_RESOLVED, { model: grokResult.model, stage: grokResult.stage });

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