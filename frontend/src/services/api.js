import axios from 'axios'
import { mockApi, USE_MOCK_DATA } from '../mocks/api'

// Определяем baseURL в зависимости от окружения
const getBaseURL = () => {
  // В production на GitHub Pages используем мок-данные
  if (import.meta.env.PROD) {
    return '/api'
  }
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Перехватчик для использования мок-данных
// В production всегда используем мок-данные
const isProduction = import.meta.env.MODE === 'production' || 
                     import.meta.env.PROD || 
                     (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
const shouldUseMockData = USE_MOCK_DATA || isProduction

if (shouldUseMockData) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || ''
    
    // Всегда пропускаем auth запросы и admin/tracker запросы на реальный API, даже с мок-данными
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/me') ||
        url.includes('/admin/tracker') || url.includes('/tracker/')) {
      console.log('🔐 Bypassing mock for request:', url)
      return config
    }
    
    // Перехватываем только GET запросы для мок-данных
    if (config.method === 'get') {
      try {
        // Услуги
        if (url.includes('/services')) {
          const idMatch = url.match(/\/services\/(\d+)/)
          if (idMatch) {
            const result = await mockApi.getService(idMatch[1])
            return Promise.reject({ mockResponse: true, data: result.data })
          } else {
            const params = new URLSearchParams(url.split('?')[1] || '')
            const result = await mockApi.getServices(Object.fromEntries(params))
            return Promise.reject({ mockResponse: true, data: result.data })
          }
        }
        
        // Мастера
        if (url.includes('/users/professionals')) {
          const params = new URLSearchParams(url.split('?')[1] || '')
          const result = await mockApi.getProfessionals(Object.fromEntries(params))
          console.log('📦 Mock: getProfessionals', params.toString(), result.data)
          return Promise.reject({ mockResponse: true, data: result.data, config })
        }
        
        // Мастер по ID
        if (url.match(/\/users\/(\d+)$/)) {
          const idMatch = url.match(/\/users\/(\d+)$/)
          if (idMatch) {
            const result = await mockApi.getProfessional(idMatch[1])
            return Promise.reject({ mockResponse: true, data: result.data })
          }
        }
        
        // Бронирования
        if (url.includes('/bookings') && !url.includes('/bookings/')) {
          const result = await mockApi.getBookings()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        // Отзывы
        if (url.includes('/reviews')) {
          const params = new URLSearchParams(url.split('?')[1] || '')
          const result = await mockApi.getReviews(Object.fromEntries(params))
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        // Статистика для кабинетов
        if (url.includes('/professional/stats')) {
          const result = await mockApi.getProfessionalStats()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/client/stats')) {
          const result = await mockApi.getClientStats()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/admin/stats')) {
          const result = await mockApi.getAdminStats()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        // Данные для кабинетов
        if (url.includes('/professional/services')) {
          const result = await mockApi.getProfessionalServices()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/professional/bookings')) {
          const result = await mockApi.getProfessionalBookings()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/professional/reviews')) {
          const result = await mockApi.getProfessionalReviews()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/client/bookings')) {
          const result = await mockApi.getClientBookings()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/client/reviews')) {
          const result = await mockApi.getClientReviews()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/client/favorites/professionals')) {
          const result = await mockApi.getFavoriteProfessionals()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        // Админ данные
        if (url.includes('/admin/users')) {
          const result = await mockApi.getAdminUsers()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/admin/services')) {
          const result = await mockApi.getAdminServices()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/admin/bookings')) {
          const result = await mockApi.getAdminBookings()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
        
        if (url.includes('/admin/reviews')) {
          const result = await mockApi.getAdminReviews()
          return Promise.reject({ mockResponse: true, data: result.data })
        }
      } catch (error) {
        // Если ошибка в мок-данных, продолжаем обычный запрос
        console.warn('Mock data error:', error)
      }
    }
    
    // Для POST/PUT/DELETE запросов в production возвращаем успешный ответ
    // Но НЕ для auth/login и auth/register - они должны идти на реальный API
    if (import.meta.env.PROD && ['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      // Пропускаем auth запросы на реальный API даже в production
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return config
      }
      return Promise.reject({ 
        mockResponse: true, 
        data: { message: 'Success', id: Date.now() },
        status: 200
      })
    }
    
    // В dev режиме всегда пропускаем auth запросы и admin/tracker запросы на реальный API
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/me') ||
        url.includes('/admin/tracker') || url.includes('/tracker/')) {
      return config
    }
    
    return config
  })
  
  // Обработка мок-ответов
  api.interceptors.response.use(
    response => {
      // Если это обычный ответ, просто возвращаем его
      return response
    },
    error => {
      // Если это мок-ответ (перехваченный запрос), возвращаем его как успешный
      if (error.mockResponse) {
        console.log('✅ Mock response intercepted:', error.data)
        return Promise.resolve({ 
          data: error.data, 
          status: error.status || 200,
          config: error.config
        })
      }
      // Для реальных ошибок логируем и пробрасываем дальше
      console.warn('❌ Real API error:', error.message)
      return Promise.reject(error)
    }
  )
  
  // Логирование для отладки
  console.log('🔧 API Mock Interceptor:', {
    USE_MOCK_DATA,
    shouldUseMockData,
    isProduction,
    mode: import.meta.env.MODE,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
  })
}

export default api
