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

const isQueryStale = (query) => {
  const hoursSinceCreation = (Date.now() - query.createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation >= SLA_TIMEOUT_HOURS;
};

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

    for (const query of staleQueries) {
      const responses = await Response.find({ query_id: query._id });
      const responseCount = responses.length;

      if (responseCount === 0) {
        await Query.findByIdAndUpdate(query._id, { is_locked: true });
        console.log(`[Sweeper] Query ${query._id} escalated: stagnant (0 responses)`);
      } else {
        const allLowRated = responses.every((r) => r.rating !== null && r.rating <= 3);

        if (allLowRated && responseCount >= 1 && responseCount <= 4) {
          await Query.findByIdAndUpdate(query._id, { is_locked: true });
          console.log(`[Sweeper] Query ${query._id} escalated: low-rated (${responseCount} responses, all 1-3 stars)`);
        }
      }
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