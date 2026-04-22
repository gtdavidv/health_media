require('dotenv').config();
const articleService = require('../services/articleService');

const article = {
  title: process.env.ARTICLE_TITLE,
  summary: process.env.ARTICLE_SUMMARY,
  content: process.env.ARTICLE_CONTENT,
  metaDescription: process.env.ARTICLE_META_DESC,
  ogImage: process.env.ARTICLE_OG_IMAGE || null,
};

if (!article.title || !article.content) {
  console.error('ARTICLE_TITLE and ARTICLE_CONTENT are required');
  process.exit(1);
}

articleService.createArticle(
  article.title,
  article.content,
  article.summary,
  article.metaDescription,
  article.ogImage
)
  .then(result => {
    console.log('Article created:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
