import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: '',
    password: '',
    role: 'client'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      navigate('/')
    } catch (err) {
      setError('Ошибка регистрации. Проверьте данные.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Регистрация</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Иван Иванов"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
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
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Тип аккаунта</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="client">Клиент</option>
                <option value="professional">Мастер</option>
              </select>
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="auth-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

