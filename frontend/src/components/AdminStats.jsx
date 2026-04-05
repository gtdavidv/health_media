import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import '../styles/AdminStats.css'

const AdminStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/admin/stats')
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load stats. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <AdminAuth title="Admin Stats">
      {({ logout }) => (
        <div className="admin-stats-container">
          <header className="admin-header">
            <div className="header-content">
              <h1>Analytics</h1>
              <div className="header-actions">
                <Link to="/admin/manage" className="nav-btn">Manage Articles</Link>
                <Link to="/" className="nav-btn">Back to Chat</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          <main className="admin-main">
            {loading && (
              <div className="stats-loading">Loading stats...</div>
            )}

            {error && (
              <div className="message error">{error}</div>
            )}

            {!loading && !error && stats && (
              <>
                {/* Summary cards */}
                <section className="stats-section">
                  <h2>Overview</h2>
                  <div className="summary-cards">
                    <div className="stat-card">
                      <div className="stat-number">{stats.total_page_views.toLocaleString()}</div>
                      <div className="stat-label">Total Page Views</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{stats.total_chat_events.toLocaleString()}</div>
                      <div className="stat-label">Total Chats</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{stats.total_chat_messages.toLocaleString()}</div>
                      <div className="stat-label">Total Messages</div>
                    </div>
                    <div className="stat-card stat-card--accent">
                      <div className="stat-number">{stats.views_last_7_days.toLocaleString()}</div>
                      <div className="stat-label">Views (Last 7 Days)</div>
                    </div>
                    <div className="stat-card stat-card--accent">
                      <div className="stat-number">{stats.chats_last_7_days.toLocaleString()}</div>
                      <div className="stat-label">Chats (Last 7 Days)</div>
                    </div>
                  </div>
                </section>

                {/* Top Articles */}
                <section className="stats-section">
                  <h2>Top Articles <span className="section-note">(last 30 days)</span></h2>
                  {stats.top_articles.length === 0 ? (
                    <p className="no-data">No article views recorded yet.</p>
                  ) : (
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Slug</th>
                          <th>Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.top_articles.map((article, index) => (
                          <tr key={article.slug}>
                            <td className="rank-cell">{index + 1}</td>
                            <td>
                              <Link
                                to={`/articles/${article.slug}`}
                                className="slug-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {article.slug}
                              </Link>
                            </td>
                            <td className="count-cell">{article.count.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Views by day and Chats by day side-by-side */}
                <div className="charts-row">
                  <section className="stats-section stats-section--half">
                    <h2>Views by Day <span className="section-note">(last 14 days)</span></h2>
                    {stats.views_by_day.length === 0 ? (
                      <p className="no-data">No views in this period.</p>
                    ) : (
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Views</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.views_by_day.map((row) => (
                            <tr key={row.date}>
                              <td>{formatDate(row.date)}</td>
                              <td className="count-cell">{row.count.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>

                  <section className="stats-section stats-section--half">
                    <h2>Chats by Day <span className="section-note">(last 14 days)</span></h2>
                    {stats.chats_by_day.length === 0 ? (
                      <p className="no-data">No chats in this period.</p>
                    ) : (
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Chats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.chats_by_day.map((row) => (
                            <tr key={row.date}>
                              <td>{formatDate(row.date)}</td>
                              <td className="count-cell">{row.count.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </AdminAuth>
  )
}

export default AdminStats
