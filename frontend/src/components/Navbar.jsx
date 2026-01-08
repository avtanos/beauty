import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Sparkles, Shield, Globe, Menu, X } from 'lucide-react'
import './Navbar.css'
import '../styles/3d-icons.css'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { t, language, changeLanguage } = useLanguage()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo" onClick={handleLinkClick}>
            <span className="logo-icon icon-3d icon-3d-small icon-3d-gradient-beauty">
              <Sparkles size={28} strokeWidth={2.5} />
            </span>
            <span className="logo-text">Tunuk</span>
          </Link>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/services" className="nav-link" onClick={handleLinkClick}>{t('nav.services')}</Link>
            <Link to="/professionals" className="nav-link" onClick={handleLinkClick}>{t('nav.professionals')}</Link>
            <Link to="/beauty-tracker" className="nav-link" onClick={handleLinkClick}>{t('nav.beautyTracker')}</Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'client' && (
                  <Link to="/client" className="nav-link" onClick={handleLinkClick}>{t('nav.myCabinet')}</Link>
                )}
                {user?.role === 'professional' && (
                  <Link to="/professional" className="nav-link" onClick={handleLinkClick}>{t('nav.masterCabinet')}</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link admin-link" onClick={handleLinkClick}>
                    <Shield size={18} style={{ marginRight: '0.25rem' }} />
                    {t('nav.adminPanel')}
                  </Link>
                )}
                <Link to="/bookings" className="nav-link" onClick={handleLinkClick}>{t('nav.myOrders')}</Link>
                <div className="user-menu">
                  <Link to="/profile" className="nav-link user-name" onClick={handleLinkClick}>
                    {user?.full_name || t('nav.profile')}
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={handleLinkClick}>{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary" onClick={handleLinkClick}>{t('nav.register')}</Link>
              </>
            )}
            
            <div className="language-selector">
              <Globe size={18} />
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-select"
              >
                <option value="ru">РУ</option>
                <option value="en">EN</option>
                <option value="ky">КЫ</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

