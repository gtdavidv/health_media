const pool = require('../db');
const pgvector = require('pgvector/pg');

class VectorService {
  constructor() {
    this.embedder = import('@langchain/community/embeddings/hf_transformers')
      .then(m => new (m.HuggingFaceTransformersEmbeddings ?? m.HfTransformersEmbeddings ?? m.default)({
        modelName: 'Xenova/all-MiniLM-L6-v2',
      }));
  }

  async initialize() {
    return true;
  }

  async queryRelevantStudies(userQuery, numResults = 5) {
    try {
      const emb = await this.embedder;
      const queryEmbedding = await emb.embedQuery(userQuery);

      const result = await pool.query(
        `SELECT content, title, authors, journal, year, doi,
                1 - (embedding <=> $1::vector) AS similarity
         FROM studies
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [pgvector.toSql(queryEmbedding), numResults]
      );

      return result.rows.map(row => ({
        content: row.content,
        metadata: {
          title: row.title,
          authors: row.authors,
          journal: row.journal,
          year: row.year,
          doi: row.doi
        },
        similarity: parseFloat(row.similarity),
        citation: this.formatCitation(row)
      }));
    } catch (error) {
      console.error('Error querying studies:', error);
      throw error;
    }
  }

  formatCitation({ title, authors, journal, year, doi }) {
    let citation = '';
    if (authors) citation += `${authors}. `;
    if (title) citation += `"${title}". `;
    if (journal) citation += journal;
    if (year) citation += ` (${year})`;
    if (doi) citation += `. DOI: ${doi}`;
    return citation.trim();
  }
}

module.exports = new VectorService();
