const express = require('express');
const rateLimit = require('express-rate-limit');
const { adminAuth, adminAuthCheck } = require('../middleware/adminAuth');
const articleService = require('../services/articleService');
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts — try again in 15 minutes' },
});

// POST /api/admin/login
router.post('/login', loginLimiter, adminAuth, (req, res) => {
  req.session.isAdmin = true;
  res.json({ success: true });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/admin/me — session check
router.get('/me', adminAuthCheck, (req, res) => {
  res.json({ isAdmin: true });
});

// Create article endpoint
router.post('/articles', adminAuthCheck, async (req, res) => {
  try {
    const { title, content, summary } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const article = await articleService.createArticle(title, content, summary);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    if (error.message === 'An article with this title already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article endpoint
router.put('/articles/:slug', adminAuthCheck, async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, summary } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const article = await articleService.updateArticle(slug, title, content, summary);
    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article endpoint
router.delete('/articles/:slug', adminAuthCheck, async (req, res) => {
  try {
    const { slug } = req.params;
    await articleService.deleteArticle(slug);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    if (error.message === 'Article not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
