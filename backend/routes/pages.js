const express = require('express');
const router = express.Router();
const pool = require('../db');
const { adminAuthCheck } = require('../middleware/adminAuth');

// GET /api/pages/nav — public, returns in-nav pages (slug + title only)
router.get('/nav', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT slug, title FROM pages WHERE in_nav = true ORDER BY title ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching nav pages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pages/home — public, returns the home page or null
router.get('/home', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pages WHERE is_home = true LIMIT 1'
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching home page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pages — admin, full list with all fields except content
router.get('/', adminAuthCheck, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT slug, title, in_nav, is_home, created_at, updated_at FROM pages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pages/:slug — public, full page
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM pages WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pages — admin, create page
router.post('/', adminAuthCheck, async (req, res) => {
  try {
    const { slug, title, content, in_nav = false, is_home = false } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({ error: 'slug, title, and content are required' });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Slug may only contain lowercase letters, numbers, and hyphens' });
    }

    // If this page is home, unset any existing home page first
    if (is_home) {
      await pool.query('UPDATE pages SET is_home = false WHERE is_home = true');
    }

    const result = await pool.query(
      `INSERT INTO pages (slug, title, content, in_nav, is_home)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [slug, title, content, in_nav, is_home]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A page with this slug already exists' });
    }
    console.error('Error creating page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/pages/:slug — admin, update page
router.put('/:slug', adminAuthCheck, async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, in_nav, is_home } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    // If this page is being set as home, unset others first
    if (is_home) {
      await pool.query('UPDATE pages SET is_home = false WHERE is_home = true AND slug != $1', [slug]);
    }

    const result = await pool.query(
      `UPDATE pages
       SET title = $1, content = $2, in_nav = $3, is_home = $4, updated_at = NOW()
       WHERE slug = $5
       RETURNING *`,
      [title, content, in_nav ?? false, is_home ?? false, slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/pages/:slug — admin
router.delete('/:slug', adminAuthCheck, async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('DELETE FROM pages WHERE slug = $1 RETURNING slug', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
