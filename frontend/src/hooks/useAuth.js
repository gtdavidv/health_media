import { useState, useEffect } from 'react'
import axios from 'axios'

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false))
  }, [])

  const login = async (password) => {
    try {
      await axios.post('/api/admin/login', { password })
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed'
      return { success: false, message: msg }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/admin/logout')
    } catch {
      // ignore — clear client state regardless
    }
    setIsAuthenticated(false)
  }

  return { isAuthenticated, loading, login, logout }
}

export default useAuth
