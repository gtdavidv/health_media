import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import RichTextEditor from './RichTextEditor'
import '../styles/AddArticle.css'
import '../styles/AdminPages.css'

const AddPage = () => {
  const navigate = useNavigate()

  const [page, setPage] = useState({ slug: '', title: '', content: '', in_nav: false, is_home: false })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { slug, title, content, in_nav, is_home } = page

      if (!slug.trim() || !title.trim() || !content.trim()) {
        setMessage('Slug, title, and content are required')
        return
      }

      await axios.post('/api/pages', { slug, title, content, in_nav, is_home })

      setMessage('Page created!')
      setTimeout(() => navigate('/admin/pages'), 1200)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating page')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminAuth title="Add Page">
      {({ logout }) => (
        <div className="add-article-container">
          <header className="add-article-header">
            <div className="header-content">
              <h1>Add Page</h1>
              <div className="header-actions">
                <Link to="/admin/pages" className="nav-btn">Manage Pages</Link>
                <Link to="/" className="nav-btn">View Site</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('error') || message.includes('required') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <main className="add-article-main">
            <form onSubmit={handleSubmit} className="article-form">
              <div className="form-group">
                <label htmlFor="slug">
                  URL Slug <span className="field-optional">(e.g. about-us → /pages/about-us)</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={page.slug}
                  onChange={e => setPage(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  required
                  className="title-input"
                  placeholder="about-us"
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
                  {saving ? 'Creating...' : 'Create Page'}
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
          </main>
        </div>
      )}
    </AdminAuth>
  )
}

export default AddPage
