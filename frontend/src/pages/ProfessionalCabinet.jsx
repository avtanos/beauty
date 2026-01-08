import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import {
  BarChart3, Briefcase, Calendar, Star, DollarSign, Plus,
  Edit, Trash2, Check, X, Clock, TrendingUp, Users, Sparkles
} from 'lucide-react'
import './ProfessionalCabinet.css'

const ProfessionalCabinet = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(null)

  useEffect(() => {
    if (user?.role !== 'professional') {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'dashboard') {
        const response = await api.get('/professional/stats')
        setStats(response.data)
      } else if (activeTab === 'services') {
        const response = await api.get('/professional/services')
        setServices(response.data)
      } else if (activeTab === 'bookings') {
        const response = await api.get('/professional/bookings')
        setBookings(response.data)
      } else if (activeTab === 'reviews') {
        const response = await api.get('/professional/reviews')
        setReviews(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (serviceData) => {
    try {
      await api.post('/professional/services', serviceData)
      setShowServiceForm(false)
      fetchData()
    } catch (error) {
      console.error('Failed to create service:', error)
      alert('Ошибка при создании услуги')
    }
  }

  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      await api.put(`/professional/services/${serviceId}`, serviceData)
      setEditingService(null)
      fetchData()
    } catch (error) {
      console.error('Failed to update service:', error)
      alert('Ошибка при обновлении услуги')
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Вы уверены, что хотите деактивировать эту услугу?')) return
    try {
      await api.delete(`/professional/services/${serviceId}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/professional/bookings/${bookingId}/status?status=${status}`)
      fetchData()
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  if (user?.role !== 'professional') {
    return null
  }

  return (
    <div className="professional-cabinet">
      <div className="cabinet-container">
        <div className="cabinet-sidebar">
          <div className="cabinet-header">
            <Briefcase size={32} className="cabinet-logo" />
            <h2>{t('nav.masterCabinet')}</h2>
          </div>
          <nav className="cabinet-nav">
            <button
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              <span>{t('professionalCabinet.dashboard')}</span>
            </button>
            <button
              className={activeTab === 'services' ? 'active' : ''}
              onClick={() => setActiveTab('services')}
            >
              <Briefcase size={20} />
              <span>{t('professionalCabinet.myServices')}</span>
            </button>
            <button
              className={activeTab === 'bookings' ? 'active' : ''}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={20} />
              <span>{t('professionalCabinet.bookings')}</span>
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={20} />
              <span>{t('professionalCabinet.reviews')}</span>
            </button>
            <Link
              to="/professional/tracker"
              className="cabinet-nav-link"
            >
              <Sparkles size={20} />
              <span>{t('professionalCabinet.tracker')}</span>
            </Link>
          </nav>
        </div>

        <div className="cabinet-content">
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <DashboardTab stats={stats} user={user} />
              )}
              {activeTab === 'services' && (
                <ServicesTab
                  services={services}
                  showForm={showServiceForm}
                  editingService={editingService}
                  onShowForm={() => setShowServiceForm(true)}
                  onHideForm={() => {
                    setShowServiceForm(false)
                    setEditingService(null)
                  }}
                  onEdit={(service) => setEditingService(service)}
                  onCreate={handleCreateService}
                  onUpdate={handleUpdateService}
                  onDelete={handleDeleteService}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsTab
                  bookings={bookings}
                  onUpdateStatus={handleUpdateBookingStatus}
                />
              )}
              {activeTab === 'reviews' && (
                <ReviewsTab reviews={reviews} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const DashboardTab = ({ stats, user }) => {
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
      <h1 className="page-title">Дашборд мастера</h1>
      
      <div className="stats-grid">
        <StatCard
          icon={Briefcase}
          title="Услуги"
          value={stats.services.total}
          subtitle="Активных услуг"
          color="purple"
        />
        <StatCard
          icon={Calendar}
          title="Бронирования"
          value={stats.bookings.total}
          subtitle={`${stats.bookings.completed} завершено, ${stats.bookings.pending} ожидает`}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          title="Доходы"
          value={`${stats.revenue.total.toLocaleString()} сом`}
          subtitle="Всего заработано"
          color="red"
        />
        <StatCard
          icon={Star}
          title="Рейтинг"
          value={stats.rating.average.toFixed(1)}
          subtitle={`${stats.rating.total_reviews} отзывов`}
          color="yellow"
        />
      </div>
    </div>
  )
}

const ServicesTab = ({
  services,
  showForm,
  editingService,
  onShowForm,
  onHideForm,
  onEdit,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    name_ru: '',
    name_ky: '',
    description: '',
    description_ru: '',
    description_ky: '',
    category: 'beauty',
    price: '',
    duration_minutes: ''
  })

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || '',
        name_ru: editingService.name_ru || '',
        name_ky: editingService.name_ky || '',
        description: editingService.description || '',
        description_ru: editingService.description_ru || '',
        description_ky: editingService.description_ky || '',
        category: editingService.category || 'beauty',
        price: editingService.price || '',
        duration_minutes: editingService.duration_minutes || ''
      })
      setShowForm(true)
    }
  }, [editingService])

  const handleSubmit = (e) => {
    e.preventDefault()
    const serviceData = {
      ...formData,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes)
    }
    
    if (editingService) {
      onUpdate(editingService.id, serviceData)
    } else {
      onCreate(serviceData)
    }
    setFormData({
      name: '',
      name_ru: '',
      name_ky: '',
      description: '',
      description_ru: '',
      description_ky: '',
      category: 'beauty',
      price: '',
      duration_minutes: ''
    })
  }

  const categories = [
    { value: 'beauty', label: 'Красота' },
    { value: 'spa', label: 'Спа' },
    { value: 'massage', label: 'Массаж' },
    { value: 'haircut', label: 'Стрижка' },
    { value: 'nail_care', label: 'Уход за ногтями' },
    { value: 'cleaning', label: 'Уборка' },
    { value: 'repair', label: 'Ремонт' },
    { value: 'other', label: 'Другое' }
  ]

  return (
    <div className="services-tab">
      <div className="section-header">
        <h1 className="page-title">Мои услуги</h1>
        <button onClick={onShowForm} className="btn-primary">
          <Plus size={20} />
          Добавить услугу
        </button>
      </div>

      {showForm && (
        <div className="service-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingService ? 'Редактировать услугу' : 'Новая услуга'}</h2>
              <button onClick={onHideForm} className="btn-close">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Название (EN) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Название (RU) *</label>
                  <input
                    type="text"
                    value={formData.name_ru}
                    onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Название (KY)</label>
                <input
                  type="text"
                  value={formData.name_ky}
                  onChange={(e) => setFormData({ ...formData, name_ky: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Описание (RU)</label>
                  <textarea
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Категория *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Цена (сом) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Длительность (минут) *</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={onHideForm} className="btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="btn-primary">
                  {editingService ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="services-list">
        {services.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет услуг</p>
            <button onClick={onShowForm} className="btn-primary">
              Создать первую услугу
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card-admin">
                <div className="service-header">
                  <h3>{service.name_ru || service.name}</h3>
                  <div className="service-status">
                    <span className={service.is_active ? 'status-active' : 'status-inactive'}>
                      {service.is_active ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
                <p className="service-description">
                  {service.description_ru || service.description}
                </p>
                <div className="service-details">
                  <span>Категория: {service.category}</span>
                  <span>Цена: {service.price} сом</span>
                  <span>Длительность: {service.duration_minutes} мин</span>
                </div>
                <div className="service-actions">
                  <button
                    onClick={() => onEdit(service)}
                    className="btn-icon btn-edit"
                    title="Редактировать"
                  >
                    <Edit size={16} />
                  </button>
                  {service.is_active ? (
                    <button
                      onClick={() => onDelete(service.id)}
                      className="btn-icon btn-danger"
                      title="Деактивировать"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdate(service.id, { is_active: true })}
                      className="btn-icon btn-success"
                      title="Активировать"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const BookingsTab = ({ bookings, onUpdateStatus }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает', class: 'status-pending', canConfirm: true },
      confirmed: { label: 'Подтвержден', class: 'status-confirmed', canStart: true },
      in_progress: { label: 'В процессе', class: 'status-progress', canComplete: true },
      completed: { label: 'Завершен', class: 'status-completed' },
      cancelled: { label: 'Отменен', class: 'status-cancelled' }
    }
    return statusMap[status] || { label: status, class: '' }
  }

  const handleStatusChange = (bookingId, newStatus) => {
    if (window.confirm(`Изменить статус на "${getStatusBadge(newStatus).label}"?`)) {
      onUpdateStatus(bookingId, newStatus)
    }
  }

  return (
    <div className="bookings-tab">
      <h1 className="page-title">Мои бронирования</h1>
      
      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет бронирований</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const statusInfo = getStatusBadge(booking.status)
            return (
              <div key={booking.id} className="booking-card-admin">
                <div className="booking-header">
                  <div>
                    <h3>{booking.service?.name_ru || booking.service?.name}</h3>
                    <p className="booking-date">
                      {new Date(booking.booking_date).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <div className="booking-info">
                  <div className="info-item">
                    <strong>Клиент:</strong> {booking.client?.full_name}
                  </div>
                  <div className="info-item">
                    <strong>Телефон:</strong> {booking.phone}
                  </div>
                  <div className="info-item">
                    <strong>Адрес:</strong> {booking.address}
                  </div>
                  {booking.address_details && (
                    <div className="info-item">
                      <strong>Детали:</strong> {booking.address_details}
                    </div>
                  )}
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
                  {statusInfo.canConfirm && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      className="btn-primary btn-sm"
                    >
                      Подтвердить
                    </button>
                  )}
                  {statusInfo.canStart && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'in_progress')}
                      className="btn-primary btn-sm"
                    >
                      Начать
                    </button>
                  )}
                  {statusInfo.canComplete && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      className="btn-success btn-sm"
                    >
                      Завершить
                    </button>
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
      <h1 className="page-title">Отзывы обо мне</h1>
      
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>Пока нет отзывов</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card-admin">
              <div className="review-header">
                <div>
                  <h3>{review.client?.full_name || 'Аноним'}</h3>
                  <p className="review-date">
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
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

export default ProfessionalCabinet

