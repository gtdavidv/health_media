const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/settings — returns all settings as a flat object
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
