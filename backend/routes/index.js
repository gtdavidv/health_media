const express = require('express');
const router = express.Router();

// Import route modules
const chatRoutes = require('./chat');
const adminRoutes = require('./admin');
const articlesRoutes = require('./articles');
const uploadRoutes = require('./upload');
const guardrailsRoutes = require('./guardrails');
const statsRoutes = require('./stats');
const studiesRoutes = require('./studies');
const pagesRoutes = require('./pages');
const settingsRoutes = require('./settings');

// Use route modules
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/articles', articlesRoutes);
router.use('/admin/upload', uploadRoutes);
router.use('/guardrails', guardrailsRoutes);
router.use('/admin/stats', statsRoutes);
router.use('/admin/studies', studiesRoutes);
router.use('/pages', pagesRoutes);
router.use('/settings', settingsRoutes);

// Temporary: debug headers
router.get('/debug-headers', (req, res) => {
  res.json({ headers: req.headers, secure: req.secure, protocol: req.protocol, ip: req.ip });
});

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