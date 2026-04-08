import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'
import { Helmet } from 'react-helmet-async'
import '../styles/ArticleView.css'
//import { API_BASE } from '../App.jsx'

const ArticleView = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`/api/articles/${slug}`)
        setArticle(response.data)
      } catch (error) {
        if (error.response?.status === 404) {
          setError('Article not found')
        } else {
          setError('Failed to fetch article')
        }
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchArticle()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="article-view-container">
        <div className="loading">Loading article...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="article-view-container">
        <div className="error-state">
          <h2>Article Not Found</h2>
          <p>{error}</p>
          <div className="error-actions">
            <Link to="/articles" className="button secondary">
              Browse Articles
            </Link>
            <Link to="/chat" className="button primary">
              Back to Chat
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  const description = article.metaDescription
    || article.summary
    || DOMPurify.sanitize(article.content, { ALLOWED_TAGS: [] }).slice(0, 160)
  const canonical = `${window.location.origin}/articles/${article.slug}`

  return (
    <div className="article-view-container">
      <Helmet>
        <title>{article.title} | Health Media</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {article.ogImage && <meta property="og:image" content={article.ogImage} />}
        <meta property="article:published_time" content={article.createdAt} />
        {article.updatedAt !== article.createdAt && (
          <meta property="article:modified_time" content={article.updatedAt} />
        )}
      </Helmet>
      <nav className="article-nav">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
          aria-label="Go back"
        >
          ← Back
        </button>
        <Link to="/articles" className="browse-link">
          Browse Articles
        </Link>
      </nav>

      <article className="article-content">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <div className="article-dates">
              <time dateTime={article.createdAt} className="created-date">
                Published {new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              {article.updatedAt !== article.createdAt && (
                <time dateTime={article.updatedAt} className="updated-date">
                  Updated {new Date(article.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              )}
            </div>
          </div>
        </header>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
        />
      </article>

      <footer className="article-footer">
        <div className="footer-content">
          <p className="disclaimer">
            <strong>Medical Disclaimer:</strong> This article is for educational purposes only 
            and should not be used as a substitute for professional medical advice, diagnosis, 
            or treatment. Always consult with a qualified healthcare provider regarding any 
            medical concerns.
          </p>
          <div className="footer-actions">
            <Link to="/articles" className="button secondary">
              Read More Articles
            </Link>
            <Link to="/chat" className="button primary">
              Ask Our Assistant
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ArticleView