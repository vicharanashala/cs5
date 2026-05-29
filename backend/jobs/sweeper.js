/**
 * =============================================================================
 * QUERY.IN - 24-HOUR SWEEPER CRON JOB
 * =============================================================================
 * Background job that enforces SLA timeouts on pending queries.
 *
 * RUN FREQUENCY: Every 15 minutes
 *
 * SCENARIO A - PARTIAL LOW-RATED ANSWERS:
 * Query has 1-4 responses AND all responses have rating 1-3 stars.
 * -> is_locked = true
 * -> Escalates to Admin "Low-Rated Queue"
 *
 * SCENARIO B - STAGNANT / UNANSWERED:
 * Query has exactly 0 responses.
 * -> is_locked = true
 * -> Escalates to Admin "Stagnant Queue"
 *
 * ATOMIC OPERATIONS:
 * Uses updateMany for performance when sweeping large datasets.
 * Queries are filtered by status and age BEFORE update to minimize locks.
 *
 * @module jobs/sweeper
 */

const cron = require('node-cron');
const Query = require('../models/Query');
const Response = require('../models/Response');

const SWEEP_INTERVAL_MINUTES = 15;
const SLA_TIMEOUT_HOURS = 24;
const MAX_PEER_RESPONSES = 5;

const isQueryStale = (query) => {
  const hoursSinceCreation = (Date.now() - query.createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation >= SLA_TIMEOUT_HOURS;
};

/**
 * runSweeper
 * ----------
 * Eliminates N+1 query problem by using MongoDB aggregation pipeline
 * to identify stagnant (0 responses) and low-rated (1-4 responses, all 1-3 stars)
 * queries in bulk, then uses updateMany to lock them simultaneously.
 *
 * PERFORMANCE:
 * - No for-loop with sequential queries
 * - Uses aggregation to JOIN responses and filter in a single pass
 * - Uses updateMany for O(1) bulk updates instead of O(N) individual updates
 *
 * @async
 * @function runSweeper
 */
const runSweeper = async () => {
  try {
    const staleThreshold = new Date(Date.now() - SLA_TIMEOUT_HOURS * 60 * 60 * 1000);

    const staleQueries = await Query.find({
      status: { $in: ['Pending', 'Peer Answered'] },
      is_locked: false,
      createdAt: { $lt: staleThreshold },
    }).select('_id responses status createdAt');

    if (staleQueries.length === 0) {
      return;
    }

    const queryIds = staleQueries.map((q) => q._id);

    const aggregationPipeline = [
      {
        $match: {
          query_id: { $in: queryIds },
        },
      },
      {
        $group: {
          _id: '$query_id',
          count: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
      {
        $lookup: {
          from: 'queries',
          localField: '_id',
          foreignField: '_id',
          as: 'query',
        },
      },
      {
        $unwind: '$query',
      },
      {
        $match: {
          $expr: { $lt: ['$count', MAX_PEER_RESPONSES] },
        },
      },
      {
        $project: {
          query_id: '$_id',
          responseCount: '$count',
          allLowRated: {
            $and: [
              { $gte: ['$count', 1] },
              {
                $allElementsTrue: {
                  $map: {
                    input: '$ratings',
                    as: 'r',
                    in: {
                      $and: [
                        { $ne: ['$$r', null] },
                        { $lte: ['$$r', 3] },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    ];

    const aggregatedResults = await Response.aggregate(aggregationPipeline);

    const stagnantQueryIds = staleQueries
      .filter((sq) => sq.responses.length === 0)
      .map((sq) => sq._id);

    const lowRatedQueryIds = aggregatedResults
      .filter((r) => r.responseCount >= 1 && r.responseCount < MAX_PEER_RESPONSES && r.allLowRated)
      .map((r) => r.query_id);

    const allIdsToLock = [...new Set([...stagnantQueryIds, ...lowRatedQueryIds])];

    if (stagnantQueryIds.length > 0) {
      const stagnantResult = await Query.updateMany(
        { _id: { $in: stagnantQueryIds } },
        { $set: { is_locked: true } }
      );
      console.log(`[Sweeper] Stagnant queries locked: ${stagnantResult.modifiedCount}`);
    }

    if (lowRatedQueryIds.length > 0) {
      const lowRatedResult = await Query.updateMany(
        { _id: { $in: lowRatedQueryIds } },
        { $set: { is_locked: true } }
      );
      console.log(`[Sweeper] Low-rated queries locked: ${lowRatedResult.modifiedCount}`);
    }

    if (allIdsToLock.length > 0) {
      console.log(`[Sweeper] Total queries escalated: ${allIdsToLock.length}`);
    }
  } catch (error) {
    console.error('[Sweeper] Error running sweep:', error.message);
  }
};

const startSweeper = () => {
  const cronExpression = `*/${SWEEP_INTERVAL_MINUTES} * * * *`;
  cron.schedule(cronExpression, runSweeper);
  console.log(`[Sweeper] 24-hour SLA sweeper started (every ${SWEEP_INTERVAL_MINUTES} minutes)`);
};

module.exports = { startSweeper, runSweeper };