import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './BookingForm.css'

const BookingForm = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [formData, setFormData] = useState({
    booking_date: '',
    address: '',
    address_details: '',
    phone: '',
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${serviceId}`)
      setService(response.data)
    } catch (error) {
      console.error('Failed to fetch service:', error)
      setError('Услуга не найдена')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await api.post('/bookings', {
        ...formData,
        service_id: parseInt(serviceId),
        booking_date: new Date(formData.booking_date).toISOString()
      })
      navigate('/bookings')
    } catch (err) {
      setError('Ошибка при создании заказа. Попробуйте еще раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!service) {
    return <div className="empty-state">Услуга не найдена</div>
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]
  const minDateTime = new Date().toISOString().slice(0, 16)

  return (
    <div className="booking-form-page">
      <div className="container">
        <h1 className="page-title">Бронирование услуги</h1>

        <div className="booking-form-content">
          <div className="service-summary">
            <h2>{service.name_ru || service.name}</h2>
            <div className="summary-item">
              <span>Цена:</span>
              <span className="price">{service.price} сом</span>
            </div>
            <div className="summary-item">
              <span>Длительность:</span>
              <span>{service.duration_minutes} минут</span>
            </div>
            {service.professional && (
              <div className="summary-item">
                <span>Мастер:</span>
                <span>{service.professional.full_name}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Дата и время *</label>
              <input
                type="datetime-local"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
                min={minDateTime}
              />
            </div>

            <div className="form-group">
              <label>Адрес *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Город, улица, дом"
              />
            </div>

            <div className="form-group">
              <label>Детали адреса</label>
              <textarea
                name="address_details"
                value={formData.address_details}
                onChange={handleChange}
                placeholder="Квартира, подъезд, этаж и т.д."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Телефон для связи *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+996 XXX XXX XXX"
              />
            </div>

            <div className="form-group">
              <label>Примечания</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Дополнительная информация для мастера"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Создание...' : 'Забронировать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingForm

