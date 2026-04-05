import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import '../styles/AdminPages.css'

const AdminPages = () => {
  const [pages, setPages] = useState([])
  const [message, setMessage] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await axios.get('/api/pages')
      setPages(res.data)
    } catch {
      setMessage('Failed to fetch pages')
    }
  }

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleteLoading(slug)
    try {
      await axios.delete(`/api/pages/${slug}`)
      setMessage(`"${title}" deleted.`)
      await fetchPages()
    } catch {
      setMessage('Error deleting page')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <AdminAuth title="Manage Pages">
      {({ logout }) => (
        <div className="admin-pages-container">
          <header className="admin-header">
            <div className="header-content">
              <h1>Manage Pages</h1>
              <div className="header-actions">
                <Link to="/admin/add-page" className="nav-btn primary">Add New Page</Link>
                <Link to="/admin/manage" className="nav-btn">Articles</Link>
                <Link to="/admin/guardrails" className="nav-btn">AI Guardrails</Link>
                <Link to="/admin/stats" className="nav-btn">View Stats</Link>
                <Link to="/" className="nav-btn">View Site</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <main className="admin-main">
            <div className="pages-summary">
              <h2>All Pages ({pages.length})</h2>
            </div>

            {pages.length === 0 ? (
              <div className="no-pages">
                <h3>No Pages Yet</h3>
                <p>Create your first static page.</p>
                <Link to="/admin/add-page" className="add-first-btn">Create a Page</Link>
              </div>
            ) : (
              <div className="pages-grid">
                {pages.map(page => (
                  <div key={page.slug} className="page-card">
                    <div className="page-card-header">
                      <h3 className="page-card-title">{page.title}</h3>
                      <a
                        href={`/pages/${page.slug}`}
                        className="view-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View →
                      </a>
                    </div>
                    <div className="page-card-meta">
                      <span className="meta-slug">/{page.slug}</span>
                      {page.is_home && <span className="badge badge-home">Home</span>}
                      {page.in_nav && <span className="badge badge-nav">In Nav</span>}
                    </div>
                    <div className="page-card-actions">
                      <Link to={`/admin/edit-page/${page.slug}`} className="nav-btn">Edit</Link>
                      <button
                        onClick={() => handleDelete(page.slug, page.title)}
                        disabled={deleteLoading === page.slug}
                        className="delete-btn"
                      >
                        {deleteLoading === page.slug ? 'Deleting...' : 'Delete'}
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

export default AdminPages
