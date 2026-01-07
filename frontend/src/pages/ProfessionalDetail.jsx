import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import './ProfessionalDetail.css'

const ProfessionalDetail = () => {
  const { id } = useParams()
  const [professional, setProfessional] = useState(null)
  const [services, setServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [professionalRes, servicesRes, reviewsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/services?professional_id=${id}`),
        api.get(`/reviews?professional_id=${id}`)
      ])
      setProfessional(professionalRes.data)
      setServices(servicesRes.data)
      setReviews(reviewsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!professional) {
    return <div className="empty-state">Мастер не найден</div>
  }

  return (
    <div className="professional-detail">
      <div className="container">
        <div className="professional-header">
          <div className="professional-avatar-large">
            {professional.profile_image ? (
              <img
                src={professional.profile_image}
                alt={professional.full_name}
              />
            ) : (
              <div className="avatar-placeholder-large">
                {professional.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="professional-header-info">
            <h1>{professional.full_name}</h1>
            <div className="professional-rating-large">
              <span className="rating-stars">
                {'★'.repeat(Math.floor(professional.rating || 0))}
              </span>
              <span className="rating-value">
                {professional.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="rating-count">
                ({professional.total_reviews || 0} отзывов)
              </span>
            </div>
            {professional.experience_years && (
              <p className="professional-experience">
                Опыт работы: {professional.experience_years} лет
              </p>
            )}
            {professional.bio && (
              <p className="professional-bio">{professional.bio}</p>
            )}
          </div>
        </div>

        {services.length > 0 && (
          <section className="professional-services">
            <h2>Услуги мастера</h2>
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
          </section>
        )}

        {reviews.length > 0 && (
          <section className="professional-reviews">
            <h2>Отзывы</h2>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-client">
                      {review.client?.full_name || 'Аноним'}
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  <div className="review-date">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProfessionalDetail

