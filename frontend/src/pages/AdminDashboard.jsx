import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { 
  BarChart3, Users, Briefcase, Calendar, Star, DollarSign, 
  TrendingUp, Shield, Settings, X, Check, Search, Filter,
  Eye, Edit, Trash2, UserCheck, UserX, Activity
} from 'lucide-react'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'dashboard') {
        const response = await api.get('/admin/stats')
        setStats(response.data)
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users')
        setUsers(response.data)
      } else if (activeTab === 'services') {
        const response = await api.get('/admin/services')
        setServices(response.data)
      } else if (activeTab === 'bookings') {
        const response = await api.get('/admin/bookings')
        setBookings(response.data)
      } else if (activeTab === 'reviews') {
        const response = await api.get('/admin/reviews')
        setReviews(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/activate`)
      fetchData()
    } catch (error) {
      console.error('Failed to activate user:', error)
    }
  }

  const handleDeactivateUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`)
      fetchData()
    } catch (error) {
      console.error('Failed to deactivate user:', error)
    }
  }

  const handleActivateService = async (serviceId) => {
    try {
      await api.post(`/admin/services/${serviceId}/activate`)
      fetchData()
    } catch (error) {
      console.error('Failed to activate service:', error)
    }
  }

  const handleDeactivateService = async (serviceId) => {
    try {
      await api.delete(`/admin/services/${serviceId}`)
      fetchData()
    } catch (error) {
      console.error('Failed to deactivate service:', error)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) return
    try {
      await api.delete(`/admin/reviews/${reviewId}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  )

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-header">
            <Shield size={32} className="admin-logo" />
            <h2>Админ-панель</h2>
          </div>
          <nav className="admin-nav">
            <button
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              <span>Дашборд</span>
            </button>
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <Users size={20} />
              <span>Пользователи</span>
            </button>
            <button
              className={activeTab === 'services' ? 'active' : ''}
              onClick={() => setActiveTab('services')}
            >
              <Briefcase size={20} />
              <span>Услуги</span>
            </button>
            <button
              className={activeTab === 'bookings' ? 'active' : ''}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={20} />
              <span>Бронирования</span>
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={20} />
              <span>Отзывы</span>
            </button>
          </nav>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <DashboardStats stats={stats} />
              )}
              {activeTab === 'users' && (
                <UsersManagement 
                  users={filteredUsers}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onActivate={handleActivateUser}
                  onDeactivate={handleDeactivateUser}
                />
              )}
              {activeTab === 'services' && (
                <ServicesManagement 
                  services={services}
                  onActivate={handleActivateService}
                  onDeactivate={handleDeactivateService}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsManagement bookings={bookings} />
              )}
              {activeTab === 'reviews' && (
                <ReviewsManagement 
                  reviews={reviews}
                  onDelete={handleDeleteReview}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const DashboardStats = ({ stats }) => {
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
    <div className="dashboard-stats">
      <h1 className="page-title">Дашборд</h1>
      
      <div className="stats-grid">
        <StatCard
          icon={Users}
          title="Пользователи"
          value={stats.users.total}
          subtitle={`${stats.users.clients} клиентов, ${stats.users.professionals} мастеров`}
          color="blue"
        />
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
          subtitle={`${stats.bookings.recent_30_days} за 30 дней`}
          color="green"
        />
        <StatCard
          icon={Star}
          title="Отзывы"
          value={stats.reviews.total}
          subtitle={`Средний рейтинг: ${stats.average_rating.toFixed(1)}`}
          color="yellow"
        />
        <StatCard
          icon={DollarSign}
          title="Доходы"
          value={`${stats.revenue.total.toLocaleString()} сом`}
          subtitle="Всего заработано"
          color="red"
        />
        <StatCard
          icon={Activity}
          title="Активность"
          value={stats.bookings.recent_30_days}
          subtitle="Бронирований за месяц"
          color="orange"
        />
      </div>

      <div className="stats-details">
        <div className="detail-card">
          <h3>Бронирования по статусам</h3>
          <div className="status-list">
            {Object.entries(stats.bookings.by_status).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className="status-label">{status}</span>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const UsersManagement = ({ users, searchTerm, setSearchTerm, onActivate, onDeactivate }) => {
  return (
    <div className="management-section">
      <div className="section-header">
        <h1 className="page-title">Управление пользователями</h1>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Поиск по имени, email, телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Рейтинг</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'client' ? 'Клиент' : user.role === 'professional' ? 'Мастер' : 'Админ'}
                  </span>
                </td>
                <td>
                  {user.rating ? `${user.rating.toFixed(1)} ⭐` : '-'}
                </td>
                <td>
                  <span className={user.is_active ? 'status-active' : 'status-inactive'}>
                    {user.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {user.is_active ? (
                      <button
                        onClick={() => onDeactivate(user.id)}
                        className="btn-icon btn-danger"
                        title="Деактивировать"
                      >
                        <UserX size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(user.id)}
                        className="btn-icon btn-success"
                        title="Активировать"
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ServicesManagement = ({ services, onActivate, onDeactivate }) => {
  return (
    <div className="management-section">
      <h1 className="page-title">Управление услугами</h1>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Мастер</th>
              <th>Цена</th>
              <th>Длительность</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.name_ru || service.name}</td>
                <td>{service.category}</td>
                <td>{service.professional?.full_name || '-'}</td>
                <td>{service.price} сом</td>
                <td>{service.duration_minutes} мин</td>
                <td>
                  <span className={service.is_active ? 'status-active' : 'status-inactive'}>
                    {service.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {service.is_active ? (
                      <button
                        onClick={() => onDeactivate(service.id)}
                        className="btn-icon btn-danger"
                        title="Деактивировать"
                      >
                        <X size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(service.id)}
                        className="btn-icon btn-success"
                        title="Активировать"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const BookingsManagement = ({ bookings }) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает', class: 'status-pending' },
      confirmed: { label: 'Подтвержден', class: 'status-confirmed' },
      in_progress: { label: 'В процессе', class: 'status-progress' },
      completed: { label: 'Завершен', class: 'status-completed' },
      cancelled: { label: 'Отменен', class: 'status-cancelled' }
    }
    const statusInfo = statusMap[status] || { label: status, class: '' }
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
  }

  return (
    <div className="management-section">
      <h1 className="page-title">Управление бронированиями</h1>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Мастер</th>
              <th>Услуга</th>
              <th>Дата</th>
              <th>Цена</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.client?.full_name || '-'}</td>
                <td>{booking.professional?.full_name || '-'}</td>
                <td>{booking.service?.name_ru || booking.service?.name || '-'}</td>
                <td>{new Date(booking.booking_date).toLocaleString('ru-RU')}</td>
                <td>{booking.total_price} сом</td>
                <td>{getStatusBadge(booking.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ReviewsManagement = ({ reviews, onDelete }) => {
  return (
    <div className="management-section">
      <h1 className="page-title">Управление отзывами</h1>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Мастер</th>
              <th>Рейтинг</th>
              <th>Комментарий</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.client?.full_name || '-'}</td>
                <td>{review.professional_id}</td>
                <td>
                  <span className="rating-display">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </td>
                <td className="comment-cell">{review.comment || '-'}</td>
                <td>{new Date(review.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <button
                    onClick={() => onDelete(review.id)}
                    className="btn-icon btn-danger"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard

