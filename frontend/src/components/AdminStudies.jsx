import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import '../styles/AdminStudies.css'

const AdminStudies = () => {
  const [studies, setStudies] = useState([])
  const [form, setForm] = useState({ title: '', url: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchStudies()
  }, [])

  const fetchStudies = async () => {
    try {
      const response = await axios.get('/api/admin/studies')
      setStudies(response.data)
    } catch (error) {
      setMessage('Failed to load studies')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) {
      setMessage('Content is required')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const response = await axios.post('/api/admin/studies', form)
      setStudies(prev => [response.data, ...prev])
      setForm({ title: '', url: '', content: '' })
      setMessage('Source added and embedded successfully.')
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add source')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    const label = title || `source #${id}`
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
    setDeleteLoading(id)
    try {
      await axios.delete(`/api/admin/studies/${id}`)
      setStudies(prev => prev.filter(s => s.id !== id))
      setMessage(`Deleted ${label}.`)
    } catch (error) {
      setMessage('Failed to delete source')
    } finally {
      setDeleteLoading(null)
    }
  }

  const isError = message && (message.startsWith('Failed') || message.startsWith('Error'))

  return (
    <AdminAuth title="RAG Sources">
      {({ logout }) => (
        <div className="admin-studies-container">
          <header className="admin-studies-header">
            <div className="header-content">
              <h1>RAG Sources</h1>
              <div className="header-actions">
                <Link to="/admin/manage" className="nav-btn">Manage Articles</Link>
                <Link to="/admin/guardrails" className="nav-btn">AI Guardrails</Link>
                <Link to="/" className="nav-btn">Back to Chat</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          {message && (
            <div className={`studies-message ${isError ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <main className="admin-studies-main">
            <section className="add-study-section">
              <h2>Add Source</h2>
              <p className="section-desc">
                Paste in text from a research paper, article, or any source. The AI will use this content when answering related questions.
              </p>
              <form onSubmit={handleSubmit} className="study-form">
                <div className="form-group">
                  <label htmlFor="title">Title <span className="optional">(optional)</span></label>
                  <input
                    type="text"
                    id="title"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Effect of sleep on mood regulation — Smith et al. 2023"
                    className="study-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">Source URL <span className="optional">(optional)</span></label>
                  <input
                    type="url"
                    id="url"
                    value={form.url}
                    onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                    className="study-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Source Text <span className="required">*</span></label>
                  <textarea
                    id="content"
                    value={form.content}
                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Paste the full text, abstract, or excerpt here..."
                    rows="12"
                    required
                    className="study-textarea"
                  />
                  <div className="char-count">{form.content.length} characters</div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Embedding and saving…' : 'Add Source'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ title: '', url: '', content: '' })}
                    className="clear-btn"
                    disabled={loading}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </section>

            <section className="studies-list-section">
              <h2>Existing Sources ({studies.length})</h2>
              {fetchLoading ? (
                <div className="loading">Loading sources…</div>
              ) : studies.length === 0 ? (
                <div className="no-studies">No sources added yet.</div>
              ) : (
                <div className="studies-list">
                  {studies.map(study => (
                    <div key={study.id} className="study-card">
                      <div className="study-card-body">
                        <div className="study-title">
                          {study.title || <span className="untitled">Untitled source</span>}
                        </div>
                        {study.url && (
                          <a href={study.url} target="_blank" rel="noopener noreferrer" className="study-url">
                            {study.url}
                          </a>
                        )}
                        <p className="study-excerpt">{study.excerpt}{study.excerpt?.length >= 200 ? '…' : ''}</p>
                        <div className="study-meta">
                          Added {new Date(study.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(study.id, study.title)}
                        disabled={deleteLoading === study.id}
                        className="delete-btn"
                      >
                        {deleteLoading === study.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      )}
    </AdminAuth>
  )
}

export default AdminStudies
