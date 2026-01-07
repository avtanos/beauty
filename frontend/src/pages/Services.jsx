import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import './Services.css'

const Services = () => {
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
    { value: 'beauty', label: 'Красота' },
    { value: 'spa', label: 'Спа' },
    { value: 'massage', label: 'Массаж' },
    { value: 'haircut', label: 'Стрижка' },
    { value: 'nail_care', label: 'Уход за ногтями' },
    { value: 'cleaning', label: 'Уборка' },
    { value: 'repair', label: 'Ремонт' },
  ]

  return (
    <div className="services-page">
      <div className="container">
        <h1 className="page-title">Услуги</h1>
        
        <div className="filters">
          <Link
            to="/services"
            className={`filter-btn ${!category ? 'active' : ''}`}
          >
            Все
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/services?category=${cat.value}`}
              className={`filter-btn ${category === cat.value ? 'active' : ''}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>Услуги не найдены</p>
          </div>
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
                  {service.professional && (
                    <div className="service-professional">
                      Мастер: {service.professional.full_name}
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

