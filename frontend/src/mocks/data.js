// Мок-данные для разработки и тестирования

export const mockServices = [
  {
    id: 1,
    name: "Manicure",
    name_ru: "Маникюр",
    name_ky: "Маникюр",
    description: "Classic manicure with nail shaping and polish",
    description_ru: "Классический маникюр с приданием формы ногтям и покрытием лаком",
    description_ky: "Классикалык маникюр",
    category: "nail_care",
    price: 800,
    duration_minutes: 60,
    professional_id: 1,
    image_url: null,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    professional: {
      id: 1,
      email: "master1@example.com",
      phone: "+996555333333",
      full_name: "Айнура Кыдырбекова",
      role: "professional",
      rating: 4.9,
      total_reviews: 25,
      bio: "Опытный мастер по маникюру и педикюру с 5-летним стажем",
      experience_years: 5,
      profile_image: null
    }
  },
  {
    id: 2,
    name: "Pedicure",
    name_ru: "Педикюр",
    name_ky: "Педикюр",
    description: "Classic pedicure with foot care",
    description_ru: "Классический педикюр с уходом за стопами",
    description_ky: "Классикалык педикюр",
    category: "nail_care",
    price: 1000,
    duration_minutes: 90,
    professional_id: 1,
    image_url: null,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    professional: {
      id: 1,
      email: "master1@example.com",
      phone: "+996555333333",
      full_name: "Айнура Кыдырбекова",
      role: "professional",
      rating: 4.9,
      total_reviews: 25,
      bio: "Опытный мастер по маникюру и педикюру с 5-летним стажем",
      experience_years: 5,
      profile_image: null
    }
  },
  {
    id: 3,
    name: "Relaxing Massage",
    name_ru: "Расслабляющий массаж",
    name_ky: "Эс алуу массажы",
    description: "Full body relaxing massage",
    description_ru: "Расслабляющий массаж всего тела",
    description_ky: "Бүт денеге эс алуу массажы",
    category: "massage",
    price: 2000,
    duration_minutes: 60,
    professional_id: 2,
    image_url: null,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    professional: {
      id: 2,
      email: "master2@example.com",
      phone: "+996555444444",
      full_name: "Эрлан Мамытов",
      role: "professional",
      rating: 4.8,
      total_reviews: 18,
      bio: "Профессиональный массажист. Предлагаю различные виды массажа",
      experience_years: 7,
      profile_image: null
    }
  },
  {
    id: 4,
    name: "Evening Makeup",
    name_ru: "Вечерний макияж",
    name_ky: "Кечки макияж",
    description: "Professional evening makeup for special occasions",
    description_ru: "Профессиональный вечерний макияж для особых случаев",
    description_ky: "Атайын окуялар үчүн кечки макияж",
    category: "beauty",
    price: 3000,
    duration_minutes: 90,
    professional_id: 3,
    image_url: null,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    professional: {
      id: 3,
      email: "master3@example.com",
      phone: "+996555555555",
      full_name: "Жылдыз Бекова",
      role: "professional",
      rating: 5.0,
      total_reviews: 32,
      bio: "Визажист и стилист. Создаю образы для особых случаев",
      experience_years: 6,
      profile_image: null
    }
  },
  {
    id: 5,
    name: "Men's Haircut",
    name_ru: "Мужская стрижка",
    name_ky: "Эркек чач кесуу",
    description: "Professional men's haircut and styling",
    description_ru: "Профессиональная мужская стрижка и укладка",
    description_ky: "Эркек чач кесуу жана стиль",
    category: "haircut",
    price: 600,
    duration_minutes: 30,
    professional_id: 4,
    image_url: null,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    professional: {
      id: 4,
      email: "master4@example.com",
      phone: "+996555666666",
      full_name: "Азамат Садыков",
      role: "professional",
      rating: 4.9,
      total_reviews: 20,
      bio: "Парикмахер-стилист. Мужские и женские стрижки",
      experience_years: 4,
      profile_image: null
    }
  },
  {
    id: 6,
    name: "Facial Treatment",
    name_ru: "Чистка лица",
    name_ky: "Бет тазалоо",
    description: "Deep facial cleansing and care",
    description_ru: "Глубокая чистка лица и уход",
    description_ky: "Терең бет тазалоо жана багуу",
    category: "beauty",
    price: 1500,
    duration_minutes: 60,
    professional_id: 3,
    image_url: null,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    professional: {
      id: 3,
      email: "master3@example.com",
      phone: "+996555555555",
      full_name: "Жылдыз Бекова",
      role: "professional",
      rating: 5.0,
      total_reviews: 32,
      bio: "Визажист и стилист. Создаю образы для особых случаев",
      experience_years: 6,
      profile_image: null
    }
  }
]

export const mockProfessionals = [
  {
    id: 1,
    email: "master1@example.com",
    phone: "+996555333333",
    full_name: "Айнура Кыдырбекова",
    role: "professional",
    is_active: true,
    rating: 4.9,
    total_reviews: 25,
    bio: "Опытный мастер по маникюру и педикюру с 5-летним стажем. Специализируюсь на классическом и дизайнерском маникюре.",
    experience_years: 5,
    profile_image: null,
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 2,
    email: "master2@example.com",
    phone: "+996555444444",
    full_name: "Эрлан Мамытов",
    role: "professional",
    is_active: true,
    rating: 4.8,
    total_reviews: 18,
    bio: "Профессиональный массажист. Предлагаю различные виды массажа: классический, расслабляющий, лечебный.",
    experience_years: 7,
    profile_image: null,
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 3,
    email: "master3@example.com",
    phone: "+996555555555",
    full_name: "Жылдыз Бекова",
    role: "professional",
    is_active: true,
    rating: 5.0,
    total_reviews: 32,
    bio: "Визажист и стилист. Создаю образы для особых случаев: свадьбы, фотосессии, вечеринки.",
    experience_years: 6,
    profile_image: null,
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 4,
    email: "master4@example.com",
    phone: "+996555666666",
    full_name: "Азамат Садыков",
    role: "professional",
    is_active: true,
    rating: 4.9,
    total_reviews: 20,
    bio: "Парикмахер-стилист. Мужские и женские стрижки, укладки, окрашивание.",
    experience_years: 4,
    profile_image: null,
    created_at: "2024-01-10T10:00:00Z"
  }
]

export const mockBookings = [
  {
    id: 1,
    client_id: 1,
    professional_id: 1,
    service_id: 1,
    booking_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    address: "Бишкек, ул. Чуй, д. 123",
    address_details: "Квартира 45, 3 этаж",
    phone: "+996555111111",
    status: "confirmed",
    total_price: 800,
    notes: "Пожалуйста, принесите свой лак",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service: mockServices[0],
    client: {
      id: 1,
      email: "client1@example.com",
      phone: "+996555111111",
      full_name: "Айгуль Абдыкадырова",
      role: "client"
    },
    professional: mockProfessionals[0]
  },
  {
    id: 2,
    client_id: 1,
    professional_id: 2,
    service_id: 3,
    booking_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    address: "Бишкек, ул. Ленина, д. 45",
    address_details: "Дом, вход со двора",
    phone: "+996555111111",
    status: "pending",
    total_price: 2000,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service: mockServices[2],
    client: {
      id: 1,
      email: "client1@example.com",
      phone: "+996555111111",
      full_name: "Айгуль Абдыкадырова",
      role: "client"
    },
    professional: mockProfessionals[1]
  },
  {
    id: 3,
    client_id: 1,
    professional_id: 3,
    service_id: 4,
    booking_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    address: "Бишкек, ул. Советская, д. 78",
    address_details: "Квартира 12",
    phone: "+996555111111",
    status: "completed",
    total_price: 3000,
    notes: "Для свадьбы",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    service: mockServices[3],
    client: {
      id: 1,
      email: "client1@example.com",
      phone: "+996555111111",
      full_name: "Айгуль Абдыкадырова",
      role: "client"
    },
    professional: mockProfessionals[2]
  }
]

export const mockReviews = [
  {
    id: 1,
    booking_id: 3,
    client_id: 1,
    professional_id: 3,
    rating: 5,
    comment: "Отличный мастер! Макияж получился просто потрясающим. Очень рекомендую!",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 1,
      email: "client1@example.com",
      phone: "+996555111111",
      full_name: "Айгуль Абдыкадырова",
      role: "client"
    }
  },
  {
    id: 2,
    booking_id: 1,
    client_id: 2,
    professional_id: 1,
    rating: 5,
    comment: "Очень довольна результатом! Маникюр выполнен аккуратно и качественно.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 2,
      email: "client2@example.com",
      phone: "+996555222222",
      full_name: "Нурбек Токтошев",
      role: "client"
    }
  },
  {
    id: 3,
    booking_id: 2,
    client_id: 2,
    professional_id: 2,
    rating: 4,
    comment: "Хороший массаж, но можно было бы сильнее.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      id: 2,
      email: "client2@example.com",
      phone: "+996555222222",
      full_name: "Нурбек Токтошев",
      role: "client"
    }
  }
]

