import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/ArticlesList.css'
//import { API_BASE } from '../App.jsx'

const ArticlesList = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

      {articles.length === 0 ? (
        <div className="no-articles">
          <h2>No Articles Available</h2>
          <p>Check back later for new content about health media.</p>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <Link 
              key={article.slug} 
              to={`/articles/${article.slug}`}
              className="article-card-link"
            >
              <article className="article-card">
                <h2 className="article-title">{article.title}</h2>
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
                <div className="article-preview">
                  Read more →
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      <div className="back-to-chat">
        <Link to="/" className="back-link">
          ← Back to Chat
        </Link>
      </div>
    </div>
  )
}

export default ArticlesList