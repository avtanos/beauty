import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Shield } from 'lucide-react'
import './Navbar.css'
import '../styles/3d-icons.css'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon icon-3d icon-3d-small icon-3d-gradient-beauty">
              <Sparkles size={28} strokeWidth={2.5} />
            </span>
            <span className="logo-text">Tunuk</span>
          </Link>
          
          <div className="navbar-menu">
            <Link to="/services" className="nav-link">Услуги</Link>
            <Link to="/professionals" className="nav-link">Мастера</Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'client' && (
                  <Link to="/client" className="nav-link">Мой кабинет</Link>
                )}
                {user?.role === 'professional' && (
                  <Link to="/professional" className="nav-link">Кабинет мастера</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link admin-link">
                    <Shield size={18} style={{ marginRight: '0.25rem' }} />
                    Админ-панель
                  </Link>
                )}
                <Link to="/bookings" className="nav-link">Мои заказы</Link>
                <div className="user-menu">
                  <Link to="/profile" className="nav-link user-name">
                    {user?.full_name || 'Профиль'}
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    Выйти
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Войти</Link>
                <Link to="/register" className="btn-primary">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

