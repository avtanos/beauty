// Мок-функции для API запросов
import { mockServices, mockProfessionals, mockBookings, mockReviews } from './data'

// Переменная для включения/выключения мок-данных
// В production всегда используем мок-данные
// В development можно управлять через localStorage
const isProduction = import.meta.env.MODE === 'production' || 
                     import.meta.env.PROD || 
                     (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
const devMockSetting = typeof window !== 'undefined' ? localStorage.getItem('useMockData') : null
const useMockInDev = devMockSetting === null || devMockSetting === 'true'

export const USE_MOCK_DATA = isProduction || (import.meta.env.DEV && useMockInDev)

// Логирование для отладки
if (typeof window !== 'undefined') {
  console.log('📦 Mock API Config:', {
    USE_MOCK_DATA,
    isProduction,
    mode: import.meta.env.MODE,
    hostname: window.location.hostname,
    url: window.location.href
  })
}

// Функция для задержки (имитация сетевого запроса)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  // Получить услуги
  getServices: async (params = {}) => {
    await delay(300)
    let services = [...mockServices]
    
    // Фильтрация по категории
    if (params.category) {
      services = services.filter(s => s.category === params.category)
    }
    
    // Лимит
    if (params.limit) {
      services = services.slice(0, params.limit)
    }
    
    // Фильтрация по мастеру
    if (params.professional_id) {
      services = services.filter(s => s.professional_id === parseInt(params.professional_id))
    }
    
    return { data: services }
  },
  
  // Получить услугу по ID
  getService: async (id) => {
    await delay(200)
    const service = mockServices.find(s => s.id === parseInt(id))
    if (!service) {
      throw new Error('Service not found')
    }
    return { data: service }
  },
  
  // Получить мастеров
  getProfessionals: async (params = {}) => {
    await delay(300)
    let professionals = [...mockProfessionals]
    
    // Фильтрация по минимальному рейтингу
    if (params.min_rating) {
      professionals = professionals.filter(p => p.rating >= parseFloat(params.min_rating))
    }
    
    // Лимит
    if (params.limit) {
      professionals = professionals.slice(0, params.limit)
    }
    
    return { data: professionals }
  },
  
  // Получить мастера по ID
  getProfessional: async (id) => {
    await delay(200)
    const professional = mockProfessionals.find(p => p.id === parseInt(id))
    if (!professional) {
      throw new Error('Professional not found')
    }
    return { data: professional }
  },
  
  // Получить услуги мастера
  getProfessionalServices: async (professionalId) => {
    await delay(200)
    const services = mockServices.filter(s => s.professional_id === parseInt(professionalId))
    return { data: services }
  },
  
  // Получить бронирования
  getBookings: async () => {
    await delay(400)
    return { data: mockBookings }
  },
  
  // Получить отзывы
  getReviews: async (params = {}) => {
    await delay(300)
    let reviews = [...mockReviews]
    
    // Фильтрация по мастеру
    if (params.professional_id) {
      reviews = reviews.filter(r => r.professional_id === parseInt(params.professional_id))
    }
    
    return { data: reviews }
  },
  
  // Статистика мастера
  getProfessionalStats: async () => {
    await delay(200)
    const services = mockServices.filter(s => s.professional_id === 3 && s.is_active)
    const bookings = mockBookings.filter(b => b.professional_id === 3)
    const completed = bookings.filter(b => b.status === 'completed')
    const revenue = completed.reduce((sum, b) => sum + b.total_price, 0)
    
    return {
      data: {
        services: { total: services.length },
        bookings: {
          total: bookings.length,
          completed: completed.length,
          pending: bookings.filter(b => b.status === 'pending').length,
          recent_30_days: bookings.length
        },
        revenue: { total: revenue },
        rating: { average: 4.9, total_reviews: 15 }
      }
    }
  },
  
  // Услуги мастера
  getProfessionalServices: async () => {
    await delay(200)
    return { data: mockServices.filter(s => s.professional_id === 3) }
  },
  
  // Бронирования мастера
  getProfessionalBookings: async () => {
    await delay(200)
    return { data: mockBookings.filter(b => b.professional_id === 3) }
  },
  
  // Отзывы о мастере
  getProfessionalReviews: async () => {
    await delay(200)
    return { data: mockReviews.filter(r => r.professional_id === 3) }
  },
  
  // Статистика клиента
  getClientStats: async () => {
    await delay(200)
    const bookings = mockBookings.filter(b => b.client_id === 1)
    const completed = bookings.filter(b => b.status === 'completed')
    const spent = completed.reduce((sum, b) => sum + b.total_price, 0)
    
    return {
      data: {
        bookings: {
          total: bookings.length,
          completed: completed.length,
          pending: bookings.filter(b => b.status === 'pending').length,
          recent_30_days: bookings.length
        },
        spending: { total: spent },
        reviews: { total: mockReviews.filter(r => r.client_id === 1).length }
      }
    }
  },
  
  // Бронирования клиента
  getClientBookings: async () => {
    await delay(200)
    return { data: mockBookings.filter(b => b.client_id === 1) }
  },
  
  // Отзывы клиента
  getClientReviews: async () => {
    await delay(200)
    return { data: mockReviews.filter(r => r.client_id === 1) }
  },
  
  // Избранные мастера
  getFavoriteProfessionals: async () => {
    await delay(200)
    return { data: mockProfessionals.filter(p => p.rating >= 4.8) }
  },
  
  // Статистика админа
  getAdminStats: async () => {
    await delay(200)
    return {
      data: {
        users: {
          total: mockProfessionals.length + 2,
          clients: 2,
          professionals: mockProfessionals.length
        },
        services: { total: mockServices.filter(s => s.is_active).length },
        bookings: {
          total: mockBookings.length,
          by_status: {
            pending: mockBookings.filter(b => b.status === 'pending').length,
            confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
            completed: mockBookings.filter(b => b.status === 'completed').length
          },
          recent_30_days: mockBookings.length
        },
        reviews: { total: mockReviews.length },
        revenue: {
          total: mockBookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + b.total_price, 0)
        },
        average_rating: 4.85
      }
    }
  },
  
  // Пользователи для админа
  getAdminUsers: async () => {
    await delay(200)
    const clients = [
      { id: 1, email: 'client1@example.com', full_name: 'Айгуль Абдыкадырова', role: 'client', is_active: true },
      { id: 2, email: 'client2@example.com', full_name: 'Нурбек Токтошев', role: 'client', is_active: true }
    ]
    return { data: [...clients, ...mockProfessionals] }
  },
  
  // Услуги для админа
  getAdminServices: async () => {
    await delay(200)
    return { data: mockServices }
  },
  
  // Бронирования для админа
  getAdminBookings: async () => {
    await delay(200)
    return { data: mockBookings }
  },
  
  // Отзывы для админа
  getAdminReviews: async () => {
    await delay(200)
    return { data: mockReviews }
  }
}

// Перехватчик для axios (опционально)
export const setupMockInterceptor = (axiosInstance) => {
  if (!USE_MOCK_DATA) return
  
  axiosInstance.interceptors.request.use(async (config) => {
    const url = config.url
    
    // Перехватываем запросы и возвращаем мок-данные
    if (url.includes('/services')) {
      if (config.method === 'get') {
        const idMatch = url.match(/\/services\/(\d+)/)
        if (idMatch) {
          // Получить услугу по ID
          const result = await mockApi.getService(idMatch[1])
          throw { isMock: true, data: result.data }
        } else {
          // Список услуг
          const params = new URLSearchParams(url.split('?')[1] || '')
          const result = await mockApi.getServices(Object.fromEntries(params))
          throw { isMock: true, data: result.data }
        }
      }
    }
    
    if (url.includes('/users/professionals')) {
      if (config.method === 'get') {
        const idMatch = url.match(/\/users\/(\d+)/)
        if (idMatch) {
          // Получить мастера по ID
          const result = await mockApi.getProfessional(idMatch[1])
          throw { isMock: true, data: result.data }
        } else {
          // Список мастеров
          const params = new URLSearchParams(url.split('?')[1] || '')
          const result = await mockApi.getProfessionals(Object.fromEntries(params))
          throw { isMock: true, data: result.data }
        }
      }
    }
    
    if (url.includes('/bookings') && config.method === 'get') {
      const result = await mockApi.getBookings()
      throw { isMock: true, data: result.data }
    }
    
    if (url.includes('/reviews') && config.method === 'get') {
      const params = new URLSearchParams(url.split('?')[1] || '')
      const result = await mockApi.getReviews(Object.fromEntries(params))
      throw { isMock: true, data: result.data }
    }
    
    return config
  })
  
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      // Если это мок-ответ, возвращаем его как успешный
      if (error.isMock) {
        return Promise.resolve({ data: error.data })
      }
      return Promise.reject(error)
    }
  )
}

