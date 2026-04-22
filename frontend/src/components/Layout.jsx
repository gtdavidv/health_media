import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import '../styles/Layout.css'

const Layout = () => {
  const [navPages, setNavPages] = useState([])
  const [siteName, setSiteName] = useState('Health Media')
  const location = useLocation()

  useEffect(() => {
    axios.get('/api/pages/nav')
      .then(res => setNavPages(res.data))
      .catch(() => {})
    axios.get('/api/settings')
      .then(res => { if (res.data.site_name) setSiteName(res.data.site_name) })
      .catch(() => {})
  }, [])

  return (
    <div className="site-layout">
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content="Evidence-based health information and resources." />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </Helmet>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo">{siteName}</Link>
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
