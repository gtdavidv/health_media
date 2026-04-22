import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'

const AdminSettings = () => {
  const [siteName, setSiteName] = useState('')
  const [articlesHeading, setArticlesHeading] = useState('')
  const [articlesSubtitle, setArticlesSubtitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => {
        setSiteName(res.data.site_name || '')
        setArticlesHeading(res.data.articles_heading || '')
        setArticlesSubtitle(res.data.articles_subtitle || '')
      })
      .catch(() => setMessage('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await axios.put('/api/admin/settings', {
        site_name: siteName,
        articles_heading: articlesHeading,
        articles_subtitle: articlesSubtitle,
      })
      setMessage('Settings saved.')
    } catch {
      setMessage('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminAuth title="Site Settings">
      {({ logout }) => (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ margin: 0 }}>Site Settings</h1>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/manage" style={{ textDecoration: 'none', color: '#555' }}>← Back</Link>
              <button onClick={logout} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '0.25rem 0.75rem', cursor: 'pointer' }}>Logout</button>
            </div>
          </header>

          {loading ? <p>Loading…</p> : (
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Site name (top-left logo)
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Articles page title
                </label>
                <input
                  type="text"
                  value={articlesHeading}
                  onChange={e => setArticlesHeading(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Articles page subtitle
                </label>
                <input
                  type="text"
                  value={articlesSubtitle}
                  onChange={e => setArticlesSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{ padding: '0.6rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>

              {message && (
                <p style={{ marginTop: '1rem', color: message.includes('Failed') ? 'red' : 'green' }}>
                  {message}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </AdminAuth>
  )
}

export default AdminSettings
