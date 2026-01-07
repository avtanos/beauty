import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { Sparkles, Heart, Droplet, Scissors, Hand, Home as HomeIcon, Star, Clock, Shield } from 'lucide-react'
import './Home.css'
import '../styles/3d-icons.css'

const Home = () => {
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [servicesRes, professionalsRes] = await Promise.all([
        api.get('/services?limit=6').catch(err => {
          // Если это мок-ответ или реальная ошибка, обрабатываем
          if (err.mockResponse || err.isMock) {
            return { data: err.data || [] }
          }
          console.error('Error fetching services:', err)
          return { data: [] }
        }),
        api.get('/users/professionals?limit=4').catch(err => {
          // Если это мок-ответ или реальная ошибка, обрабатываем
          if (err.mockResponse || err.isMock) {
            return { data: err.data || [] }
          }
          console.error('Error fetching professionals:', err)
          return { data: [] }
        })
      ])
      setServices(servicesRes.data || [])
      setProfessionals(professionalsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Не удалось загрузить данные. Проверьте подключение к серверу.')
    } finally {
      setLoading(false)
    }
  }

  const serviceCategories = [
    { name: 'Красота', icon: Sparkles, category: 'beauty', gradient: 'icon-3d-gradient-beauty' },
    { name: 'Спа', icon: Droplet, category: 'spa', gradient: 'icon-3d-gradient-spa' },
    { name: 'Массаж', icon: Hand, category: 'massage', gradient: 'icon-3d-gradient-massage' },
    { name: 'Стрижка', icon: Scissors, category: 'haircut', gradient: 'icon-3d-gradient' },
    { name: 'Уход за ногтями', icon: Heart, category: 'nail_care', gradient: 'icon-3d-gradient-beauty' },
    { name: 'Уборка', icon: HomeIcon, category: 'cleaning', gradient: 'icon-3d-gradient-spa' },
  ]

  if (error) {
    return (
      <div className="home">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary" style={{ marginTop: '1rem' }}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Профессиональные услуги на дому
            </h1>
            <p className="hero-subtitle">
              Более 4.8 рейтинг мастеров. Красота, спа, массаж и многое другое прямо у вас дома
            </p>
            <div className="hero-buttons">
              <Link to="/services" className="btn-primary btn-large">
                Выбрать услугу
              </Link>
              <Link to="/professionals" className="btn-secondary btn-large">
                Найти мастера
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Категории услуг</h2>
          <div className="categories-grid">
            {serviceCategories.map((cat) => {
              const IconComponent = cat.icon
              return (
                <Link
                  key={cat.category}
                  to={`/services?category=${cat.category}`}
                  className="category-card category-card-3d"
                >
                  <div className={`category-icon icon-3d icon-3d-medium ${cat.gradient}`}>
                    <IconComponent size={48} strokeWidth={2} />
                  </div>
                  <h3>{cat.name}</h3>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Популярные услуги</h2>
            <Link to="/services" className="section-link">
              Смотреть все →
            </Link>
          </div>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="service-card"
                >
                  {service.image_url && (
                    <div className="service-image">
                      <img src={service.image_url} alt={service.name} />
                    </div>
                  )}
                  <div className="service-content">
                    <h3>{service.name_ru || service.name}</h3>
                    <p className="service-description">
                      {service.description_ru || service.description}
                    </p>
                    <div className="service-footer">
                      <span className="service-price">
                        {service.price} сом
                      </span>
                      <span className="service-duration">
                        {service.duration_minutes} мин
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Professionals Section */}
      <section className="professionals-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Топ мастера</h2>
            <Link to="/professionals" className="section-link">
              Смотреть всех →
            </Link>
          </div>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="professionals-grid">
              {professionals.map((professional) => (
                <Link
                  key={professional.id}
                  to={`/professionals/${professional.id}`}
                  className="professional-card"
                >
                  <div className="professional-avatar">
                    {professional.profile_image ? (
                      <img src={professional.profile_image} alt={professional.full_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {professional.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="professional-info">
                    <h3>{professional.full_name}</h3>
                    <div className="professional-rating">
                      <span className="rating-stars">
                        {'★'.repeat(Math.floor(professional.rating || 0))}
                      </span>
                      <span className="rating-value">
                        {professional.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="rating-count">
                        ({professional.total_reviews || 0})
                      </span>
                    </div>
                    {professional.bio && (
                      <p className="professional-bio">{professional.bio}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-3d icon-3d-large icon-3d-animated">
                <Star size={64} fill="currentColor" strokeWidth={1.5} />
              </div>
              <h3>Высокий рейтинг</h3>
              <p>Все мастера имеют рейтинг выше 4.8</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-3d icon-3d-large icon-3d-animated">
                <HomeIcon size={64} strokeWidth={2} />
              </div>
              <h3>Услуги на дому</h3>
              <p>Выезд мастера к вам домой</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-3d icon-3d-large icon-3d-animated">
                <Clock size={64} strokeWidth={2} />
              </div>
              <h3>Удобное время</h3>
              <p>Выбирайте удобное для вас время</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-3d icon-3d-large icon-3d-animated">
                <Shield size={64} strokeWidth={2} />
              </div>
              <h3>Безопасная оплата</h3>
              <p>Безопасные способы оплаты</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

