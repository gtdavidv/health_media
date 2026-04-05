const express = require('express');
const { adminAuthCheck } = require('../middleware/adminAuth');
const pool = require('../db');
const pgvector = require('pgvector/pg');
const vectorService = require('../services/chromaService');
const router = express.Router();

// List all studies
router.get('/', adminAuthCheck, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, url, LEFT(content, 200) AS excerpt, created_at
       FROM studies ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({ error: 'Failed to fetch studies' });
  }
});

// Add a study
router.post('/', adminAuthCheck, async (req, res) => {
  try {
    const { content, title, url } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const emb = await vectorService.embedder;
    const embedding = await emb.embedQuery(content.trim());

    const result = await pool.query(
      `INSERT INTO studies (content, title, url, embedding)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, url, LEFT(content, 200) AS excerpt, created_at`,
      [content.trim(), title?.trim() || null, url?.trim() || null, pgvector.toSql(embedding)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding study:', error);
    res.status(500).json({ error: 'Failed to add study' });
  }
});

// Delete a study
router.delete('/:id', adminAuthCheck, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM studies WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Study not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting study:', error);
    res.status(500).json({ error: 'Failed to delete study' });
  }
});

module.exports = router;
