import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import SEO from '../components/SEO'
import { Sparkles } from 'lucide-react'
import './Services.css'

const Services = () => {
  const { t, language } = useLanguage()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  useEffect(() => {
    fetchServices()
  }, [category])

  const fetchServices = async () => {
    try {
      const params = category ? { category } : {}
      const response = await api.get('/services', { params })
      setServices(response.data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'beauty' },
    { value: 'spa' },
    { value: 'massage' },
    { value: 'haircut' },
    { value: 'nail_care' },
    { value: 'cleaning' },
    { value: 'repair' },
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

  const baseUrl = window.location.origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Beauty Services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Suluu"
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "41.2044",
        "longitude": "74.7661"
      }
    }
  }

  return (
    <div className="services-page">
      <SEO
        title={t('seo.services.title')}
        description={t('seo.services.description')}
        keywords={t('seo.services.keywords')}
        type="website"
        schema={schema}
      />
      <div className="container">
        <h1 className="page-title">{t('services.title')}</h1>
        
        <div className="filters">
          <Link
            to="/services"
            className={`filter-btn ${!category ? 'active' : ''}`}
          >
            {language === 'ru' ? 'Все' : language === 'ky' ? 'Баары' : 'All'}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/services?category=${cat.value}`}
              className={`filter-btn ${category === cat.value ? 'active' : ''}`}
            >
              {t(`services.categories.${cat.value}`)}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>{language === 'ru' ? 'Услуги не найдены' : language === 'ky' ? 'Кызматтар табылган жок' : 'No services found'}</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="service-card"
              >
                <div className="service-image">
                  {service.image_url ? (
                    <img src={service.image_url} alt={getServiceName(service)} />
                  ) : (
                    <div className="service-image-placeholder">
                      <Sparkles size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="service-content">
                  <h3>{getServiceName(service)}</h3>
                  <p className="service-description">
                    {getServiceDescription(service)}
                  </p>
                  <div className="service-footer">
                    <span className="service-price">
                      {service.price} {language === 'ky' ? 'сом' : 'сом'}
                    </span>
                    <span className="service-duration">
                      {service.duration_minutes} {t('services.minutes')}
                    </span>
                  </div>
                  {service.professional && (
                    <div className="service-professional">
                      {t('services.master')}: {service.professional.full_name}
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

export default Services

