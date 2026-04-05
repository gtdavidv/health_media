const express = require('express');
const pool = require('../db');
const { adminAuthCheck } = require('../middleware/adminAuth');
const router = express.Router();

// GET / — return current guardrails (public, no auth)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT content, updated_at FROM guardrails WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Guardrails not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching guardrails:', error);
    res.status(500).json({ error: 'Failed to fetch guardrails' });
  }
});

// PUT / — update guardrails (admin auth required)
router.put('/', adminAuthCheck, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required and must be a non-empty string' });
    }

    const { rows } = await pool.query(
      'UPDATE guardrails SET content = $1, updated_at = NOW() WHERE id = 1 RETURNING *',
      [content.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Guardrails record not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating guardrails:', error);
    res.status(500).json({ error: 'Failed to update guardrails' });
  }
});

module.exports = router;
