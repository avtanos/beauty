import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import axios from 'axios'
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
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me')
      const userData = response.data
      // Убеждаемся, что роль - строка
      if (userData.role && typeof userData.role !== 'string') {
        userData.role = userData.role.value || userData.role
      }
      console.log('User loaded:', userData)
      setUser(userData)
      // Сохраняем пользователя в localStorage для быстрого доступа
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to fetch user:', error)
      if (error.response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      // Проверяем, есть ли сохраненный пользователь в localStorage
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
  }, [token, fetchUser])

  const login = async (email, password) => {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const formData = new URLSearchParams()
    formData.append('username', email.trim())
    formData.append('password', password)
    
    try {
      // Используем прямой axios запрос с учетом Vite proxy
      // Vite proxy перенаправляет /api на http://localhost:8080
      const response = await axios.post(
        '/api/auth/login',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          transformRequest: [(data) => data], // Отключаем автоматическую трансформацию axios
        }
      )
      
      const { access_token } = response.data
      if (!access_token) {
        throw new Error('No access token received')
      }
      
      setToken(access_token)
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Загружаем данные пользователя и ждем завершения
      await fetchUser()
      
      return response.data
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        requestData: formData.toString()
      })
      throw error
    }
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
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

