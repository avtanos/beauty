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
const shouldUseMockData = USE_MOCK_DATA || import.meta.env.PROD

if (shouldUseMockData) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || ''
    
    // Перехватываем GET запросы и возвращаем мок-данные
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
          return Promise.reject({ mockResponse: true, data: result.data })
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
    if (import.meta.env.PROD && ['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      return Promise.reject({ 
        mockResponse: true, 
        data: { message: 'Success', id: Date.now() },
        status: 200
      })
    }
    
    return config
  })
  
  // Обработка мок-ответов
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.mockResponse) {
        return Promise.resolve({ data: error.data, status: error.status || 200 })
      }
      return Promise.reject(error)
    }
  )
  
  if (import.meta.env.DEV) {
    console.log('🔧 Мок-данные включены. Для отключения: localStorage.setItem("useMockData", "false")')
  }
}

export default api
