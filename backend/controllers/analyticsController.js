/**
 * =============================================================================
 * QUERY.IN - ANALYTICS CONTROLLER
 * =============================================================================
 * Tracks content gaps (unanswered queries) and provides analytics data.
 *
 * ANALYTICS TRACKING:
 * - ResolutionLog: Tracks every AI interaction (RAG up/downvotes, LLM up/downvotes)
 * - Query/Response: Source of truth for peer resolution stats
 *
 * ANALYTICS DASHBOARD METRICS:
 * - AI Performance: RAG vs LLM helpfulness ratios
 * - Bottleneck Analysis: Pending vs Resolved counts
 * - Human Intervention Index: Admin/Mod overrides vs peer resolutions
 *
 * @module controllers/analyticsController
 */

const NoFaq = require('../models/NoFaq');
const FAQ = require('../models/FAQ');
const ResolutionLog = require('../models/ResolutionLog');
const Query = require('../models/Query');
const Response = require('../models/Response');

const PROMOTION_THRESHOLD = 10;

let emitAdminYellowAlert;
try {
  emitAdminYellowAlert = require('./notificationController').emitAdminYellowAlert;
} catch (e) {
  emitAdminYellowAlert = null;
}

const ResolutionType = {
  AUTO_COMPLETE: 'auto_complete',
  RAG_RESOLVED: 'rag_resolved',
  RAG_DOWNVOTED: 'rag_downvoted',
  LLM_RESOLVED: 'llm_resolved',
  LLM_DOWNVOTED: 'llm_downvoted',
  ESCALATED: 'escalated',
  SPAM_BLOCKED: 'spam_blocked',
  CAP_BLOCKED: 'cap_blocked',
  PEER_APPROVED: 'peer_approved',
  ADMIN_OVERRIDE: 'admin_override',
  MODERATOR_OVERRIDE: 'moderator_override',
};

/**
 * trackResolution
 * Logs a resolution event to ResolutionLog collection.
 */
const trackResolution = async (intern_id, resolutionType, metadata = {}) => {
  try {
    const logEntry = await ResolutionLog.create({
      intern_id,
      resolution_type: resolutionType,
      metadata,
    });
    console.log(`[ANALYTICS] intern:${intern_id} | ${resolutionType} | metadata:${JSON.stringify(metadata)}`);
    return logEntry;
  } catch (error) {
    console.error('[ANALYTICS] Failed to track resolution:', error.message);
  }
};

const trackNoFaqQuery = async (queryText, intern_id) => {
  const existing = await NoFaq.findOne({ queryText });

  if (!existing) {
    const newNoFaq = await NoFaq.create({
      queryText,
      occurrenceCount: 1,
      impactedInterns: [intern_id],
      firstLoggedDate: new Date(),
      lastUpdatedDate: new Date(),
    });
    if (emitAdminYellowAlert && newNoFaq.occurrenceCount >= PROMOTION_THRESHOLD) {
      emitAdminYellowAlert(newNoFaq);
    }
  } else {
    const alreadyImpacted = existing.impactedInterns.some(
      (id) => id.toString() === intern_id
    );

    if (!alreadyImpacted) {
      existing.impactedInterns.push(intern_id);
      existing.occurrenceCount += 1;
      existing.lastUpdatedDate = new Date();
      await existing.save();
      if (emitAdminYellowAlert && existing.occurrenceCount === PROMOTION_THRESHOLD) {
        emitAdminYellowAlert(existing);
      }
    }
  }
};

/**
 * getDashboardAnalytics
 * Returns comprehensive analytics for admin dashboard.
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      resolutionLogs,
      allQueries,
      allQueriesWithResolver,
      ragUpvotes,
      ragDownvotes,
      llmUpvotes,
      llmDownvotes,
    ] = await Promise.all([
      ResolutionLog.find({ createdAt: { $gte: thirtyDaysAgo } }).lean(),
      Query.find({}).lean(),
      Query.find({ resolution_type: 'peer_approved' }).populate('resolved_by', 'role').lean(),
      ResolutionLog.countDocuments({ resolution_type: 'rag_resolved' }),
      ResolutionLog.countDocuments({ resolution_type: 'rag_downvoted' }),
      ResolutionLog.countDocuments({ resolution_type: 'llm_resolved' }),
      ResolutionLog.countDocuments({ resolution_type: 'llm_downvoted' }),
    ]);

    const pendingCount = allQueries.filter(q =>
      q.status === 'Pending' || q.status === 'Peer Answered'
    ).length;

    const resolvedCount = allQueries.filter(q => q.status === 'Resolved').length;

    const peerApprovedAdmin = allQueriesWithResolver.filter(q =>
      q.resolved_by && q.resolved_by.role === 'admin'
    ).length;

    const peerApprovedModerator = allQueriesWithResolver.filter(q =>
      q.resolved_by && q.resolved_by.role === 'moderator'
    ).length;

    const adminOverrideCount = allQueries.filter(q =>
      q.resolution_type === 'admin_override'
    ).length;

    const moderatorOverrideCount = allQueries.filter(q =>
      q.resolution_type === 'moderator_override'
    ).length;

    const ragTotal = ragUpvotes + ragDownvotes;
    const llmTotal = llmUpvotes + llmDownvotes;
    const ragHelpfulness = ragTotal > 0 ? (ragUpvotes / ragTotal * 100).toFixed(1) : 0;
    const llmHelpfulness = llmTotal > 0 ? (llmUpvotes / llmTotal * 100).toFixed(1) : 0;

    const humanInterventionCount = adminOverrideCount + moderatorOverrideCount;
    const peerResolvedCount = peerApprovedAdmin + peerApprovedModerator;
    const totalResolutions = peerResolvedCount + humanInterventionCount;
    const humanInterventionIndex = totalResolutions > 0
      ? (humanInterventionCount / totalResolutions * 100).toFixed(1)
      : 0;

    const resolutionByDay = {};
    resolutionLogs.forEach(log => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!resolutionByDay[date]) {
        resolutionByDay[date] = {
          auto_complete: 0,
          rag_resolved: 0,
          llm_resolved: 0,
          escalated: 0,
          peer_approved: 0,
          admin_override: 0,
          moderator_override: 0,
        };
      }
      if (resolutionByDay[date][log.resolution_type] !== undefined) {
        resolutionByDay[date][log.resolution_type]++;
      }
    });

    const dailyTrends = Object.entries(resolutionByDay)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    const resolutionDistribution = {
      autoComplete: ragUpvotes > 0 ? ragUpvotes : 0,
      ragResolved: ragUpvotes,
      llmResolved: llmUpvotes,
      peerAnsweredAdmin: peerApprovedAdmin,
      peerAnsweredModerator: peerApprovedModerator,
      adminOverride: adminOverrideCount,
      moderatorOverride: moderatorOverrideCount,
    };

    res.status(200).json({
      success: true,
      data: {
        aiPerformance: {
          ragUpvotes,
          ragDownvotes,
          ragTotal,
          ragHelpfulness: parseFloat(ragHelpfulness),
          llmUpvotes,
          llmDownvotes,
          llmTotal,
          llmHelpfulness: parseFloat(llmHelpfulness),
        },
        bottleneckAnalysis: {
          pendingCount,
          resolvedCount,
          totalQueries: allQueries.length,
          resolutionRate: allQueries.length > 0
            ? ((resolvedCount / allQueries.length) * 100).toFixed(1)
            : 0,
        },
        humanIntervention: {
          adminOverrideCount,
          moderatorOverrideCount,
          totalHumanInterventions: humanInterventionCount,
          humanInterventionIndex: parseFloat(humanInterventionIndex),
        },
        peerPerformance: {
          peerApprovedAdmin,
          peerApprovedModerator,
          totalPeerResolved: peerResolvedCount,
        },
        resolutionDistribution,
        dailyTrends,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message,
    });
  }
};

/**
 * getFaqSuggestions
 * Returns NoFaq records where occurrenceCount >= 10.
 */
const getFaqSuggestions = async (req, res) => {
  try {
    const suggestions = await NoFaq.find({
      occurrenceCount: { $gte: PROMOTION_THRESHOLD },
    })
      .populate('impactedInterns', 'email')
      .sort({ occurrenceCount: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      threshold: PROMOTION_THRESHOLD,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQ suggestions',
      message: error.message,
    });
  }
};

/**
 * dismissFaqSuggestion
 * Admin can dismiss a suggestion.
 */
const dismissFaqSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    await NoFaq.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Suggestion dismissed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss suggestion',
      message: error.message,
    });
  }
};

/**
 * createFaqFromSuggestion
 * Converts a NoFaq suggestion into an actual FAQ.
 */
const createFaqFromSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { clean_question, answer, category, keywords, tags } = req.body;

    const noFaq = await NoFaq.findById(id);
    if (!noFaq) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found',
      });
    }

    const search_text = `${clean_question} ${answer} ${tags?.join(' ') || ''} ${keywords?.join(' ') || ''}`;

    const faq = await FAQ.create({
      clean_question,
      answer,
      category: category || 'General',
      keywords: keywords || [],
      tags: tags || [],
      search_text,
      priority: 0,
    });

    await NoFaq.findByIdAndDelete(id);

    res.status(201).json({
      success: true,
      message: 'FAQ created from suggestion',
      data: faq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ from suggestion',
      message: error.message,
    });
  }
};

/**
 * getAllNoFaqQueries
 * Admin view of all content gaps.
 */
const getAllNoFaqQueries = async (req, res) => {
  try {
    const queries = await NoFaq.find({})
      .populate('impactedInterns', 'email')
      .sort({ occurrenceCount: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch no_faq queries',
      message: error.message,
    });
  }
};

/**
 * getNoFaqStats
 * Returns analytics summary for the dashboard.
 */
const getNoFaqStats = async (req, res) => {
  try {
    const total = await NoFaq.countDocuments();
    const promoted = await NoFaq.countDocuments({
      occurrenceCount: { $gte: PROMOTION_THRESHOLD },
    });
    const avgOccurrences = await NoFaq.aggregate([
      { $group: { _id: null, avg: { $avg: '$occurrenceCount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_content_gaps: total,
        suggestions_ready: promoted,
        promotion_threshold: PROMOTION_THRESHOLD,
        average_occurrences: avgOccurrences[0]?.avg || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message,
    });
  }
};

module.exports = {
  trackNoFaqQuery,
  trackResolution,
  getDashboardAnalytics,
  getFaqSuggestions,
  dismissFaqSuggestion,
  createFaqFromSuggestion,
  getAllNoFaqQueries,
  getNoFaqStats,
  PROMOTION_THRESHOLD,
  ResolutionType,
};