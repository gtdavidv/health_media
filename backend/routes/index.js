const express = require('express');
const router = express.Router();

// Import route modules
const chatRoutes = require('./chat');
const adminRoutes = require('./admin');
const articlesRoutes = require('./articles');

// Use route modules
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/articles', articlesRoutes);

// Basic API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Health Media API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      chat: '/api/chat',
      articles: '/api/articles',
      admin: '/api/admin'
    }
  });
});

module.exports = router;