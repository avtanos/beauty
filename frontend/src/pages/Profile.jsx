import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import './Profile.css'

const Profile = () => {
  const { user, fetchUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    experience_years: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        experience_years: user.experience_years || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const updateData = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
      }
      await api.put('/users/me', updateData)
      setMessage('Профиль успешно обновлен')
      if (fetchUser) {
        await fetchUser()
      }
    } catch (error) {
      setMessage('Ошибка при обновлении профиля')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Мой профиль</h1>

        <div className="profile-content">
          <div className="profile-card">
            <h2>Личная информация</h2>
            {message && (
              <div className={`message ${message.includes('успешно') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Имя *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {user.role === 'professional' && (
                <>
                  <div className="form-group">
                    <label>О себе</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Расскажите о себе и своих навыках"
                    />
                  </div>

                  <div className="form-group">
                    <label>Опыт работы (лет)</label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>

          {user.role === 'professional' && (
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-value">{user.rating?.toFixed(1) || '0.0'}</div>
                <div className="stat-label">Рейтинг</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{user.total_reviews || 0}</div>
                <div className="stat-label">Отзывов</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

