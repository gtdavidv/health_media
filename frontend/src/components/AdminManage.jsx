import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import '../styles/AdminManage.css'

const AdminManage = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/articles')
      setArticles(response.data)
    } catch (error) {
      console.error('Error fetching articles:', error)
      setMessage('Failed to fetch articles')
    }
  }

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) {
      return
    }

    setDeleteLoading(slug)
    try {
      await axios.delete(`/api/admin/articles/${slug}`)
      setMessage(`Article "${title}" deleted successfully!`)
      await fetchArticles()
    } catch (error) {
      setMessage('Error deleting article')
      console.error('Error deleting article:', error)
    } finally {
      setDeleteLoading(null)
    }
  }


  return (
    <AdminAuth title="Manage Articles">
      {({ logout }) => (
    <div className="admin-manage-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>Manage Articles</h1>
          <div className="header-actions">
            <Link to="/admin/add-article" className="nav-btn primary">Add New Article</Link>
            <Link to="/admin/pages" className="nav-btn">Pages</Link>
            <Link to="/admin/guardrails" className="nav-btn">AI Guardrails</Link>
            <Link to="/admin/studies" className="nav-btn">RAG Sources</Link>
            <Link to="/admin/stats" className="nav-btn">View Stats</Link>
            <Link to="/" className="nav-btn">View Site</Link>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('error') || message.includes('Invalid') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <main className="admin-main">
        <div className="articles-summary">
          <h2>All Articles ({articles.length})</h2>
          <p>Manage your published articles below. You can delete articles or add new ones.</p>
        </div>

        {articles.length === 0 ? (
          <div className="no-articles">
            <h3>No Articles Found</h3>
            <p>You haven't created any articles yet.</p>
            <Link to="/admin/add-article" className="add-first-btn">
              Create Your First Article
            </Link>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => (
              <div key={article.slug} className="article-card">
                <div className="article-header">
                  <h3 className="article-title">{article.title}</h3>
                  <Link 
                    to={`/articles/${article.slug}`} 
                    className="view-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Live →
                  </Link>
                </div>
                
                <div className="article-meta">
                  <div className="meta-item">
                    <strong>Slug:</strong> {article.slug}
                  </div>
                  <div className="meta-item">
                    <strong>Created:</strong> {new Date(article.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {article.updatedAt !== article.createdAt && (
                    <div className="meta-item">
                      <strong>Updated:</strong> {new Date(article.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>

                <div className="article-actions">
                  <Link to={`/admin/edit-article/${article.slug}`} className="nav-btn">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.slug, article.title)}
                    disabled={deleteLoading === article.slug}
                    className="delete-btn"
                  >
                    {deleteLoading === article.slug ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
      )}
    </AdminAuth>
  )
}

export default AdminManage