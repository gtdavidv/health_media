const pool = require('../db');
const { createSlug } = require('../utils/slug');

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

class ArticlesService {
  async createArticle(title, content, summary) {
    const slug = createSlug(title);
    try {
      const result = await pool.query(
        `INSERT INTO articles (slug, title, content, summary)
         VALUES ($1, $2, $3, $4)
         RETURNING slug, title, content, summary, created_at AS "createdAt", updated_at AS "updatedAt"`,
        [slug, title, content, summary?.trim() || null]
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

  async getArticleBySlug(slug) {
    const result = await pool.query(
      `SELECT slug, title, content, summary, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM articles WHERE slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  async updateArticle(slug, title, content, summary) {
    const newSlug = createSlug(title);

    if (slug !== newSlug) {
      const newArticle = await this.createArticle(title, content, summary);
      await this.deleteArticle(slug);
      return newArticle;
    }

    const result = await pool.query(
      `UPDATE articles SET title = $1, content = $2, summary = $3, updated_at = NOW()
       WHERE slug = $4
       RETURNING slug, title, content, summary, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [title, content, summary?.trim() || null, slug]
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
