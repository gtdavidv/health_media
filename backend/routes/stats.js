const express = require('express');
const { adminAuthCheck } = require('../middleware/adminAuth');
const pool = require('../db');
const router = express.Router();

// GET /api/admin/stats — aggregate analytics (protected)
router.get('/', adminAuthCheck, async (req, res) => {
  try {
    const [
      totalsResult,
      viewsLast7Result,
      chatsLast7Result,
      topArticlesResult,
      viewsByDayResult,
      chatsByDayResult,
    ] = await Promise.all([
      // Aggregate totals
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM page_views)::int                  AS total_page_views,
          (SELECT COUNT(*) FROM chat_events)::int                 AS total_chat_events,
          (SELECT COALESCE(SUM(message_count), 0) FROM chat_events)::int AS total_chat_messages
      `),
      // Page views in last 7 days
      pool.query(`
        SELECT COUNT(*)::int AS views_last_7_days
        FROM page_views
        WHERE viewed_at >= NOW() - INTERVAL '7 days'
      `),
      // Chat events in last 7 days
      pool.query(`
        SELECT COUNT(*)::int AS chats_last_7_days
        FROM chat_events
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `),
      // Top 10 articles by view count in last 30 days
      pool.query(`
        SELECT slug, COUNT(*)::int AS count
        FROM page_views
        WHERE viewed_at >= NOW() - INTERVAL '30 days'
        GROUP BY slug
        ORDER BY count DESC
        LIMIT 10
      `),
      // Views per day for last 14 days
      pool.query(`
        SELECT
          DATE(viewed_at AT TIME ZONE 'UTC') AS date,
          COUNT(*)::int AS count
        FROM page_views
        WHERE viewed_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE(viewed_at AT TIME ZONE 'UTC')
        ORDER BY date ASC
      `),
      // Chats per day for last 14 days
      pool.query(`
        SELECT
          DATE(created_at AT TIME ZONE 'UTC') AS date,
          COUNT(*)::int AS count
        FROM chat_events
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE(created_at AT TIME ZONE 'UTC')
        ORDER BY date ASC
      `),
    ]);

    const totals = totalsResult.rows[0];

    res.json({
      total_page_views:    totals.total_page_views,
      total_chat_events:   totals.total_chat_events,
      total_chat_messages: totals.total_chat_messages,
      views_last_7_days:   viewsLast7Result.rows[0].views_last_7_days,
      chats_last_7_days:   chatsLast7Result.rows[0].chats_last_7_days,
      top_articles:        topArticlesResult.rows,
      views_by_day:        viewsByDayResult.rows,
      chats_by_day:        chatsByDayResult.rows,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
