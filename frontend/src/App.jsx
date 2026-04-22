import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'
import ArticlesList from './components/ArticlesList'
import ArticleView from './components/ArticleView'
import PageView from './components/PageView'
import AddArticle from './components/AddArticle'
import EditArticle from './components/EditArticle'
import AdminManage from './components/AdminManage'
import AdminGuardrails from './components/AdminGuardrails'
import AdminStats from './components/AdminStats'
import AdminStudies from './components/AdminStudies'
import AdminPages from './components/AdminPages'
import AdminSettings from './components/AdminSettings'
import AddPage from './components/AddPage'
import EditPage from './components/EditPage'
import './App.css'

function App() {
  return (
    <HelmetProvider>
    <Router>
      <Routes>
        {/* Public routes — wrapped in global nav Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/articles" element={<ArticlesList />} />
          <Route path="/articles/:slug" element={<ArticleView />} />
          <Route path="/pages/:slug" element={<PageView />} />
        </Route>

        {/* Admin routes — full-page, own headers */}
        <Route path="/admin" element={<Navigate to="/admin/manage" replace />} />
        <Route path="/admin/add-article" element={<AddArticle />} />
        <Route path="/admin/edit-article/:slug" element={<EditArticle />} />
        <Route path="/admin/manage" element={<AdminManage />} />
        <Route path="/admin/guardrails" element={<AdminGuardrails />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/studies" element={<AdminStudies />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/add-page" element={<AddPage />} />
        <Route path="/admin/edit-page/:slug" element={<EditPage />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </Router>
    </HelmetProvider>
  )
}

export default App
