import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import RichTextEditor from './RichTextEditor'
import '../styles/AddArticle.css'
import '../styles/AdminPages.css'

const EditPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState({ title: '', content: '', in_nav: false, is_home: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!slug) return
    axios.get(`/api/pages/${slug}`)
      .then(res => setPage({
        title: res.data.title,
        content: res.data.content,
        in_nav: res.data.in_nav,
        is_home: res.data.is_home,
      }))
      .catch(() => setMessage('Failed to load page'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { title, content, in_nav, is_home } = page

      if (!title.trim() || !content.trim()) {
        setMessage('Title and content are required')
        return
      }

      await axios.put(`/api/pages/${slug}`, { title, content, in_nav, is_home })

      setMessage('Page updated!')
      setTimeout(() => navigate('/admin/pages'), 1200)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating page')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminAuth title="Edit Page">
      {({ logout }) => (
        <div className="add-article-container">
          <header className="add-article-header">
            <div className="header-content">
              <h1>Edit Page</h1>
              <div className="header-actions">
                <Link to="/admin/pages" className="nav-btn">Manage Pages</Link>
                <Link to="/" className="nav-btn">View Site</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('error') || message.includes('Failed') || message.includes('required') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <main className="add-article-main">
            {loading ? (
              <div className="loading">Loading page...</div>
            ) : (
              <form onSubmit={handleSubmit} className="article-form">
                <div className="form-group">
                  <label>
                    URL Slug <span className="field-optional">(read-only)</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    readOnly
                    className="title-input"
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="title">Page Title</label>
                  <input
                    type="text"
                    id="title"
                    value={page.title}
                    onChange={e => setPage(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="title-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={page.in_nav}
                      onChange={e => setPage(prev => ({ ...prev, in_nav: e.target.checked }))}
                      style={{ marginRight: '8px' }}
                    />
                    Show in navigation
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={page.is_home}
                      onChange={e => setPage(prev => ({ ...prev, is_home: e.target.checked }))}
                      style={{ marginRight: '8px' }}
                    />
                    Set as home page <span className="field-optional">(replaces articles list at /)</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <RichTextEditor
                    content={page.content}
                    onChange={html => setPage(prev => ({ ...prev, content: html }))}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={saving} className="submit-btn">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/pages')}
                    disabled={saving}
                    className="clear-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      )}
    </AdminAuth>
  )
}

export default EditPage
