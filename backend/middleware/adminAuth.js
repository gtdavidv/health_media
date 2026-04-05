const adminAuth = (req, res, next) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin password not configured' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  next();
};

const adminAuthCheck = (req, res, next) => {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

module.exports = { adminAuth, adminAuthCheck };
