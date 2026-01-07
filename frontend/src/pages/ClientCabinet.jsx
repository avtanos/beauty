import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { format } from 'date-fns'
import ru from 'date-fns/locale/ru'
import {
  BarChart3, Calendar, Star, DollarSign, Heart, User,
  Eye, MessageSquare, Plus, X
} from 'lucide-react'
import './ClientCabinet.css'

const ClientCabinet = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    if (user?.role !== 'client') {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'dashboard') {
        const response = await api.get('/client/stats')
        setStats(response.data)
      } else if (activeTab === 'bookings') {
        const response = await api.get('/client/bookings')
        setBookings(response.data)
      } else if (activeTab === 'reviews') {
        const response = await api.get('/client/reviews')
        setReviews(response.data)
      } else if (activeTab === 'favorites') {
        const response = await api.get('/client/favorites/professionals')
        setFavorites(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReview = async (bookingId) => {
    try {
      await api.post('/reviews', {
        booking_id: bookingId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      })
      setSelectedBooking(null)
      setReviewForm({ rating: 5, comment: '' })
      fetchData()
      alert('Отзыв успешно добавлен!')
    } catch (error) {
      console.error('Failed to create review:', error)
      alert('Ошибка при создании отзыва')
    }
  }

  if (user?.role !== 'client') {
    return null
  }

  return (
    <div className="client-cabinet">
      <div className="cabinet-container">
        <div className="cabinet-sidebar">
          <div className="cabinet-header">
            <User size={32} className="cabinet-logo" />
            <h2>Мой кабинет</h2>
          </div>
          <nav className="cabinet-nav">
            <button
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              <span>Дашборд</span>
            </button>
            <button
              className={activeTab === 'bookings' ? 'active' : ''}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={20} />
              <span>Мои заказы</span>
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={20} />
              <span>Мои отзывы</span>
            </button>
            <button
              className={activeTab === 'favorites' ? 'active' : ''}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={20} />
              <span>Избранные мастера</span>
            </button>
          </nav>
        </div>

        <div className="cabinet-content">
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <DashboardTab stats={stats} />
              )}
              {activeTab === 'bookings' && (
                <BookingsTab
                  bookings={bookings}
                  onReview={(booking) => setSelectedBooking(booking)}
                />
              )}
              {activeTab === 'reviews' && (
                <ReviewsTab reviews={reviews} />
              )}
              {activeTab === 'favorites' && (
                <FavoritesTab favorites={favorites} />
              )}
            </>
          )}
        </div>
      </div>

      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          onSubmit={handleCreateReview}
          onClose={() => {
            setSelectedBooking(null)
            setReviewForm({ rating: 5, comment: '' })
          }}
        />
      )}
    </div>
  )
}

const DashboardTab = ({ stats }) => {
  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="stat-card">
      <div className={`stat-icon stat-icon-${color}`}>
        <Icon size={32} />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  )

  return (
    <div className="dashboard-tab">
      <h1 className="page-title">Мой дашборд</h1>
      
      <div className="stats-grid">
        <StatCard
          icon={Calendar}
          title="Заказы"
          value={stats.bookings.total}
          subtitle={`${stats.bookings.completed} завершено, ${stats.bookings.pending} ожидает`}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          title="Потрачено"
          value={`${stats.spending.total.toLocaleString()} сом`}
          subtitle="Всего потрачено"
          color="red"
        />
        <StatCard
          icon={Star}
          title="Отзывы"
          value={stats.reviews.total}
          subtitle="Оставлено отзывов"
          color="yellow"
        />
        <StatCard
          icon={Calendar}
          title="Активность"
          value={stats.bookings.recent_30_days}
          subtitle="Заказов за месяц"
          color="green"
        />
      </div>
    </div>
  )
}

const BookingsTab = ({ bookings, onReview }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает подтверждения', class: 'status-pending' },
      confirmed: { label: 'Подтвержден', class: 'status-confirmed' },
      in_progress: { label: 'В процессе', class: 'status-progress' },
      completed: { label: 'Завершен', class: 'status-completed', canReview: true },
      cancelled: { label: 'Отменен', class: 'status-cancelled' }
    }
    return statusMap[status] || { label: status, class: '' }
  }

  return (
    <div className="bookings-tab">
      <div className="section-header">
        <h1 className="page-title">Мои заказы</h1>
        <Link to="/services" className="btn-primary">
          <Plus size={20} />
          Новый заказ
        </Link>
      </div>
      
      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет заказов</p>
            <Link to="/services" className="btn-primary">
              Выбрать услугу
            </Link>
          </div>
        ) : (
          bookings.map((booking) => {
            const statusInfo = getStatusBadge(booking.status)
            const hasReview = booking.review !== null
            
            return (
              <div key={booking.id} className="booking-card-client">
                <div className="booking-header">
                  <div>
                    <h3>{booking.service?.name_ru || booking.service?.name}</h3>
                    <p className="booking-date">
                      {format(new Date(booking.booking_date), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <div className="booking-info">
                  <div className="info-item">
                    <strong>Мастер:</strong> {booking.professional?.full_name}
                  </div>
                  <div className="info-item">
                    <strong>Адрес:</strong> {booking.address}
                  </div>
                  <div className="info-item">
                    <strong>Цена:</strong> {booking.total_price} сом
                  </div>
                  {booking.notes && (
                    <div className="info-item">
                      <strong>Примечания:</strong> {booking.notes}
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {statusInfo.canReview && !hasReview && (
                    <button
                      onClick={() => onReview(booking)}
                      className="btn-primary btn-sm"
                    >
                      <Star size={16} />
                      Оставить отзыв
                    </button>
                  )}
                  {hasReview && (
                    <span className="review-badge">Отзыв оставлен</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const ReviewsTab = ({ reviews }) => {
  return (
    <div className="reviews-tab">
      <h1 className="page-title">Мои отзывы</h1>
      
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>Вы еще не оставляли отзывы</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card-client">
              <div className="review-header">
                <div>
                  <h3>Мастер #{review.professional_id}</h3>
                  <p className="review-date">
                    {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
                <div className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const FavoritesTab = ({ favorites }) => {
  return (
    <div className="favorites-tab">
      <h1 className="page-title">Избранные мастера</h1>
      
      <div className="favorites-list">
        {favorites.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет избранных мастеров</p>
            <Link to="/professionals" className="btn-primary">
              Найти мастера
            </Link>
          </div>
        ) : (
          <div className="professionals-grid">
            {favorites.map((professional) => (
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
    </div>
  )
}

const ReviewModal = ({ booking, reviewForm, setReviewForm, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(booking.id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Оставить отзыв</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Услуга</label>
            <p className="service-name">{booking.service?.name_ru || booking.service?.name}</p>
          </div>
          <div className="form-group">
            <label>Мастер</label>
            <p className="professional-name">{booking.professional?.full_name}</p>
          </div>
          <div className="form-group">
            <label>Рейтинг *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating })}
                  className={`rating-star ${reviewForm.rating >= rating ? 'active' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Комментарий</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows="4"
              placeholder="Оставьте ваш отзыв..."
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn-primary">
              Отправить отзыв
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientCabinet

