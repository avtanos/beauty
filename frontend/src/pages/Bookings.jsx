import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ru from 'date-fns/locale/ru'
import api from '../services/api'
import './Bookings.css'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings')
      setBookings(response.data)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed'
      case 'confirmed':
        return 'status-confirmed'
      case 'in_progress':
        return 'status-progress'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return 'status-pending'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтвержден',
      in_progress: 'В процессе',
      completed: 'Завершен',
      cancelled: 'Отменен'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1 className="page-title">Мои заказы</h1>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет заказов</p>
            <Link to="/services" className="btn-primary">
              Выбрать услугу
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>{booking.service?.name_ru || booking.service?.name}</h3>
                    <p className="booking-date">
                      {format(new Date(booking.booking_date), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                
                <div className="booking-details">
                  <div className="booking-detail-item">
                    <span className="detail-label">Мастер:</span>
                    <span className="detail-value">
                      {booking.professional?.full_name}
                    </span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Адрес:</span>
                    <span className="detail-value">{booking.address}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Цена:</span>
                    <span className="detail-value price">{booking.total_price} сом</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="booking-notes">
                    <strong>Примечания:</strong> {booking.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings

