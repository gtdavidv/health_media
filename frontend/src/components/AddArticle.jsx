import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import AdminAuth from './AdminAuth'
import RichTextEditor from './RichTextEditor'
import '../styles/AddArticle.css'

const AddArticle = () => {
  const navigate = useNavigate()
  const [article, setArticle] = useState({ title: '', summary: '', content: '', metaDescription: '', ogImage: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { title, summary, content, metaDescription, ogImage } = article

      if (!title.trim() || !content.trim()) {
        setMessage('Title and content are required')
        return
      }

      await axios.post('/api/admin/articles', { title, summary, content, metaDescription, ogImage })

      setMessage('Article created successfully!')
      setArticle({ title: '', summary: '', content: '', metaDescription: '', ogImage: '' })
      
      // Redirect to articles page after successful creation
      setTimeout(() => {
        navigate('/articles')
      }, 2000)
      
    } catch (error) {
      if (error.response?.status === 401) {
        window.location.reload()
        return
      }
      setMessage(error.response?.data?.error || 'Error creating article')
      console.error('Error creating article:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <AdminAuth title="Add New Article">
      {({ logout }) => (
        <div className="add-article-container">
          <header className="add-article-header">
            <div className="header-content">
              <h1>Add New Article</h1>
              <div className="header-actions">
                <Link to="/articles" className="nav-btn">Browse Articles</Link>
                <Link to="/" className="nav-btn">Back to Chat</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('error') || message.includes('Invalid') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <main className="add-article-main">
            <form onSubmit={handleSubmit} className="article-form">
              <div className="form-group">
                <label htmlFor="title">Article Title</label>
                <input
                  type="text"
                  id="title"
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title for your article"
                  required
                  className="title-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="summary">Summary <span className="field-optional">(optional)</span></label>
                <textarea
                  id="summary"
                  value={article.summary}
                  onChange={(e) => setArticle(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="A short description shown on the articles list. If left blank, an excerpt from the article will be used."
                  rows="3"
                  className="summary-input"
                />
              </div>

              <div className="form-group">
                <label>Article Content</label>
                <RichTextEditor
                  content={article.content}
                  onChange={(html) => setArticle(prev => ({ ...prev, content: html }))}
                />
              </div>

              <div className="seo-section">
                <h3 className="seo-section-title">SEO</h3>
                <div className="form-group">
                  <label htmlFor="metaDescription">
                    Meta Description <span className="field-optional">(optional)</span>
                  </label>
                  <textarea
                    id="metaDescription"
                    value={article.metaDescription}
                    onChange={(e) => setArticle(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Search engine description. If blank, falls back to Summary then article text."
                    rows="2"
                    className="summary-input"
                    maxLength={160}
                  />
                  <div className={`seo-char-count ${article.metaDescription.length > 155 ? 'seo-char-count--warn' : ''}`}>
                    {article.metaDescription.length} / 160
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ogImage">
                    Social Image URL <span className="field-optional">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="ogImage"
                    value={article.ogImage}
                    onChange={(e) => setArticle(prev => ({ ...prev, ogImage: e.target.value }))}
                    placeholder="https://… — shown when shared on social media"
                    className="title-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Creating Article...' : 'Create Article'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setArticle({ title: '', summary: '', content: '', metaDescription: '', ogImage: '' })}
                  className="clear-btn"
                  disabled={loading}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </main>
        </div>
      )}
    </AdminAuth>
  )
}

export default AddArticle