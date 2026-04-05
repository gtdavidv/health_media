import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/ArticlesList.css'

const ArticlesList = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`/api/articles`)
        setArticles(response.data)
      } catch (error) {
        setError('Failed to fetch articles')
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return articles
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.summary || a.excerpt || '').toLowerCase().includes(q)
    )
  }, [articles, query])

  if (loading) {
    return (
      <div className="articles-list-container">
        <div className="loading">Loading articles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="articles-list-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="articles-list-container">
      <header className="articles-header">
        <h1>Health Media Articles</h1>
        <p className="articles-subtitle">
          Educational resources and information about health media
        </p>
      </header>

      <div className="articles-search">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="search-input"
          aria-label="Search articles"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="no-articles">
          {query ? (
            <>
              <h2>No results for "{query}"</h2>
              <button className="clear-search" onClick={() => setQuery('')}>Clear search</button>
            </>
          ) : (
            <>
              <h2>No Articles Available</h2>
              <p>Check back later for new content about health media.</p>
            </>
          )}
        </div>
      ) : (
        <div className="articles-grid">
          {filtered.map((article) => {
            const preview = article.summary || article.excerpt || ''
            return (
              <Link
                key={article.slug}
                to={`/articles/${article.slug}`}
                className="article-card-link"
              >
                <article className="article-card">
                  <h2 className="article-title">{article.title}</h2>
                  {preview && (
                    <p className="article-preview-text">{preview}</p>
                  )}
                  <div className="article-meta">
                    <time dateTime={article.createdAt}>
                      {new Date(article.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {article.updatedAt !== article.createdAt && (
                      <span className="updated-tag">Updated</span>
                    )}
                  </div>
                  <div className="article-preview">Read more →</div>
                </article>
              </Link>
            )
          })}
        </div>
      )}

      <div className="back-to-chat">
        <Link to="/chat" className="back-link">
          ← Chat with our Assistant
        </Link>
      </div>
    </div>
  )
}

export default ArticlesList
