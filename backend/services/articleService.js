const pool = require('../db');
const { createSlug } = require('../utils/slug');

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

class ArticlesService {
  async createArticle(title, content, summary, metaDescription, ogImage) {
    const slug = createSlug(title);
    try {
      const result = await pool.query(
        `INSERT INTO articles (slug, title, content, summary, meta_description, og_image)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING slug, title, content, summary, meta_description AS "metaDescription",
                   og_image AS "ogImage", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [slug, title, content, summary?.trim() || null, metaDescription?.trim() || null, ogImage?.trim() || null]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('An article with this title already exists');
      }
      throw error;
    }
  }

  async getAllArticles() {
    const result = await pool.query(
      `SELECT slug, title, summary, content, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM articles ORDER BY created_at DESC`
    );
    return result.rows.map(row => ({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      excerpt: stripHtml(row.content).slice(0, 160),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async searchArticles(query) {
    const result = await pool.query(
      `SELECT slug, title, summary, content,
              created_at AS "createdAt", updated_at AS "updatedAt",
              ts_rank(
                setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(summary, '')), 'B'),
                plainto_tsquery('english', $1)
              ) AS rank
       FROM articles
       WHERE
         setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
         setweight(to_tsvector('english', coalesce(summary, '')), 'B')
         @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC, created_at DESC`,
      [query]
    );
    return result.rows.map(row => ({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      excerpt: stripHtml(row.content).slice(0, 160),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async getArticleBySlug(slug) {
    const result = await pool.query(
      `SELECT slug, title, content, summary, meta_description AS "metaDescription",
              og_image AS "ogImage", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM articles WHERE slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  async updateArticle(slug, title, content, summary, metaDescription, ogImage) {
    const newSlug = createSlug(title);

    if (slug !== newSlug) {
      const newArticle = await this.createArticle(title, content, summary, metaDescription, ogImage);
      await this.deleteArticle(slug);
      return newArticle;
    }

    const result = await pool.query(
      `UPDATE articles
       SET title = $1, content = $2, summary = $3, meta_description = $4, og_image = $5, updated_at = NOW()
       WHERE slug = $6
       RETURNING slug, title, content, summary, meta_description AS "metaDescription",
                 og_image AS "ogImage", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [title, content, summary?.trim() || null, metaDescription?.trim() || null, ogImage?.trim() || null, slug]
    );

    if (result.rows.length === 0) {
      throw new Error('Article not found');
    }
    return result.rows[0];
  }

  async deleteArticle(slug) {
    const result = await pool.query(
      'DELETE FROM articles WHERE slug = $1 RETURNING slug',
      [slug]
    );
    if (result.rows.length === 0) {
      throw new Error('Article not found');
    }
    return { success: true };
  }
}

module.exports = new ArticlesService();
