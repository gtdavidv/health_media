import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import '../styles/AdminAuth.css'

const AdminAuth = ({ children, title = 'Admin Access Required', showNavigation = true }) => {
  const { isAuthenticated, loading, login, logout } = useAuth()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setMessage('Password is required')
      return
    }
    setSubmitting(true)
    const result = await login(password)
    if (result.success) {
      setPassword('')
      setMessage('')
    } else {
      setMessage(result.message)
    }
    setSubmitting(false)
  }

  // Checking session on mount
  if (loading) {
    return (
      <div className="admin-auth-container">
        <div className="admin-login">
          <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-container">
        <div className="admin-login">
          <h2>{title}</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Admin Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            <button type="submit" disabled={submitting} className="login-btn">
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message && <div className="message error">{message}</div>}

          {showNavigation && (
            <div className="back-to-site">
              <Link to="/" className="back-link">← Back to site</Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return children({ logout })
}

export default AdminAuth
