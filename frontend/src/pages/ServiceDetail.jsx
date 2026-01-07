import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import './ServiceDetail.css'

const ServiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchService()
  }, [id])

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`)
      setService(response.data)
    } catch (error) {
      console.error('Failed to fetch service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate(`/bookings/new/${id}`)
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!service) {
    return <div className="empty-state">Услуга не найдена</div>
  }

  return (
    <div className="service-detail">
      <div className="container">
        <div className="service-detail-content">
          <div className="service-detail-image">
            {service.image_url ? (
              <img src={service.image_url} alt={service.name} />
            ) : (
              <div className="image-placeholder">📸</div>
            )}
          </div>
          
          <div className="service-detail-info">
            <h1>{service.name_ru || service.name}</h1>
            <p className="service-description">
              {service.description_ru || service.description}
            </p>
            
            <div className="service-details">
              <div className="detail-item">
                <span className="detail-label">Цена:</span>
                <span className="detail-value">{service.price} сом</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Длительность:</span>
                <span className="detail-value">{service.duration_minutes} минут</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Категория:</span>
                <span className="detail-value">{service.category}</span>
              </div>
            </div>

            {service.professional && (
              <div className="professional-info">
                <h3>Мастер</h3>
                <Link
                  to={`/professionals/${service.professional.id}`}
                  className="professional-link"
                >
                  <div className="professional-avatar-small">
                    {service.professional.profile_image ? (
                      <img
                        src={service.professional.profile_image}
                        alt={service.professional.full_name}
                      />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {service.professional.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="professional-name">
                      {service.professional.full_name}
                    </div>
                    <div className="professional-rating">
                      <span className="rating-stars">
                        {'★'.repeat(Math.floor(service.professional.rating || 0))}
                      </span>
                      <span className="rating-value">
                        {service.professional.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="rating-count">
                        ({service.professional.total_reviews || 0} отзывов)
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            <button onClick={handleBook} className="btn-primary btn-book">
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail

