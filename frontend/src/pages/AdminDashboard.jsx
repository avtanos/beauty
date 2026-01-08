import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Pagination from '../components/Pagination'
import { 
  BarChart3, Users, Briefcase, Calendar, Star, DollarSign, 
  TrendingUp, Shield, Settings, X, Check, Search, Filter,
  Eye, Edit, Trash2, UserCheck, UserX, Activity, Sparkles, Plus, List
} from 'lucide-react'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [habits, setHabits] = useState([])
  const [templates, setTemplates] = useState([])
  const [templateDays, setTemplateDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [trackerSubTab, setTrackerSubTab] = useState('habits')
  
  // Pagination states
  const [usersPage, setUsersPage] = useState(1)
  const [servicesPage, setServicesPage] = useState(1)
  const [bookingsPage, setBookingsPage] = useState(1)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [habitsPage, setHabitsPage] = useState(1)
  const [templatesPage, setTemplatesPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchData()
  }, [user, navigate, activeTab, trackerSubTab])

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
      } else if (activeTab === 'tracker') {
        if (trackerSubTab === 'habits') {
          const response = await api.get('/admin/tracker/habits')
          setHabits(response.data)
        } else if (trackerSubTab === 'templates') {
          const response = await api.get('/admin/tracker/templates')
          setTemplates(response.data)
        }
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
    const confirmMsg = language === 'ru' ? 'Вы уверены, что хотите удалить этот отзыв?' : 
                     language === 'ky' ? 'Бул сын-пикирди жок кылгыңыз келеби?' :
                     'Are you sure you want to delete this review?'
    if (!window.confirm(confirmMsg)) return
    try {
      await api.delete(`/admin/reviews/${reviewId}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }
  
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}`, { status: newStatus })
      fetchData()
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }
  
  const handleCreateService = async (serviceData) => {
    try {
      await api.post('/admin/services', serviceData)
      fetchData()
    } catch (error) {
      console.error('Failed to create service:', error)
    }
  }
  
  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      await api.put(`/admin/services/${serviceId}`, serviceData)
      fetchData()
    } catch (error) {
      console.error('Failed to update service:', error)
    }
  }
  
  const handleDeleteService = async (serviceId) => {
    const confirmMsg = language === 'ru' ? 'Вы уверены, что хотите удалить эту услугу?' : 
                     language === 'ky' ? 'Бул кызматты жок кылгыңыз келеби?' :
                     'Are you sure you want to delete this service?'
    if (!window.confirm(confirmMsg)) return
    try {
      await api.delete(`/admin/services/${serviceId}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  // Pagination helpers
  const getPaginatedData = (data, page, perPage) => {
    const start = (page - 1) * perPage
    const end = start + perPage
    return data.slice(start, end)
  }
  
  const getTotalPages = (data, perPage) => {
    return Math.ceil(data.length / perPage)
  }
  
  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  )
  
  const paginatedUsers = getPaginatedData(filteredUsers, usersPage, itemsPerPage)
  const paginatedServices = getPaginatedData(services, servicesPage, itemsPerPage)
  const paginatedBookings = getPaginatedData(bookings, bookingsPage, itemsPerPage)
  const paginatedReviews = getPaginatedData(reviews, reviewsPage, itemsPerPage)
  const paginatedHabits = getPaginatedData(habits, habitsPage, itemsPerPage)
  const paginatedTemplates = getPaginatedData(templates, templatesPage, itemsPerPage)

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-header">
            <Shield size={32} className="admin-logo" />
            <h2>{t('nav.adminPanel')}</h2>
          </div>
          <nav className="admin-nav">
            <button
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              <span>{t('admin.dashboard')}</span>
            </button>
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <Users size={20} />
              <span>{t('admin.users')}</span>
            </button>
            <button
              className={activeTab === 'services' ? 'active' : ''}
              onClick={() => setActiveTab('services')}
            >
              <Briefcase size={20} />
              <span>{t('admin.services')}</span>
            </button>
            <button
              className={activeTab === 'bookings' ? 'active' : ''}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={20} />
              <span>{t('admin.bookings')}</span>
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={20} />
              <span>{t('admin.reviews')}</span>
            </button>
            <button
              className={activeTab === 'tracker' ? 'active' : ''}
              onClick={() => setActiveTab('tracker')}
            >
              <Sparkles size={20} />
              <span>{t('admin.tracker')}</span>
            </button>
          </nav>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">{t('common.loading')}</div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <DashboardStats stats={stats} />
              )}
              {activeTab === 'users' && (
                <UsersManagement 
                  users={paginatedUsers}
                  allUsers={filteredUsers}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onActivate={handleActivateUser}
                  onDeactivate={handleDeactivateUser}
                  currentPage={usersPage}
                  totalPages={getTotalPages(filteredUsers, itemsPerPage)}
                  onPageChange={setUsersPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={filteredUsers.length}
                />
              )}
              {activeTab === 'services' && (
                <ServicesManagement 
                  services={paginatedServices}
                  allServices={services}
                  onActivate={handleActivateService}
                  onDeactivate={handleDeactivateService}
                  onCreate={handleCreateService}
                  onUpdate={handleUpdateService}
                  onDelete={handleDeleteService}
                  currentPage={servicesPage}
                  totalPages={getTotalPages(services, itemsPerPage)}
                  onPageChange={setServicesPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={services.length}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsManagement
                  bookings={paginatedBookings}
                  allBookings={bookings}
                  onUpdateStatus={handleUpdateBookingStatus}
                  currentPage={bookingsPage}
                  totalPages={getTotalPages(bookings, itemsPerPage)}
                  onPageChange={setBookingsPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={bookings.length}
                />
              )}
              {activeTab === 'reviews' && (
                <ReviewsManagement 
                  reviews={paginatedReviews}
                  allReviews={reviews}
                  onDelete={handleDeleteReview}
                  currentPage={reviewsPage}
                  totalPages={getTotalPages(reviews, itemsPerPage)}
                  onPageChange={setReviewsPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={reviews.length}
                />
              )}
              {activeTab === 'tracker' && (
                <TrackerManagement
                  habits={paginatedHabits}
                  allHabits={habits}
                  templates={paginatedTemplates}
                  allTemplates={templates}
                  templateDays={templateDays}
                  subTab={trackerSubTab}
                  setSubTab={setTrackerSubTab}
                  onRefresh={fetchData}
                  habitsPage={habitsPage}
                  habitsTotalPages={getTotalPages(habits, itemsPerPage)}
                  onHabitsPageChange={setHabitsPage}
                  templatesPage={templatesPage}
                  templatesTotalPages={getTotalPages(templates, itemsPerPage)}
                  onTemplatesPageChange={setTemplatesPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  habitsTotalItems={habits.length}
                  templatesTotalItems={templates.length}
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

  const { t, language } = useLanguage()
  
  return (
    <div className="dashboard-stats">
      <h1 className="page-title">{t('admin.dashboard')}</h1>
      
      <div className="stats-grid">
        <StatCard
          icon={Users}
          title={t('admin.stats.totalUsers')}
          value={stats.users.total}
          subtitle={`${stats.users.clients} ${t('admin.stats.clients')}, ${stats.users.professionals} ${t('admin.stats.professionals')}`}
          color="blue"
        />
        <StatCard
          icon={Briefcase}
          title={t('admin.stats.totalServices')}
          value={stats.services.total}
          subtitle={t('admin.stats.totalServices')}
          color="purple"
        />
        <StatCard
          icon={Calendar}
          title={t('admin.stats.totalBookings')}
          value={stats.bookings.total}
          subtitle={`${stats.bookings.recent_30_days} ${language === 'ru' ? 'за 30 дней' : language === 'ky' ? '30 күндө' : 'in 30 days'}`}
          color="green"
        />
        <StatCard
          icon={Star}
          title={t('admin.stats.totalReviews')}
          value={stats.reviews.total}
          subtitle={`${t('admin.stats.averageRating')}: ${stats.average_rating.toFixed(1)}`}
          color="yellow"
        />
        <StatCard
          icon={DollarSign}
          title={t('admin.stats.revenue')}
          value={`${stats.revenue.total.toLocaleString()} ${language === 'ky' ? 'сом' : 'сом'}`}
          subtitle={language === 'ru' ? 'Всего заработано' : language === 'ky' ? 'Жалпы киреше' : 'Total earned'}
          color="red"
        />
        <StatCard
          icon={Activity}
          title={language === 'ru' ? 'Активность' : language === 'ky' ? 'Активдүүлүк' : 'Activity'}
          value={stats.bookings.recent_30_days}
          subtitle={language === 'ru' ? 'Бронирований за месяц' : language === 'ky' ? 'Айына брондоолор' : 'Bookings per month'}
          color="orange"
        />
      </div>

      <div className="stats-details">
        <div className="detail-card">
          <h3>{language === 'ru' ? 'Бронирования по статусам' : language === 'ky' ? 'Статус боюнча брондоолор' : 'Bookings by status'}</h3>
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

const UsersManagement = ({ 
  users, 
  allUsers,
  searchTerm, 
  setSearchTerm, 
  onActivate, 
  onDeactivate,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}) => {
  const { t, language } = useLanguage()
  
  return (
    <div className="management-section">
      <div className="section-header">
        <h1 className="page-title">{language === 'ru' ? 'Управление пользователями' : language === 'ky' ? 'Колдонуучуларды башкаруу' : 'Users Management'}</h1>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={language === 'ru' ? 'Поиск по имени, email, телефону...' : language === 'ky' ? 'Аты, email, телефону боюнча издөө...' : 'Search by name, email, phone...'}
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
              <th>{language === 'ru' ? 'Имя' : language === 'ky' ? 'Аты' : 'Name'}</th>
              <th>Email</th>
              <th>{language === 'ru' ? 'Телефон' : language === 'ky' ? 'Телефон' : 'Phone'}</th>
              <th>{language === 'ru' ? 'Роль' : language === 'ky' ? 'Роль' : 'Role'}</th>
              <th>{language === 'ru' ? 'Рейтинг' : language === 'ky' ? 'Рейтинг' : 'Rating'}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  {language === 'ru' ? 'Пользователи не найдены' : language === 'ky' ? 'Колдонуучулар табылган жок' : 'No users found'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'client' ? t('auth.client') : user.role === 'professional' ? t('auth.professional') : t('auth.admin')}
                    </span>
                  </td>
                  <td>
                    {user.rating ? `${user.rating.toFixed(1)} ⭐` : '-'}
                  </td>
                  <td>
                    <span className={user.is_active ? 'status-active' : 'status-inactive'}>
                      {user.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.is_active ? (
                        <button
                          onClick={() => onDeactivate(user.id)}
                          className="btn-icon btn-danger"
                          title={t('admin.deactivate')}
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(user.id)}
                          className="btn-icon btn-success"
                          title={t('admin.activate')}
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}

const ServicesManagement = ({ 
  services, 
  allServices,
  onActivate, 
  onDeactivate,
  onCreate,
  onUpdate,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}) => {
  const { t, language } = useLanguage()
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    name_ru: '',
    name_ky: '',
    description: '',
    description_ru: '',
    description_ky: '',
    category: 'beauty',
    price: 0,
    duration_minutes: 60,
    professional_id: null
  })

  const handleEdit = (service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name || '',
      name_ru: service.name_ru || '',
      name_ky: service.name_ky || '',
      description: service.description || '',
      description_ru: service.description_ru || '',
      description_ky: service.description_ky || '',
      category: service.category || 'beauty',
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 60,
      professional_id: service.professional_id || null
    })
    setShowServiceForm(true)
  }

  const handleSubmit = async () => {
    if (editingService) {
      await onUpdate(editingService.id, serviceForm)
    } else {
      await onCreate(serviceForm)
    }
    setShowServiceForm(false)
    setEditingService(null)
    setServiceForm({
      name: '',
      name_ru: '',
      name_ky: '',
      description: '',
      description_ru: '',
      description_ky: '',
      category: 'beauty',
      price: 0,
      duration_minutes: 60,
      professional_id: null
    })
  }

  const getServiceName = (service) => {
    if (language === 'ru' && service.name_ru) return service.name_ru
    if (language === 'ky' && service.name_ky) return service.name_ky
    return service.name
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h1 className="page-title">{language === 'ru' ? 'Управление услугами' : language === 'ky' ? 'Кызматтарды башкаруу' : 'Services Management'}</h1>
        <button
          onClick={() => {
            setEditingService(null)
            setServiceForm({
              name: '',
              name_ru: '',
              name_ky: '',
              description: '',
              description_ru: '',
              description_ky: '',
              category: 'beauty',
              price: 0,
              duration_minutes: 60,
              professional_id: null
            })
            setShowServiceForm(true)
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          {language === 'ru' ? 'Добавить услугу' : language === 'ky' ? 'Кызмат кошуу' : 'Add Service'}
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{language === 'ru' ? 'Название' : language === 'ky' ? 'Аталышы' : 'Name'}</th>
              <th>{language === 'ru' ? 'Категория' : language === 'ky' ? 'Категория' : 'Category'}</th>
              <th>{t('services.master')}</th>
              <th>{t('services.price')}</th>
              <th>{t('services.duration')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  {language === 'ru' ? 'Услуги не найдены' : language === 'ky' ? 'Кызматтар табылган жок' : 'No services found'}
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{getServiceName(service)}</td>
                  <td>{t(`services.categories.${service.category}`)}</td>
                  <td>{service.professional?.full_name || '-'}</td>
                  <td>{service.price} {language === 'ky' ? 'сом' : 'сом'}</td>
                  <td>{service.duration_minutes} {t('services.minutes')}</td>
                  <td>
                    <span className={service.is_active ? 'status-active' : 'status-inactive'}>
                      {service.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(service)}
                        className="btn-icon btn-edit"
                        title={t('common.edit')}
                      >
                        <Edit size={16} />
                      </button>
                      {service.is_active ? (
                        <button
                          onClick={() => onDeactivate(service.id)}
                          className="btn-icon btn-danger"
                          title={t('admin.deactivate')}
                        >
                          <X size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate(service.id)}
                          className="btn-icon btn-success"
                          title={t('admin.activate')}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(service.id)}
                        className="btn-icon btn-danger"
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showServiceForm && (
        <div className="modal-overlay" onClick={() => setShowServiceForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? (language === 'ru' ? 'Редактировать услугу' : language === 'ky' ? 'Кызматты оңдоо' : 'Edit Service') : (language === 'ru' ? 'Создать услугу' : language === 'ky' ? 'Кызмат түзүү' : 'Create Service')}</h2>
              <button onClick={() => setShowServiceForm(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{language === 'ru' ? 'Категория' : language === 'ky' ? 'Категория' : 'Category'}</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                >
                  {Object.keys(t('services.categories')).map(cat => (
                    <option key={cat} value={cat}>{t(`services.categories.${cat}`)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{language === 'ru' ? 'Название (EN)' : language === 'ky' ? 'Аталышы (EN)' : 'Name (EN)'}</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{language === 'ru' ? 'Название (RU)' : language === 'ky' ? 'Аталышы (RU)' : 'Name (RU)'}</label>
                <input
                  type="text"
                  value={serviceForm.name_ru}
                  onChange={(e) => setServiceForm({ ...serviceForm, name_ru: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{language === 'ru' ? 'Название (KY)' : language === 'ky' ? 'Аталышы (KY)' : 'Name (KY)'}</label>
                <input
                  type="text"
                  value={serviceForm.name_ky}
                  onChange={(e) => setServiceForm({ ...serviceForm, name_ky: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('services.price')}</label>
                <input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>{t('services.duration')} ({t('services.minutes')})</label>
                <input
                  type="number"
                  value={serviceForm.duration_minutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowServiceForm(false)} className="btn-secondary">
                {t('common.cancel')}
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingService ? t('common.save') : t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}

const BookingsManagement = ({ 
  bookings,
  allBookings,
  onUpdateStatus,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}) => {
  const { t, language } = useLanguage()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { 
        label: language === 'ru' ? 'Ожидает' : language === 'ky' ? 'Күтүүдө' : 'Pending', 
        class: 'status-pending' 
      },
      confirmed: { 
        label: language === 'ru' ? 'Подтвержден' : language === 'ky' ? 'Ырасталды' : 'Confirmed', 
        class: 'status-confirmed' 
      },
      in_progress: { 
        label: language === 'ru' ? 'В процессе' : language === 'ky' ? 'Жүрүүдө' : 'In Progress', 
        class: 'status-progress' 
      },
      completed: { 
        label: language === 'ru' ? 'Завершен' : language === 'ky' ? 'Аякталды' : 'Completed', 
        class: 'status-completed' 
      },
      cancelled: { 
        label: language === 'ru' ? 'Отменен' : language === 'ky' ? 'Жокко чыгарылды' : 'Cancelled', 
        class: 'status-cancelled' 
      }
    }
    const statusInfo = statusMap[status] || { label: status, class: '' }
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
  }

  const handleStatusChange = (booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setShowStatusModal(true)
  }

  const handleStatusUpdate = async () => {
    if (selectedBooking && newStatus !== selectedBooking.status) {
      await onUpdateStatus(selectedBooking.id, newStatus)
    }
    setShowStatusModal(false)
    setSelectedBooking(null)
  }

  const getServiceName = (service) => {
    if (!service) return '-'
    if (language === 'ru' && service.name_ru) return service.name_ru
    if (language === 'ky' && service.name_ky) return service.name_ky
    return service.name
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h1 className="page-title">{language === 'ru' ? 'Управление бронированиями' : language === 'ky' ? 'Брондоолорду башкаруу' : 'Bookings Management'}</h1>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('bookings.status.client') || (language === 'ru' ? 'Клиент' : language === 'ky' ? 'Кардар' : 'Client')}</th>
              <th>{t('services.master')}</th>
              <th>{t('services.title')}</th>
              <th>{t('bookings.date')}</th>
              <th>{t('bookings.totalPrice')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  {language === 'ru' ? 'Бронирования не найдены' : language === 'ky' ? 'Брондоолор табылган жок' : 'No bookings found'}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.client?.full_name || '-'}</td>
                  <td>{booking.professional?.full_name || '-'}</td>
                  <td>{getServiceName(booking.service)}</td>
                  <td>{new Date(booking.booking_date).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'ky' ? 'ky-KG' : 'en-US')}</td>
                  <td>{booking.total_price} {language === 'ky' ? 'сом' : 'сом'}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleStatusChange(booking)}
                        className="btn-icon btn-edit"
                        title={language === 'ru' ? 'Изменить статус' : language === 'ky' ? 'Статусту өзгөртүү' : 'Change status'}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showStatusModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{language === 'ru' ? 'Изменить статус бронирования' : language === 'ky' ? 'Брондоонун статусун өзгөртүү' : 'Change Booking Status'}</h2>
              <button onClick={() => setShowStatusModal(false)} className="btn-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t('common.status')}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">{language === 'ru' ? 'Ожидает' : language === 'ky' ? 'Күтүүдө' : 'Pending'}</option>
                  <option value="confirmed">{language === 'ru' ? 'Подтвержден' : language === 'ky' ? 'Ырасталды' : 'Confirmed'}</option>
                  <option value="in_progress">{language === 'ru' ? 'В процессе' : language === 'ky' ? 'Жүрүүдө' : 'In Progress'}</option>
                  <option value="completed">{language === 'ru' ? 'Завершен' : language === 'ky' ? 'Аякталды' : 'Completed'}</option>
                  <option value="cancelled">{language === 'ru' ? 'Отменен' : language === 'ky' ? 'Жокко чыгарылды' : 'Cancelled'}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary">
                {t('common.cancel')}
              </button>
              <button onClick={handleStatusUpdate} className="btn-primary">
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}

const ReviewsManagement = ({ 
  reviews,
  allReviews,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}) => {
  const { t, language } = useLanguage()
  
  return (
    <div className="management-section">
      <div className="section-header">
        <h1 className="page-title">{language === 'ru' ? 'Управление отзывами' : language === 'ky' ? 'Сын-пикирлерди башкаруу' : 'Reviews Management'}</h1>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('bookings.status.client') || (language === 'ru' ? 'Клиент' : language === 'ky' ? 'Кардар' : 'Client')}</th>
              <th>{t('services.master')}</th>
              <th>{t('reviews.rating')}</th>
              <th>{t('reviews.comment')}</th>
              <th>{language === 'ru' ? 'Дата' : language === 'ky' ? 'Дата' : 'Date'}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  {language === 'ru' ? 'Отзывы не найдены' : language === 'ky' ? 'Сын-пикирлер табылган жок' : 'No reviews found'}
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>{review.client?.full_name || '-'}</td>
                  <td>{review.professional?.full_name || review.professional_id || '-'}</td>
                  <td>
                    <span className="rating-display">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </td>
                  <td className="comment-cell">{review.comment || '-'}</td>
                  <td>{new Date(review.created_at).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ky' ? 'ky-KG' : 'en-US')}</td>
                  <td>
                    <button
                      onClick={() => onDelete(review.id)}
                      className="btn-icon btn-danger"
                      title={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}

const TrackerManagement = ({ 
  habits, 
  allHabits,
  templates, 
  allTemplates,
  templateDays, 
  subTab, 
  setSubTab, 
  onRefresh,
  habitsPage,
  habitsTotalPages,
  onHabitsPageChange,
  templatesPage,
  templatesTotalPages,
  onTemplatesPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  habitsTotalItems,
  templatesTotalItems
}) => {
  const { t, language } = useLanguage()
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [habitForm, setHabitForm] = useState({
    category: 'face',
    title: '',
    title_ru: '',
    title_ky: '',
    description: '',
    description_ru: '',
    description_ky: ''
  })

  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    version: 1
  })
  const [showDayForm, setShowDayForm] = useState(false)
  const [editingDay, setEditingDay] = useState(null)
  const [dayForm, setDayForm] = useState({
    day_number: 1,
    focus_text: '',
    focus_text_ru: '',
    focus_text_ky: '',
    habit_ids: []
  })
  const [availableHabits, setAvailableHabits] = useState([])

  const handleCreateTemplate = async () => {
    try {
      await api.post('/admin/tracker/templates', templateForm)
      setShowTemplateForm(false)
      setTemplateForm({ name: '', version: 1 })
      onRefresh()
    } catch (error) {
      console.error('Failed to create template:', error)
      alert(language === 'ru' ? 'Ошибка при создании шаблона' : language === 'ky' ? 'Шаблон түзүүдө ката' : 'Error creating template')
    }
  }

  const handleUpdateTemplate = async () => {
    try {
      await api.put(`/admin/tracker/templates/${editingTemplate.id}`, templateForm)
      setEditingTemplate(null)
      setShowTemplateForm(false)
      setTemplateForm({ name: '', version: 1 })
      onRefresh()
    } catch (error) {
      console.error('Failed to update template:', error)
      alert(language === 'ru' ? 'Ошибка при обновлении шаблона' : language === 'ky' ? 'Шаблонду жаңылоодо ката' : 'Error updating template')
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    const confirmMsg = language === 'ru' ? 'Вы уверены, что хотите удалить этот шаблон? Все дни программы также будут удалены.' : 
                     language === 'ky' ? 'Бул шаблонду жок кылгыңыз келеби? Программанын бардык күндөрү да жок кылынат.' :
                     'Are you sure you want to delete this template? All program days will also be deleted.'
    if (!window.confirm(confirmMsg)) return
    try {
      // Сначала удаляем все дни шаблона
      const daysResponse = await api.get(`/admin/tracker/templates/${templateId}/days`)
      for (const day of daysResponse.data) {
        await api.delete(`/admin/tracker/days/${day.id}`)
      }
      // Затем удаляем шаблон (если API поддерживает)
      try {
        await api.delete(`/admin/tracker/templates/${templateId}`)
      } catch (e) {
        // Если API не поддерживает удаление, просто деактивируем
        await api.put(`/admin/tracker/templates/${templateId}`, { is_active: false })
      }
      setSelectedTemplate(null)
      setTemplateDays([])
      onRefresh()
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert(language === 'ru' ? 'Ошибка при удалении шаблона' : language === 'ky' ? 'Шаблонду жок кылууда ката' : 'Error deleting template')
    }
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      version: template.version
    })
    setShowTemplateForm(true)
  }

  const loadTemplateDays = async (templateId) => {
    try {
      const response = await api.get(`/admin/tracker/templates/${templateId}/days`)
      setTemplateDays(response.data)
      setSelectedTemplate(templateId)
    } catch (error) {
      console.error('Failed to load template days:', error)
    }
  }

  const handleCreateDay = async () => {
    try {
      const dayData = {
        day_number: dayForm.day_number,
        focus_text: dayForm.focus_text,
        focus_text_ru: dayForm.focus_text_ru,
        focus_text_ky: dayForm.focus_text_ky
      }
      await api.post(`/admin/tracker/templates/${selectedTemplate}/days?habit_ids=${dayForm.habit_ids.join(',')}`, dayData)
      setShowDayForm(false)
      setDayForm({ day_number: 1, focus_text: '', focus_text_ru: '', focus_text_ky: '', habit_ids: [] })
      loadTemplateDays(selectedTemplate)
    } catch (error) {
      console.error('Failed to create day:', error)
      alert(language === 'ru' ? 'Ошибка при создании дня' : language === 'ky' ? 'Күн түзүүдө ката' : 'Error creating day')
    }
  }

  const handleUpdateDay = async () => {
    try {
      const dayData = {
        day_number: dayForm.day_number,
        focus_text: dayForm.focus_text,
        focus_text_ru: dayForm.focus_text_ru,
        focus_text_ky: dayForm.focus_text_ky
      }
      // API принимает habit_ids как query параметр
      const habitIdsParam = dayForm.habit_ids.length > 0 ? `?habit_ids=${dayForm.habit_ids.join(',')}` : ''
      await api.put(`/admin/tracker/days/${editingDay.id}${habitIdsParam}`, dayData)
      setEditingDay(null)
      setShowDayForm(false)
      setDayForm({ day_number: 1, focus_text: '', focus_text_ru: '', focus_text_ky: '', habit_ids: [] })
      loadTemplateDays(selectedTemplate)
    } catch (error) {
      console.error('Failed to update day:', error)
      alert(language === 'ru' ? 'Ошибка при обновлении дня' : language === 'ky' ? 'Күндү жаңылоодо ката' : 'Error updating day')
    }
  }

  const handleDeleteDay = async (dayId) => {
    const confirmMsg = language === 'ru' ? 'Вы уверены, что хотите удалить этот день?' : 
                     language === 'ky' ? 'Бул күндү жок кылгыңыз келеби?' :
                     'Are you sure you want to delete this day?'
    if (!window.confirm(confirmMsg)) return
    try {
      await api.delete(`/admin/tracker/days/${dayId}`)
      loadTemplateDays(selectedTemplate)
    } catch (error) {
      console.error('Failed to delete day:', error)
      alert(language === 'ru' ? 'Ошибка при удалении дня' : language === 'ky' ? 'Күндү жок кылууда ката' : 'Error deleting day')
    }
  }

  const handleEditDay = (day) => {
    setEditingDay(day)
    setDayForm({
      day_number: day.day_number,
      focus_text: day.focus_text || '',
      focus_text_ru: day.focus_text_ru || '',
      focus_text_ky: day.focus_text_ky || '',
      habit_ids: day.habits ? day.habits.map(h => h.id) : []
    })
    setShowDayForm(true)
  }

  const loadAvailableHabits = async () => {
    try {
      const response = await api.get('/admin/tracker/habits')
      setAvailableHabits(response.data.filter(h => h.is_active))
    } catch (error) {
      console.error('Failed to load habits:', error)
    }
  }

  useEffect(() => {
    if (showDayForm) {
      loadAvailableHabits()
    }
  }, [showDayForm])

  const handleCreateHabit = async () => {
    try {
      await api.post('/admin/tracker/habits', habitForm)
      setShowHabitForm(false)
      setHabitForm({
        category: 'face',
        title: '',
        title_ru: '',
        title_ky: '',
        description: '',
        description_ru: '',
        description_ky: ''
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to create habit:', error)
      alert('Ошибка при создании привычки')
    }
  }

  const handleUpdateHabit = async () => {
    try {
      await api.put(`/admin/tracker/habits/${editingHabit.id}`, habitForm)
      setEditingHabit(null)
      setShowHabitForm(false)
      setHabitForm({
        category: 'face',
        title: '',
        title_ru: '',
        title_ky: '',
        description: '',
        description_ru: '',
        description_ky: ''
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update habit:', error)
      alert('Ошибка при обновлении привычки')
    }
  }

  const handleDeleteHabit = async (habitId) => {
    const confirmMsg = language === 'ru' ? 'Вы уверены, что хотите деактивировать эту привычку?' : 
                     language === 'ky' ? 'Бул кылык-жорукту деактивдештирүүнү каалайсызбы?' :
                     'Are you sure you want to deactivate this habit?'
    if (!window.confirm(confirmMsg)) return
    try {
      await api.delete(`/admin/tracker/habits/${habitId}`)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete habit:', error)
      alert('Ошибка при удалении привычки')
    }
  }

  const handleEditHabit = (habit) => {
    setEditingHabit(habit)
    setHabitForm({
      category: habit.category,
      title: habit.title,
      title_ru: habit.title_ru || '',
      title_ky: habit.title_ky || '',
      description: habit.description || '',
      description_ru: habit.description_ru || '',
      description_ky: habit.description_ky || ''
    })
    setShowHabitForm(true)
  }

  const handleActivateTemplate = async (templateId) => {
    try {
      await api.post(`/admin/tracker/templates/${templateId}/activate`)
      onRefresh()
    } catch (error) {
      console.error('Failed to activate template:', error)
      alert('Ошибка при активации шаблона')
    }
  }

  const getCategoryName = (category) => {
    return t(`tracker.categories.${category}`) || category
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h1 className="page-title">{language === 'ru' ? 'Управление Beauty Tracker' : language === 'ky' ? 'Beauty Tracker башкаруу' : 'Beauty Tracker Management'}</h1>
        <div className="sub-tabs">
          <button
            className={subTab === 'habits' ? 'active' : ''}
            onClick={() => setSubTab('habits')}
          >
            <List size={18} />
            {t('admin.habits')}
          </button>
          <button
            className={subTab === 'templates' ? 'active' : ''}
            onClick={() => setSubTab('templates')}
          >
            <Sparkles size={18} />
            {t('admin.templates')}
          </button>
        </div>
      </div>

      {subTab === 'habits' && (
        <div className="habits-management">
          <div className="section-actions">
            <button
              onClick={() => {
                setEditingHabit(null)
                setHabitForm({
                  category: 'face',
                  title: '',
                  title_ru: '',
                  title_ky: '',
                  description: '',
                  description_ru: '',
                  description_ky: ''
                })
                setShowHabitForm(true)
              }}
              className="btn-primary"
            >
              <Plus size={18} />
              {language === 'ru' ? 'Добавить привычку' : language === 'ky' ? 'Кылык-жорук кошуу' : 'Add Habit'}
            </button>
          </div>

          {showHabitForm && (
            <div className="modal-overlay" onClick={() => setShowHabitForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingHabit ? (language === 'ru' ? 'Редактировать привычку' : language === 'ky' ? 'Кылык-жорукту оңдоо' : 'Edit Habit') : (language === 'ru' ? 'Создать привычку' : language === 'ky' ? 'Кылык-жорук түзүү' : 'Create Habit')}</h2>
                  <button onClick={() => setShowHabitForm(false)} className="btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Категория' : language === 'ky' ? 'Категория' : 'Category'}</label>
                    <select
                      value={habitForm.category}
                      onChange={(e) => setHabitForm({ ...habitForm, category: e.target.value })}
                    >
                      <option value="face">{t('tracker.categories.face')}</option>
                      <option value="body">{t('tracker.categories.body')}</option>
                      <option value="lifestyle">{t('tracker.categories.lifestyle')}</option>
                      <option value="focus">{t('tracker.categories.focus')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Название (EN)' : language === 'ky' ? 'Аталышы (EN)' : 'Title (EN)'}</label>
                    <input
                      type="text"
                      value={habitForm.title}
                      onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                      placeholder={language === 'ru' ? 'Название на английском' : language === 'ky' ? 'Англис тилиндеги аталышы' : 'Title in English'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Название (RU)' : language === 'ky' ? 'Аталышы (RU)' : 'Title (RU)'}</label>
                    <input
                      type="text"
                      value={habitForm.title_ru}
                      onChange={(e) => setHabitForm({ ...habitForm, title_ru: e.target.value })}
                      placeholder={language === 'ru' ? 'Название на русском' : language === 'ky' ? 'Орус тилиндеги аталышы' : 'Title in Russian'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Название (KY)' : language === 'ky' ? 'Аталышы (KY)' : 'Title (KY)'}</label>
                    <input
                      type="text"
                      value={habitForm.title_ky}
                      onChange={(e) => setHabitForm({ ...habitForm, title_ky: e.target.value })}
                      placeholder={language === 'ru' ? 'Название на кыргызском' : language === 'ky' ? 'Кыргыз тилиндеги аталышы' : 'Title in Kyrgyz'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Описание (EN)' : language === 'ky' ? 'Баяндама (EN)' : 'Description (EN)'}</label>
                    <textarea
                      value={habitForm.description}
                      onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                      placeholder={language === 'ru' ? 'Описание на английском' : language === 'ky' ? 'Англис тилиндеги баяндама' : 'Description in English'}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Описание (RU)' : language === 'ky' ? 'Баяндама (RU)' : 'Description (RU)'}</label>
                    <textarea
                      value={habitForm.description_ru}
                      onChange={(e) => setHabitForm({ ...habitForm, description_ru: e.target.value })}
                      placeholder={language === 'ru' ? 'Описание на русском' : language === 'ky' ? 'Орус тилиндеги баяндама' : 'Description in Russian'}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Описание (KY)' : language === 'ky' ? 'Баяндама (KY)' : 'Description (KY)'}</label>
                    <textarea
                      value={habitForm.description_ky}
                      onChange={(e) => setHabitForm({ ...habitForm, description_ky: e.target.value })}
                      placeholder={language === 'ru' ? 'Описание на кыргызском' : language === 'ky' ? 'Кыргыз тилиндеги баяндама' : 'Description in Kyrgyz'}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowHabitForm(false)} className="btn-secondary">
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={editingHabit ? handleUpdateHabit : handleCreateHabit}
                    className="btn-primary"
                  >
                    {editingHabit ? t('common.save') : t('common.create')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{language === 'ru' ? 'Категория' : language === 'ky' ? 'Категория' : 'Category'}</th>
                  <th>{language === 'ru' ? 'Название (EN)' : language === 'ky' ? 'Аталышы (EN)' : 'Title (EN)'}</th>
                  <th>{language === 'ru' ? 'Название (RU)' : language === 'ky' ? 'Аталышы (RU)' : 'Title (RU)'}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {habits.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      {language === 'ru' ? 'Привычки не найдены' : language === 'ky' ? 'Кылык-жоруктар табылган жок' : 'No habits found'}
                    </td>
                  </tr>
                ) : (
                  habits.map((habit) => (
                    <tr key={habit.id}>
                      <td>{habit.id}</td>
                      <td>
                        <span className="category-badge">{getCategoryName(habit.category)}</span>
                      </td>
                      <td>{habit.title}</td>
                      <td>{habit.title_ru || '-'}</td>
                      <td>
                        <span className={habit.is_active ? 'status-active' : 'status-inactive'}>
                          {habit.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditHabit(habit)}
                            className="btn-icon btn-edit"
                            title={t('common.edit')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="btn-icon btn-danger"
                            title={t('admin.deactivate')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {habitsTotalPages > 1 && (
            <Pagination
              currentPage={habitsPage}
              totalPages={habitsTotalPages}
              onPageChange={onHabitsPageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              totalItems={habitsTotalItems}
            />
          )}
        </div>
      )}

      {subTab === 'templates' && (
        <div className="templates-management">
          <div className="section-header">
            <h2 className="section-subtitle">{language === 'ru' ? 'Шаблоны программ' : language === 'ky' ? 'Программа шаблондору' : 'Program Templates'}</h2>
            <button
              onClick={() => {
                setEditingTemplate(null)
                setTemplateForm({ name: '', version: 1 })
                setShowTemplateForm(true)
              }}
              className="btn-primary"
            >
              <Plus size={18} />
              {language === 'ru' ? 'Создать шаблон' : language === 'ky' ? 'Шаблон түзүү' : 'Create Template'}
            </button>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{language === 'ru' ? 'Название' : language === 'ky' ? 'Аталышы' : 'Name'}</th>
                  <th>{language === 'ru' ? 'Версия' : language === 'ky' ? 'Версия' : 'Version'}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      {language === 'ru' ? 'Шаблоны не найдены' : language === 'ky' ? 'Шаблондор табылган жок' : 'No templates found'}
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id}>
                      <td>{template.id}</td>
                      <td>{template.name}</td>
                      <td>v{template.version}</td>
                      <td>
                        <span className={template.is_active ? 'status-active' : 'status-inactive'}>
                          {template.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="btn-icon btn-edit"
                            title={t('common.edit')}
                          >
                            <Edit size={16} />
                          </button>
                          {!template.is_active && (
                            <button
                              onClick={() => handleActivateTemplate(template.id)}
                              className="btn-icon btn-success"
                              title={t('admin.activate')}
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => loadTemplateDays(template.id)}
                            className="btn-icon btn-edit"
                            title={language === 'ru' ? 'Просмотреть дни' : language === 'ky' ? 'Күндөрдү көрүү' : 'View days'}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="btn-icon btn-danger"
                            title={t('common.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {templatesTotalPages > 1 && (
            <Pagination
              currentPage={templatesPage}
              totalPages={templatesTotalPages}
              onPageChange={onTemplatesPageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              totalItems={templatesTotalItems}
            />
          )}

          {selectedTemplate && (
            <div className="template-days-section">
              <div className="section-header">
                <h3>{language === 'ru' ? `Дни программы (Шаблон ID: ${selectedTemplate})` : language === 'ky' ? `Программа күндөрү (Шаблон ID: ${selectedTemplate})` : `Program Days (Template ID: ${selectedTemplate})`}</h3>
                <button
                  onClick={() => {
                    setEditingDay(null)
                    const nextDayNumber = templateDays.length > 0 
                      ? Math.max(...templateDays.map(d => d.day_number)) + 1 
                      : 1
                    setDayForm({ 
                      day_number: nextDayNumber, 
                      focus_text: '', 
                      focus_text_ru: '', 
                      focus_text_ky: '', 
                      habit_ids: [] 
                    })
                    setShowDayForm(true)
                  }}
                  className="btn-primary"
                >
                  <Plus size={18} />
                  {language === 'ru' ? 'Добавить день' : language === 'ky' ? 'Күн кошуу' : 'Add Day'}
                </button>
              </div>
              {templateDays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  {language === 'ru' ? 'Дни не добавлены' : language === 'ky' ? 'Күндөр кошулган жок' : 'No days added'}
                </div>
              ) : (
                <div className="days-grid">
                {templateDays.map((day) => (
                  <div key={day.id} className="day-card">
                    <div className="day-header">
                      <h4>{t('tracker.day')} {day.day_number}</h4>
                      <div className="day-actions">
                        <button
                          onClick={() => handleEditDay(day)}
                          className="btn-icon btn-edit"
                          title={t('common.edit')}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDay(day.id)}
                          className="btn-icon btn-danger"
                          title={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {(() => {
                      const focusText = language === 'ru' && day.focus_text_ru ? day.focus_text_ru :
                                       language === 'ky' && day.focus_text_ky ? day.focus_text_ky :
                                       day.focus_text
                      return focusText && <p className="day-focus">{focusText}</p>
                    })()}
                    {day.habits && day.habits.length > 0 && (
                      <div className="day-habits">
                        <strong>{t('tracker.habits')}:</strong>
                        <ul>
                          {day.habits.map((habit, idx) => {
                            const habitTitle = language === 'ru' && habit.title_ru ? habit.title_ru :
                                             language === 'ky' && habit.title_ky ? habit.title_ky :
                                             habit.title
                            return (
                              <li key={idx}>
                                {habitTitle}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {showTemplateForm && (
            <div className="modal-overlay" onClick={() => setShowTemplateForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingTemplate ? (language === 'ru' ? 'Редактировать шаблон' : language === 'ky' ? 'Шаблонду оңдоо' : 'Edit Template') : (language === 'ru' ? 'Создать шаблон' : language === 'ky' ? 'Шаблон түзүү' : 'Create Template')}</h2>
                  <button onClick={() => setShowTemplateForm(false)} className="btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Название' : language === 'ky' ? 'Аталышы' : 'Name'}</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder={language === 'ru' ? 'Название шаблона' : language === 'ky' ? 'Шаблондун аталышы' : 'Template name'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Версия' : language === 'ky' ? 'Версия' : 'Version'}</label>
                    <input
                      type="number"
                      value={templateForm.version}
                      onChange={(e) => setTemplateForm({ ...templateForm, version: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowTemplateForm(false)} className="btn-secondary">
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className="btn-primary"
                  >
                    {editingTemplate ? t('common.save') : t('common.create')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDayForm && selectedTemplate && (
            <div className="modal-overlay" onClick={() => setShowDayForm(false)}>
              <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingDay ? (language === 'ru' ? 'Редактировать день' : language === 'ky' ? 'Күндү оңдоо' : 'Edit Day') : (language === 'ru' ? 'Добавить день' : language === 'ky' ? 'Күн кошуу' : 'Add Day')}</h2>
                  <button onClick={() => setShowDayForm(false)} className="btn-close">
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>{t('tracker.day')} {language === 'ru' ? 'номер' : language === 'ky' ? 'номери' : 'number'}</label>
                    <input
                      type="number"
                      value={dayForm.day_number}
                      onChange={(e) => setDayForm({ ...dayForm, day_number: Number(e.target.value) })}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Фокус дня (EN)' : language === 'ky' ? 'Күн фокусу (EN)' : 'Focus text (EN)'}</label>
                    <textarea
                      value={dayForm.focus_text}
                      onChange={(e) => setDayForm({ ...dayForm, focus_text: e.target.value })}
                      rows={3}
                      placeholder={language === 'ru' ? 'Текст фокуса на английском' : language === 'ky' ? 'Англис тилиндеги фокус тексти' : 'Focus text in English'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Фокус дня (RU)' : language === 'ky' ? 'Күн фокусу (RU)' : 'Focus text (RU)'}</label>
                    <textarea
                      value={dayForm.focus_text_ru}
                      onChange={(e) => setDayForm({ ...dayForm, focus_text_ru: e.target.value })}
                      rows={3}
                      placeholder={language === 'ru' ? 'Текст фокуса на русском' : language === 'ky' ? 'Орус тилиндеги фокус тексти' : 'Focus text in Russian'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'ru' ? 'Фокус дня (KY)' : language === 'ky' ? 'Күн фокусу (KY)' : 'Focus text (KY)'}</label>
                    <textarea
                      value={dayForm.focus_text_ky}
                      onChange={(e) => setDayForm({ ...dayForm, focus_text_ky: e.target.value })}
                      rows={3}
                      placeholder={language === 'ru' ? 'Текст фокуса на кыргызском' : language === 'ky' ? 'Кыргыз тилиндеги фокус тексти' : 'Focus text in Kyrgyz'}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('tracker.habits')}</label>
                    <div className="habits-selector">
                      {availableHabits.map((habit) => {
                        const habitTitle = language === 'ru' && habit.title_ru ? habit.title_ru :
                                         language === 'ky' && habit.title_ky ? habit.title_ky :
                                         habit.title
                        const isSelected = dayForm.habit_ids.includes(habit.id)
                        return (
                          <label key={habit.id} className="habit-checkbox">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDayForm({ ...dayForm, habit_ids: [...dayForm.habit_ids, habit.id] })
                                } else {
                                  setDayForm({ ...dayForm, habit_ids: dayForm.habit_ids.filter(id => id !== habit.id) })
                                }
                              }}
                            />
                            <span className="habit-checkbox-label">
                              <span className="category-badge">{getCategoryName(habit.category)}</span>
                              {habitTitle}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowDayForm(false)} className="btn-secondary">
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={editingDay ? handleUpdateDay : handleCreateDay}
                    className="btn-primary"
                  >
                    {editingDay ? t('common.save') : t('common.create')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

