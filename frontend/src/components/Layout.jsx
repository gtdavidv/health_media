import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import '../styles/Layout.css'

const Layout = () => {
  const [navPages, setNavPages] = useState([])
  const location = useLocation()

  useEffect(() => {
    axios.get('/api/pages/nav')
      .then(res => setNavPages(res.data))
      .catch(() => {}) // nav pages are optional
  }, [])

  return (
    <div className="site-layout">
      <Helmet>
        <title>Health Media</title>
        <meta name="description" content="Evidence-based health information and resources." />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </Helmet>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo">Health Media</Link>
          <nav className="site-nav">
            <Link
              to="/articles"
              className={`site-nav-link${location.pathname === '/articles' ? ' active' : ''}`}
            >
              Articles
            </Link>
            <Link
              to="/chat"
              className={`site-nav-link${location.pathname === '/chat' ? ' active' : ''}`}
            >
              Chat
            </Link>
            {navPages.map(page => (
              <Link
                key={page.slug}
                to={`/pages/${page.slug}`}
                className={`site-nav-link${location.pathname === `/pages/${page.slug}` ? ' active' : ''}`}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
