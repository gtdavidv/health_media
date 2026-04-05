import { useState, useEffect } from 'react'
import axios from 'axios'
import DOMPurify from 'dompurify'
import ArticlesList from './ArticlesList'
import '../styles/PageView.css'

const HomePage = () => {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/pages/home')
      .then(res => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (!page) return <ArticlesList />

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

export default HomePage
