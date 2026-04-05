require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  store: new pgSession({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'hm.sid',
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

// API Routes
app.use('/api', require('./routes'));

// Health check endpoint — probes DB so the ALB pulls unhealthy instances
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(503).json({ status: 'ERROR', error: 'Database unavailable' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
