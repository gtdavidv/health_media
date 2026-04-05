import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import '../styles/AdminGuardrails.css'

const AdminGuardrails = () => {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchGuardrails()
  }, [])

  const fetchGuardrails = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get('/api/guardrails')
      setContent(response.data.content)
      setSavedContent(response.data.content)
      setUpdatedAt(response.data.updated_at)
    } catch (error) {
      setMessage('Failed to load guardrails')
      console.error('Error fetching guardrails:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage('Guardrails content cannot be empty')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await axios.put('/api/guardrails', { content })
      setSavedContent(response.data.content)
      setUpdatedAt(response.data.updated_at)
      setMessage('Guardrails saved successfully!')
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.reload()
        return
      }
      setMessage(error.response?.data?.error || 'Error saving guardrails')
      console.error('Error saving guardrails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setContent(savedContent)
    setMessage('')
  }

  const hasUnsavedChanges = content !== savedContent

  return (
    <AdminAuth title="Manage AI Guardrails">
      {({ logout }) => (
        <div className="admin-guardrails-container">
          <header className="guardrails-header">
            <div className="header-content">
              <h1>AI Assistant Guardrails</h1>
              <div className="header-actions">
                <Link to="/admin/manage" className="nav-btn">Manage Articles</Link>
                <Link to="/" className="nav-btn">Back to Chat</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('error') || message.includes('Failed') || message.includes('cannot') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <main className="guardrails-main">
            <div className="guardrails-form">
              <div className="form-intro">
                <p>
                  The text below is sent to the AI assistant as its system prompt on every chat request.
                  Edit it to change the assistant's behavior, tone, and restrictions.
                </p>
                {updatedAt && (
                  <p className="last-updated">
                    Last updated:{' '}
                    {new Date(updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="guardrails-content">System Prompt / Guardrails</label>
                {fetchLoading ? (
                  <div className="loading-placeholder">Loading current guardrails...</div>
                ) : (
                  <textarea
                    id="guardrails-content"
                    className="guardrails-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the AI assistant's system instructions..."
                    disabled={loading}
                  />
                )}
                <div className="char-counter">
                  {content.length.toLocaleString()} character{content.length !== 1 ? 's' : ''}
                  {hasUnsavedChanges && <span className="unsaved-indicator"> — unsaved changes</span>}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || fetchLoading || !hasUnsavedChanges}
                  className="submit-btn"
                >
                  {loading ? 'Saving...' : 'Save Guardrails'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading || fetchLoading || !hasUnsavedChanges}
                  className="clear-btn"
                >
                  Reset Changes
                </button>
              </div>
            </div>
          </main>
        </div>
      )}
    </AdminAuth>
  )
}

export default AdminGuardrails
