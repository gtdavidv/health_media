import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/ArticlesList.css'

const ArticlesList = () => {
  const [allArticles, setAllArticles] = useState([])
  const [displayed, setDisplayed] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [searchCount, setSearchCount] = useState(null) // null = not in search mode

  // Initial load
  useEffect(() => {
    axios.get('/api/articles')
      .then(res => {
        setAllArticles(res.data)
        setDisplayed(res.data)
      })
      .catch(() => setError('Failed to fetch articles'))
      .finally(() => setInitialLoading(false))
  }, [])

  // Debounced search
  useEffect(() => {
    const q = query.trim()

    if (q.length < 2) {
      setDisplayed(allArticles)
      setSearchCount(null)
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    const timer = setTimeout(() => {
      axios.get('/api/articles', { params: { q } })
        .then(res => {
          setDisplayed(res.data)
          setSearchCount(res.data.length)
        })
        .catch(() => {
          // fall back to client-side filter on network error
          const lower = q.toLowerCase()
          const fallback = allArticles.filter(a =>
            a.title.toLowerCase().includes(lower) ||
            (a.summary || a.excerpt || '').toLowerCase().includes(lower)
          )
          setDisplayed(fallback)
          setSearchCount(fallback.length)
        })
        .finally(() => setSearchLoading(false))
    }, 350)

    return () => clearTimeout(timer)
  }, [query, allArticles])

  const clearSearch = () => setQuery('')

  if (initialLoading) {
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

  const isSearching = query.trim().length >= 2

  return (
    <div className="articles-list-container">
      <header className="articles-header">
        <h1>Health Media Articles</h1>
        <p className="articles-subtitle">
          Educational resources and information about health media
        </p>
      </header>

      <div className="articles-search">
        <div className="search-input-wrap">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="search-input"
            aria-label="Search articles"
          />
          {searchLoading && <span className="search-spinner" aria-hidden="true" />}
        </div>
        {isSearching && (
          <div className="search-meta">
            {searchLoading ? (
              <span className="search-status">Searching…</span>
            ) : (
              <span className="search-status">
                {searchCount === 1 ? '1 result' : `${searchCount} results`} for "{query.trim()}"
              </span>
            )}
            <button className="clear-search" onClick={clearSearch}>Clear</button>
          </div>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="no-articles">
          {isSearching ? (
            <>
              <h2>No results for "{query.trim()}"</h2>
              <p>Try different keywords or browse all articles.</p>
              <button className="clear-search" onClick={clearSearch}>Show all articles</button>
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
          {displayed.map((article) => {
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
