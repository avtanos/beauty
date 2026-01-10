import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import { mockNewsItems, mockBlogPosts } from '../mocks/newsData'
import SEO from '../components/SEO'
import './News.css'

const News = () => {
  const { t, language } = useLanguage()
  const [items, setItems] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [contentType, setContentType] = useState('all') // 'all', 'news', 'blog'
  const [loading, setLoading] = useState(true)
  const [useMock] = useState(true) // Используем мок-данные по умолчанию

  useEffect(() => {
    loadCategories()
    loadContent()
  }, [selectedCategory, contentType])

  const loadCategories = async () => {
    if (useMock) {
      // Мок-категории
      setCategories([
        { id: 1, name: 'Beauty', name_ru: 'Красота', name_ky: 'Сулуулук' },
        { id: 2, name: 'Health', name_ru: 'Здоровье', name_ky: 'Ден соолук' },
        { id: 3, name: 'Skincare', name_ru: 'Уход за кожей', name_ky: 'Тери багуу' },
        { id: 4, name: 'Hair', name_ru: 'Волосы', name_ky: 'Чач' },
        { id: 5, name: 'Trends', name_ru: 'Тренды', name_ky: 'Тренддер' }
      ])
      return
    }
    
    try {
      const response = await api.get('/news/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadContent = async () => {
    if (useMock) {
      setLoading(true)
      setTimeout(() => {
        const filteredNews = selectedCategory 
          ? mockNewsItems.filter(item => item.category_id === selectedCategory)
          : mockNewsItems
        
        const filteredBlog = selectedCategory
          ? mockBlogPosts.filter(post => post.category_id === selectedCategory)
          : mockBlogPosts
        
        if (contentType === 'news') {
          setItems(filteredNews)
          setBlogPosts([])
        } else if (contentType === 'blog') {
          setItems([])
          setBlogPosts(filteredBlog)
        } else {
          setItems(filteredNews)
          setBlogPosts(filteredBlog)
        }
        setLoading(false)
      }, 500)
      return
    }

    try {
      setLoading(true)
      const params = { language }
      if (selectedCategory) {
        params.category_id = selectedCategory
      }
      
      // Загружаем новости
      if (contentType === 'all' || contentType === 'news') {
        const newsResponse = await api.get('/news/items', { params })
        setItems(newsResponse.data)
      } else {
        setItems([])
      }
      
      // Загружаем блог посты
      if (contentType === 'all' || contentType === 'blog') {
        const blogResponse = await api.get('/blog/posts', { params })
        setBlogPosts(blogResponse.data)
      } else {
        setBlogPosts([])
      }
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (category) => {
    if (!category) return ''
    if (language === 'ru' && category.name_ru) return category.name_ru
    if (language === 'ky' && category.name_ky) return category.name_ky
    return category.name
  }

  const getTitle = (post) => {
    if (language === 'ru' && post.title_ru) return post.title_ru
    if (language === 'ky' && post.title_ky) return post.title_ky
    return post.title
  }

  const allContent = [...items, ...blogPosts]
  const hasContent = items.length > 0 || blogPosts.length > 0

  const baseUrl = window.location.origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": t('news.title'),
    "description": t('seo.news.description'),
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": allContent.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": getTitle(item),
          "description": item.description || item.content_ru || item.content_ky || item.content
        }
      }))
    }
  }

  return (
    <div className="news-page">
      <SEO
        title={t('seo.news.title')}
        description={t('seo.news.description')}
        keywords={t('seo.news.keywords')}
        type="website"
        schema={schema}
      />
      <div className="container">
        <h1>{t('news.title') || 'Полезное'}</h1>
        
        <div className="content-type-tabs">
          <button
            className={contentType === 'all' ? 'active' : ''}
            onClick={() => setContentType('all')}
          >
            {t('news.allContent') || 'Все'}
          </button>
          <button
            className={contentType === 'news' ? 'active' : ''}
            onClick={() => setContentType('news')}
          >
            {t('news.news') || 'Новости'}
          </button>
          <button
            className={contentType === 'blog' ? 'active' : ''}
            onClick={() => setContentType('blog')}
          >
            {t('news.blog') || 'Блог'}
          </button>
        </div>
        
        <div className="news-filters">
          <button
            className={selectedCategory === null ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            {t('news.all') || 'Все'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? 'active' : ''}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {getCategoryName(cat)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">{t('common.loading') || 'Загрузка...'}</div>
        ) : !hasContent ? (
          <div className="no-items">
            {t('news.noItems') || 'Контент не найден'}
          </div>
        ) : (
          <div className="content-list">
            {/* Новости */}
            {items.map(item => (
              <div key={`news-${item.id}`} className="content-item news-item">
                {item.image_url && (
                  <div className="content-item-image">
                    <img src={item.image_url} alt={item.title} />
                  </div>
                )}
                <div className="content-item-content">
                  {item.category && (
                    <span className="content-category">{getCategoryName(item.category)}</span>
                  )}
                  <span className="content-type-badge news-badge">{t('news.news') || 'Новость'}</span>
                  <h3>{item.title}</h3>
                  {item.excerpt && (
                    <p className="content-excerpt">{item.excerpt}</p>
                  )}
                  <div className="content-item-footer">
                    {item.source && (
                      <span className="content-source">{item.source.name}</span>
                    )}
                    {item.published_at && (
                      <span className="content-date">
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                    )}
                    {item.original_url && (
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                      >
                        {t('news.readMore') || 'Читать далее →'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Блог посты */}
            {blogPosts.map(post => (
              <Link key={`blog-${post.id}`} to={`/news/blog/${post.id}`} className="content-item blog-item">
                {post.cover_image_url && (
                  <div className="content-item-image">
                    <img src={post.cover_image_url} alt={getTitle(post)} />
                  </div>
                )}
                <div className="content-item-content">
                  {post.category && (
                    <span className="content-category">{getCategoryName(post.category)}</span>
                  )}
                  <span className="content-type-badge blog-badge">{t('news.blog') || 'Блог'}</span>
                  <h3>{getTitle(post)}</h3>
                  {post.content && (
                    <p className="content-excerpt">
                      {post.content.substring(0, 150)}...
                    </p>
                  )}
                  <div className="content-item-footer">
                    {post.author && (
                      <span className="content-author">{post.author.full_name}</span>
                    )}
                    {post.published_at && (
                      <span className="content-date">
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className="content-link">
                      {t('news.readMore') || 'Читать далее →'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default News
