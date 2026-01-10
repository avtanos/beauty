// Mock data for Shop (Products)

export const mockProducts = [
  {
    id: 1,
    name: "Korean Skincare Set",
    name_ru: "Набор корейской косметики",
    name_ky: "Корея косметикасынын комплекти",
    description: "Полный набор для ухода за кожей лица от ведущих корейских брендов",
    description_ru: "Полный набор для ухода за кожей лица от ведущих корейских брендов",
    description_ky: "Бет терисине багуунун толук комплекти",
    price: 3500,
    currency: "KGS",
    stock_qty: 15,
    category_id: 1,
    category: { id: 1, name: 'Skincare Face', name_ru: 'Уход за лицом', name_ky: 'Бет багуу' },
    seller: { id: 1, full_name: 'Айнура Кыдырбекова' },
    images: [
      { id: 1, image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400", sort_order: 0 }
    ],
    is_active: true
  },
  {
    id: 2,
    name: "Professional Hair Dryer",
    name_ru: "Профессиональный фен",
    name_ky: "Профессионалдык фен",
    description: "Мощный фен с ионизацией для профессиональной укладки волос",
    description_ru: "Мощный фен с ионизацией для профессиональной укладки волос",
    description_ky: "Кучтуу ионизациялуу фен",
    price: 4500,
    currency: "KGS",
    stock_qty: 8,
    category_id: 5,
    category: { id: 5, name: 'Tools & Devices', name_ru: 'Инструменты и гаджеты', name_ky: 'Куралдар жана гаджеттер' },
    seller: { id: 2, full_name: 'Эрлан Мамытов' },
    images: [
      { id: 2, image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400", sort_order: 0 }
    ],
    is_active: true
  },
  {
    id: 3,
    name: "Body Lotion Set",
    name_ru: "Набор лосьонов для тела",
    name_ky: "Денеге лосьон комплекти",
    description: "Увлажняющие лосьоны для тела с натуральными компонентами",
    description_ru: "Увлажняющие лосьоны для тела с натуральными компонентами",
    description_ky: "Табигый компоненттер менен денеге лосьон",
    price: 1800,
    currency: "KGS",
    stock_qty: 20,
    category_id: 2,
    category: { id: 2, name: 'Skincare Body', name_ru: 'Уход за телом', name_ky: 'Дене багуу' },
    seller: { id: 1, full_name: 'Айнура Кыдырбекова' },
    images: [
      { id: 3, image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400", sort_order: 0 }
    ],
    is_active: true
  },
  {
    id: 4,
    name: "Premium Makeup Palette",
    name_ru: "Премиум палитра для макияжа",
    name_ky: "Премиум макияж палитрасы",
    description: "Профессиональная палитра теней с 24 оттенками",
    description_ru: "Профессиональная палитра теней с 24 оттенками",
    description_ky: "24 түстүү профессионалдык палитра",
    price: 2800,
    currency: "KGS",
    stock_qty: 12,
    category_id: 4,
    category: { id: 4, name: 'Makeup', name_ru: 'Декоративная косметика', name_ky: 'Макияж' },
    seller: { id: 3, full_name: 'Жылдыз Бекова' },
    images: [
      { id: 4, image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", sort_order: 0 }
    ],
    is_active: true
  },
  {
    id: 5,
    name: "Hair Care Shampoo & Conditioner",
    name_ru: "Шампунь и кондиционер для волос",
    name_ky: "Чач шампунь жана кондиционер",
    description: "Набор шампуня и кондиционера для всех типов волос",
    description_ru: "Набор шампуня и кондиционера для всех типов волос",
    description_ky: "Бардык чач түрлөрү үчүн шампунь жана кондиционер",
    price: 1200,
    currency: "KGS",
    stock_qty: 25,
    category_id: 3,
    category: { id: 3, name: 'Haircare', name_ru: 'Уход за волосами', name_ky: 'Чач багуу' },
    seller: { id: 4, full_name: 'Азамат Садыков' },
    images: [
      { id: 5, image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400", sort_order: 0 }
    ],
    is_active: true
  },
  {
    id: 6,
    name: "Facial Cleansing Brush",
    name_ru: "Щетка для очищения лица",
    name_ky: "Бет тазалоо щеткасы",
    description: "Электрическая щетка для глубокого очищения кожи лица",
    description_ru: "Электрическая щетка для глубокого очищения кожи лица",
    description_ky: "Бет терисин терең тазалоо үчүн электр щеткасы",
    price: 3200,
    currency: "KGS",
    stock_qty: 10,
    category_id: 5,
    category: { id: 5, name: 'Tools & Devices', name_ru: 'Инструменты и гаджеты', name_ky: 'Куралдар жана гаджеттер' },
    seller: { id: 1, full_name: 'Айнура Кыдырбекова' },
    images: [
      { id: 6, image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400", sort_order: 0 }
    ],
    is_active: true
  }
]
