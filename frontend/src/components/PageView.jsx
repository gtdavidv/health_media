import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'
import '../styles/PageView.css'

const PageView = () => {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/pages/${slug}`)
      .then(res => setPage(res.data))
      .catch(err => {
        setError(err.response?.status === 404 ? 'Page not found' : 'Failed to load page')
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="page-view-container">
        <div className="page-view-loading">Loading...</div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="page-view-container">
        <div className="page-view-error">
          <h2>Page Not Found</h2>
          <p>{error}</p>
          <Link to="/" className="page-view-home-link">← Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-view-container">
      <article className="page-view-article">
        <h1 className="page-view-title">{page.title}</h1>
        <div
          className="page-view-content rich-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
        />
      </article>
    </div>
  )
}

export default PageView
