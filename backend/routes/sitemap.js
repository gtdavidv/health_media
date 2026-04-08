const express = require('express');
const router = express.Router();
const pool = require('../db');

function escapeXml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc, lastmod, changefreq = 'weekly', priority = '0.7') {
  const mod = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : '';
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${mod}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

router.get('/sitemap.xml', async (req, res) => {
  const base = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

  try {
    const [articles, pages] = await Promise.all([
      pool.query('SELECT slug, updated_at FROM articles ORDER BY updated_at DESC'),
      pool.query('SELECT slug, updated_at FROM pages ORDER BY updated_at DESC'),
    ]);

    const entries = [
      urlEntry(`${base}/`, null, 'daily', '1.0'),
      urlEntry(`${base}/articles`, null, 'daily', '0.9'),
      urlEntry(`${base}/chat`, null, 'monthly', '0.5'),
      ...articles.rows.map(a =>
        urlEntry(`${base}/articles/${a.slug}`, a.updated_at, 'weekly', '0.8')
      ),
      ...pages.rows.map(p =>
        urlEntry(`${base}/pages/${p.slug}`, p.updated_at, 'monthly', '0.6')
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

router.get('/robots.txt', (req, res) => {
  const base = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`);
});

module.exports = router;
