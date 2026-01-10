// Mock data for News and Blog (unified in Useful section)

export const mockNewsItems = [
  {
    id: 1,
    title: "10 лучших советов по уходу за кожей зимой",
    excerpt: "Зимний период требует особого подхода к уходу за кожей. Узнайте, как защитить вашу кожу от холода и сухости...",
    image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
    category_id: 3,
    category: { id: 3, name: 'Skincare', name_ru: 'Уход за кожей', name_ky: 'Тери багуу' },
    source: { id: 1, name: 'Beauty Magazine' },
    published_at: new Date('2024-01-15').toISOString(),
    original_url: 'https://example.com/news/1'
  },
  {
    id: 2,
    title: "Новые тренды в макияже 2024",
    excerpt: "Откройте для себя самые актуальные тренды в макияже этого года. Натуральность и выразительность - главные тренды...",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
    category_id: 1,
    category: { id: 1, name: 'Beauty', name_ru: 'Красота', name_ky: 'Сулуулук' },
    source: { id: 2, name: 'Style Guide' },
    published_at: new Date('2024-01-20').toISOString(),
    original_url: 'https://example.com/news/2'
  },
  {
    id: 3,
    title: "Как правильно ухаживать за волосами",
    excerpt: "Эксперты делятся секретами здоровых и блестящих волос. Правильный уход начинается с выбора шампуня...",
    image_url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
    category_id: 4,
    category: { id: 4, name: 'Hair', name_ru: 'Волосы', name_ky: 'Чач' },
    source: { id: 1, name: 'Beauty Magazine' },
    published_at: new Date('2024-01-18').toISOString(),
    original_url: 'https://example.com/news/3'
  },
  {
    id: 4,
    title: "Здоровое питание для красивой кожи",
    excerpt: "Что мы едим, напрямую влияет на состояние нашей кожи. Узнайте, какие продукты помогут сохранить молодость...",
    image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    category_id: 2,
    category: { id: 2, name: 'Health', name_ru: 'Здоровье', name_ky: 'Ден соолук' },
    source: { id: 3, name: 'Health & Beauty' },
    published_at: new Date('2024-01-22').toISOString(),
    original_url: 'https://example.com/news/4'
  },
  {
    id: 5,
    title: "Топ-5 трендовых процедур этого сезона",
    excerpt: "Какие косметические процедуры выбирают звезды? Обзор самых популярных и эффективных процедур...",
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
    category_id: 5,
    category: { id: 5, name: 'Trends', name_ru: 'Тренды', name_ky: 'Тренддер' },
    source: { id: 2, name: 'Style Guide' },
    published_at: new Date('2024-01-25').toISOString(),
    original_url: 'https://example.com/news/5'
  }
]

export const mockBlogPosts = [
  {
    id: 1,
    title: "Мой опыт использования корейской косметики",
    title_ru: "Мой опыт использования корейской косметики",
    title_ky: "Корея косметикасын колдонуу тажрыйбам",
    content: "За последние несколько месяцев я полностью перешла на корейскую косметику и хочу поделиться своими впечатлениями. Корейский уход за кожей (K-beauty) действительно оправдывает свою популярность...",
    cover_image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    category_id: 3,
    category: { id: 3, name: 'Skincare', name_ru: 'Уход за кожей', name_ky: 'Тери багуу' },
    author: { id: 1, full_name: 'Айгуль Абдыкадырова' },
    published_at: new Date('2024-01-10').toISOString(),
    status: 'published'
  },
  {
    id: 2,
    title: "Как я начала свой путь в макияже",
    title_ru: "Как я начала свой путь в макияже",
    title_ky: "Макияж жолуна кантип баштадым",
    content: "Макияж всегда был для меня способом самовыражения. В этой статье я расскажу о своем пути от новичка до любителя макияжа и поделюсь полезными советами для начинающих...",
    cover_image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
    category_id: 1,
    category: { id: 1, name: 'Beauty', name_ru: 'Красота', name_ky: 'Сулуулук' },
    author: { id: 2, full_name: 'Жылдыз Бекова' },
    published_at: new Date('2024-01-12').toISOString(),
    status: 'published'
  },
  {
    id: 3,
    title: "Рутина ухода за волосами: что работает",
    title_ru: "Рутина ухода за волосами: что работает",
    title_ky: "Чач багуу рутинасы: эмне иштейт",
    content: "После многих экспериментов я нашла идеальную рутину ухода за волосами. В этой статье поделюсь продуктами и техниками, которые действительно работают...",
    cover_image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    category_id: 4,
    category: { id: 4, name: 'Hair', name_ru: 'Волосы', name_ky: 'Чач' },
    author: { id: 1, full_name: 'Айгуль Абдыкадырова' },
    published_at: new Date('2024-01-14').toISOString(),
    status: 'published'
  },
  {
    id: 4,
    title: "Здоровый образ жизни и красота",
    title_ru: "Здоровый образ жизни и красота",
    title_ky: "Ден соолуктуу жашоо жана сулуулук",
    content: "Красота начинается изнутри. В этой статье я расскажу о том, как правильное питание, спорт и здоровый сон влияют на нашу внешность...",
    cover_image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    category_id: 2,
    category: { id: 2, name: 'Health', name_ru: 'Здоровье', name_ky: 'Ден соолук' },
    author: { id: 3, full_name: 'Нурбек Токтошев' },
    published_at: new Date('2024-01-16').toISOString(),
    status: 'published'
  }
]
