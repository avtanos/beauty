import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token, fetchUser])

  const login = async (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const { access_token } = response.data
    setToken(access_token)
    localStorage.setItem('token', access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    await fetchUser()
    return response.data
  }

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData)
    await login(userData.email, userData.password)
    return response.data
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

