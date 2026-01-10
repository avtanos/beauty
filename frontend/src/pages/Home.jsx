import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import { Sparkles, Heart, Droplet, Scissors, Hand, Home as HomeIcon, Star, Clock, Shield } from 'lucide-react'
import SEO from '../components/SEO'
import './Home.css'
import '../styles/3d-icons.css'

const Home = () => {
  const { t, language } = useLanguage()
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
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const serviceCategories = [
    { icon: Sparkles, category: 'beauty', gradient: 'icon-3d-gradient-beauty' },
    { icon: Droplet, category: 'spa', gradient: 'icon-3d-gradient-spa' },
    { icon: Hand, category: 'massage', gradient: 'icon-3d-gradient-massage' },
    { icon: Scissors, category: 'haircut', gradient: 'icon-3d-gradient' },
    { icon: Heart, category: 'nail_care', gradient: 'icon-3d-gradient-beauty' },
    { icon: HomeIcon, category: 'cleaning', gradient: 'icon-3d-gradient-spa' },
  ]

  const getServiceName = (service) => {
    if (language === 'ru' && service.name_ru) return service.name_ru
    if (language === 'ky' && service.name_ky) return service.name_ky
    return service.name
  }
  
  const getServiceDescription = (service) => {
    if (language === 'ru' && service.description_ru) return service.description_ru
    if (language === 'ky' && service.description_ky) return service.description_ky
    return service.description
  }

  if (error) {
    return (
      <div className="home">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>{t('common.error')}</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary" style={{ marginTop: '1rem' }}>
            {language === 'ru' ? 'Попробовать снова' : language === 'ky' ? 'Кайра аракет кылуу' : 'Try again'}
          </button>
        </div>
      </div>
    )
  }

  const baseUrl = window.location.origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Suluu",
    "description": t('seo.home.description'),
    "url": baseUrl,
    "logo": `${baseUrl}/vite.svg`,
    "image": `${baseUrl}/vite.svg`,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Central Asia",
      "addressCountry": ["KG", "KZ"]
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "41.2044",
        "longitude": "74.7661"
      }
    },
    "serviceType": "Beauty Services",
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100+"
    }
  }

  return (
    <div className="home">
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.home.keywords')}
        type="website"
        schema={schema}
      />
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-inner">
              <h1 className="hero-title">
                {t('home.heroTitle')}
              </h1>
              <p className="hero-subtitle">
                {t('home.heroSubtitle')}
              </p>
              <div className="hero-buttons">
                <Link to="/services" className="btn-primary btn-large">
                  {t('home.selectService')}
                  <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link to="/professionals" className="btn-secondary btn-large">
                  {t('home.findMaster')}
                  <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories" id="services">
        <div className="container">
          <h2 className="section-title">{t('home.categories')}</h2>
          <p className="section-sub">{t('home.description')}</p>
          <div className="categories-grid">
            {serviceCategories.map((cat) => {
              const IconComponent = cat.icon
              return (
                <Link
                  key={cat.category}
                  to={`/services?category=${cat.category}`}
                  className="category-card"
                >
                  <div className="category-icon">
                    <IconComponent size={28} strokeWidth={1.9} />
                  </div>
                  <h3>{t(`services.categories.${cat.category}`)}</h3>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.popularServices')}</h2>
            <Link to="/services" className="section-link">
              {t('home.viewAll')} →
            </Link>
          </div>
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="service-card-simple"
                >
                  <h3 className="service-title-simple">{getServiceName(service)}</h3>
                  <p className="service-description-simple">
                    {getServiceDescription(service)}
                  </p>
                  <div className="service-footer-simple">
                    <span className="service-price-simple">
                      {service.price} {language === 'ky' ? 'сом' : 'сом'}
                    </span>
                    <span className="service-duration-simple">
                      {service.duration_minutes} {t('services.minutes')}
                    </span>
                  </div>
                  {service.professional && (
                    <div className="service-master-simple">
                      {language === 'ru' ? 'Мастер: ' : language === 'ky' ? 'Устат: ' : 'Master: '}
                      {service.professional.full_name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Professionals Section */}
      <section className="section professionals-section" id="masters">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.topMasters')}</h2>
            <Link to="/professionals" className="section-link">
              {t('home.viewAll')} →
            </Link>
          </div>
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : (
            <div className="professionals-grid">
              {professionals.map((professional) => {
                const rating = professional.rating?.toFixed(1) || '0.0'
                const reviewCount = professional.total_reviews || 0
                const initial = professional.full_name?.charAt(0)?.toUpperCase() || '?'
                
                return (
                  <Link
                    key={professional.id}
                    to={`/professionals/${professional.id}`}
                    className="master-card-vertical"
                  >
                    <div className="master-avatar-large">
                      {professional.profile_image ? (
                        <img src={professional.profile_image} alt={professional.full_name} />
                      ) : (
                        <span className="avatar-initial">{initial}</span>
                      )}
                    </div>
                    <div className="master-name-large">{professional.full_name}</div>
                    <div className="master-rating-large">
                      <span className="stars">
                        {'★'.repeat(5)}
                      </span>
                      <span className="rating-value-large">{rating}</span>
                      <span className="rating-count-large">({reviewCount})</span>
                    </div>
                    {professional.bio && (
                      <div className="master-bio-large">{professional.bio}</div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Beauty Tracker Section */}
      <section className="tracker" id="tracker">
        <div className="container">
          <div className="tracker-card">
            <div className="tracker-left">
              <h3 className="tracker-title">
                {language === 'ru' ? 'Beauty Tracker — забота о себе каждый день' :
                 language === 'ky' ? 'Beauty Tracker — ар күнү өзүңүзгө кам көрүү' :
                 'Beauty Tracker — self-care every day'}
              </h3>
              <p className="tracker-desc">
                {language === 'ru' ? '30-дневная программа привычек для лица, тела и здоровья. Доступна в личном кабинете — дни открываются последовательно.' :
                 language === 'ky' ? 'Бет, дене жана ден соолук үчүн кылык-жоруктардын 30 күндүк программасы. Жеке кабинетте жеткиликтүү — күндөр кезектешип ачылат.' :
                 '30-day habit program for face, body and health. Available in personal cabinet — days open sequentially.'}
              </p>

              <div className="benefits">
                <div className="benefit">
                  <div className="b-ic">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="#FF6B6B" strokeWidth="1.7"/>
                      <path d="M12 7v5l3 2" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="b-title">
                      {language === 'ru' ? 'Ежедневная рутина' : language === 'ky' ? 'Күн сайын рутина' : 'Daily routine'}
                    </div>
                    <div className="b-text">
                      {language === 'ru' ? 'Короткие задачи на день без перегруза.' :
                       language === 'ky' ? 'Чыңалуусуз күнүн кыскача милдеттери.' :
                       'Short daily tasks without overload.'}
                    </div>
                  </div>
                </div>

                <div className="benefit">
                  <div className="b-ic">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M12 21s-7-4.5-9-9a5.3 5.3 0 0 1 9-5 5.3 5.3 0 0 1 9 5c-2 4.5-9 9-9 9Z" stroke="#FF6B6B" strokeWidth="1.7" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="b-title">
                      {language === 'ru' ? 'Лицо и тело' : language === 'ky' ? 'Бет жана дене' : 'Face and body'}
                    </div>
                    <div className="b-text">
                      {language === 'ru' ? 'Уход + здоровье + восстановление.' :
                       language === 'ky' ? 'Багуу + ден соолук + калыбына келтирүү.' :
                       'Care + health + recovery.'}
                    </div>
                  </div>
                </div>

                <div className="benefit">
                  <div className="b-ic">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M4 12h16" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                      <path d="M12 4v16" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="b-title">
                      {language === 'ru' ? 'Последовательные дни' : language === 'ky' ? 'Кезектешип күндөр' : 'Sequential days'}
                    </div>
                    <div className="b-text">
                      {language === 'ru' ? 'День N доступен после N-1.' :
                       language === 'ky' ? 'N күн N-1ден кийин жеткиликтүү.' :
                       'Day N available after N-1.'}
                    </div>
                  </div>
                </div>

                <div className="benefit">
                  <div className="b-ic">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M4 19V5" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                      <path d="M4 19h16" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                      <path d="M7 15l3-3 3 2 5-6" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="b-title">
                      {language === 'ru' ? 'Прогресс' : language === 'ky' ? 'Прогресс' : 'Progress'}
                    </div>
                    <div className="b-text">
                      {language === 'ru' ? 'Серия дней, % выполнения и мотивация.' :
                       language === 'ky' ? 'Күндөрдүн сериясы, % аткаруу жана мотивация.' :
                       'Day streak, completion % and motivation.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="tracker-right" aria-label="Превью трекера">
              <div className="progress-head">
                <div className="progress-title">
                  {language === 'ru' ? 'Сегодня' : language === 'ky' ? 'Бүгүн' : 'Today'}
                </div>
                <div className="progress-pill">
                  {language === 'ru' ? 'День 1 из 30' : language === 'ky' ? '1-күн 30дон' : 'Day 1 of 30'}
                </div>
              </div>

              <div className="checklist">
                <div className="check">
                  <span className="dot"></span>
                  {language === 'ru' ? 'Умывание + SPF' : language === 'ky' ? 'Жууу + SPF' : 'Cleansing + SPF'}
                </div>
                <div className="check">
                  <span className="dot"></span>
                  {language === 'ru' ? 'Увлажнение тела' : language === 'ky' ? 'Денени нымдатуу' : 'Body moisturizing'}
                </div>
                <div className="check">
                  <span className="dot"></span>
                  {language === 'ru' ? '10 минут растяжки' : language === 'ky' ? '10 мүнөт созуу' : '10 min stretching'}
                </div>
                <div className="check">
                  <span className="dot"></span>
                  {language === 'ru' ? 'Вода 6–8 стаканов' : language === 'ky' ? 'Суу 6–8 стакан' : 'Water 6–8 glasses'}
                </div>
              </div>

              <Link to="/beauty-tracker" className="tracker-cta">
                {language === 'ru' ? 'Начать 30 дней' : language === 'ky' ? '30 күндү баштоо' : 'Start 30 days'}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features">
        <div className="container">
          <h2 className="section-title">{t('home.whyChooseUs')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-large">
                <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
                  <path d="M12 17.3l-5.1 2.7 1-5.7-4.1-4 5.8-.8L12 4l2.4 5.5 5.8.8-4.1 4 1 5.7L12 17.3Z" fill="#FF6B6B" stroke="#FF6B6B" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>{t('home.highRating')}</h3>
              <p>{t('home.highRatingDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">
                <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
                  <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11Z" stroke="#FF6B6B" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
                  <path d="M9 23V14h6v9" stroke="#FF6B6B" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <h3>{t('home.homeServices')}</h3>
              <p>{t('home.homeServicesDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">
                <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="#FF6B6B" strokeWidth="2.2" fill="none"/>
                  <path d="M12 7v5l3 2" stroke="#FF6B6B" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <h3>{t('home.convenientTime')}</h3>
              <p>{t('home.convenientTimeDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">
                <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="#FF6B6B" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <h3>{t('home.safePayment')}</h3>
              <p>{t('home.safePaymentDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

