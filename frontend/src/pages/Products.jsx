import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import { mockProducts } from '../mocks/shopData'
import SEO from '../components/SEO'
import './Products.css'

const Products = () => {
  const { t, language } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [useMock] = useState(true) // Используем мок-данные по умолчанию

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [selectedCategory])

  const loadCategories = async () => {
    if (useMock) {
      setCategories([
        { id: 1, name: 'Skincare Face', name_ru: 'Уход за лицом', name_ky: 'Бет багуу' },
        { id: 2, name: 'Skincare Body', name_ru: 'Уход за телом', name_ky: 'Дене багуу' },
        { id: 3, name: 'Haircare', name_ru: 'Уход за волосами', name_ky: 'Чач багуу' },
        { id: 4, name: 'Makeup', name_ru: 'Декоративная косметика', name_ky: 'Макияж' },
        { id: 5, name: 'Tools & Devices', name_ru: 'Инструменты и гаджеты', name_ky: 'Куралдар жана гаджеттер' }
      ])
      return
    }
    
    try {
      const response = await api.get('/products/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProducts = async () => {
    if (useMock) {
      setLoading(true)
      setTimeout(() => {
        const filtered = selectedCategory
          ? mockProducts.filter(p => p.category_id === selectedCategory)
          : mockProducts
        setProducts(filtered)
        setLoading(false)
      }, 500)
      return
    }

    try {
      setLoading(true)
      const params = {}
      if (selectedCategory) {
        params.category_id = selectedCategory
      }
      const response = await api.get('/products/products', { params })
      setProducts(response.data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getName = (product) => {
    if (language === 'ru' && product.name_ru) return product.name_ru
    if (language === 'ky' && product.name_ky) return product.name_ky
    return product.name
  }

  const getCategoryName = (category) => {
    if (!category) return ''
    if (language === 'ru' && category.name_ru) return category.name_ru
    if (language === 'ky' && category.name_ky) return category.name_ky
    return category.name
  }

  const formatPrice = (price, currency = 'KGS') => {
    return `${price} ${currency}`
  }

  const baseUrl = window.location.origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Suluu Shop",
    "description": t('seo.shop.description'),
    "url": `${baseUrl}/shop`,
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": products.length,
      "lowPrice": products.length > 0 ? Math.min(...products.map(p => p.price || 0)) : 0,
      "highPrice": products.length > 0 ? Math.max(...products.map(p => p.price || 0)) : 0,
      "priceCurrency": "KGS"
    }
  }

  return (
    <div className="products-page">
      <SEO
        title={t('seo.shop.title')}
        description={t('seo.shop.description')}
        keywords={t('seo.shop.keywords')}
        type="website"
        schema={schema}
      />
      <div className="container">
        <h1 className="page-title">{t('shop.title')}</h1>
        
        <div className="products-filters">
          <button
            className={selectedCategory === null ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            {t('shop.all') || 'Все'}
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
          <div className="loading">{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            {t('shop.noProducts') || 'Товары не найдены'}
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <Link key={product.id} to={`/shop/${product.id}`} className="product-card">
                {product.images && product.images.length > 0 && (
                  <div className="product-card-image">
                    <img src={product.images[0].image_url} alt={getName(product)} />
                  </div>
                )}
                <div className="product-card-content">
                  {product.category && (
                    <span className="product-category">{getCategoryName(product.category)}</span>
                  )}
                  <h3>{getName(product)}</h3>
                  <div className="product-price">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  {product.seller && (
                    <div className="product-seller">
                      {t('shop.seller') || 'Продавец'}: {product.seller.full_name}
                    </div>
                  )}
                  {product.stock_qty !== null && (
                    <div className={`product-stock ${product.stock_qty > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock_qty > 0 
                        ? `${t('shop.inStock') || 'В наличии'}: ${product.stock_qty}`
                        : t('shop.outOfStock') || 'Нет в наличии'
                      }
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
