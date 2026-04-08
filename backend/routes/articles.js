const express = require('express');
const articleService = require('../services/articleService');
const pool = require('../db');
const router = express.Router();

// Get all articles, or search with ?q= (public endpoint)
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const articles = q.length >= 2
      ? await articleService.searchArticles(q)
      : await articleService.getAllArticles();
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article by slug (public endpoint)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await articleService.getArticleBySlug(slug);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    pool.query('INSERT INTO page_views (slug) VALUES ($1)', [slug]).catch(() => {})

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

module.exports = router;