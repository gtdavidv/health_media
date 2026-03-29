const { ChromaClient } = require('chromadb');

class ChromaService {
  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_DB_PATH || 'http://localhost:8000'
    });
    
    // Initialize local embedding model (sentence-transformers)
    this.embedder = import('@langchain/community/embeddings/hf_transformers')
      .then(m => new (m.HuggingFaceTransformersEmbeddings ?? m.HfTransformersEmbeddings ?? m.default)({
        modelName: 'Xenova/all-MiniLM-L6-v2',
      }));
    
    this.collection = null;
    this.collectionName = 'health_media_studies';
  }

  async initialize() {
    try {
      // Get or create the collection
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });
      
      console.log(`Chroma collection '${this.collectionName}' initialized`);
      return true;
    } catch (error) {
      console.error('Failed to initialize Chroma service:', error);
      return false;
    }
  }

  async queryRelevantStudies(userQuery, numResults = 5, metadataFilters = {}) {
    if (!this.collection) {
      await this.initialize();
    }

    try {
      // Generate embedding for the query using local model
      const emb = await this.embedder;
      const queryEmbedding = await emb.embedQuery(userQuery);
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: numResults,
        where: metadataFilters,
        include: ['documents', 'metadatas', 'distances']
      });

      // Format results for easier consumption
      const formattedResults = [];
      if (results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const metadata = results.metadatas[0][i];
          formattedResults.push({
            content: results.documents[0][i],
            metadata: metadata,
            similarity: 1 - results.distances[0][i],
            citation: this.formatCitation(metadata)
          });
        }
      }

      return formattedResults;
    } catch (error) {
      console.error('Error querying Chroma database:', error);
      throw error;
    }
  }

  formatCitation(metadata) {
    const { title, authors, journal, year, doi } = metadata;
    let citation = '';
    
    if (authors) citation += `${authors}. `;
    if (title) citation += `"${title}". `;
    if (journal) citation += `${journal}`;
    if (year) citation += ` (${year})`;
    if (doi) citation += `. DOI: ${doi}`;
    
    return citation.trim();
  }
}

module.exports = new ChromaService();