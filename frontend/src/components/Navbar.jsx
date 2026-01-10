import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Sparkles, Shield, Globe, Menu, X, User, LogOut, ShoppingBag, LayoutDashboard, ChevronDown } from 'lucide-react'
import './Navbar.css'
import '../styles/3d-icons.css'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { t, language, changeLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const isActive = (path) => {
    // For HashRouter, check both pathname and hash
    const currentPath = location.pathname + location.hash
    if (path === '/') {
      return location.pathname === '/' || location.hash === '' || location.hash === '#/'
    }
    // Remove # from hash for comparison
    const hashPath = location.hash.replace('#', '')
    return location.pathname.startsWith(path) || hashPath.startsWith(path) || hashPath === path
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [userMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo" onClick={handleLinkClick}>
            <span className="logo-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l1.2 4.2L17 8l-3.8 1.8L12 14l-1.2-4.2L7 8l3.8-1.8L12 2z" stroke="#FF6B6B" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M5 13l.7 2.4L8 16.5l-2.3 1.1L5 20l-.7-2.4L2 16.5l2.3-1.1L5 13z" stroke="#FF6B6B" strokeWidth="1.8" strokeLinejoin="round" opacity=".85"/>
              </svg>
            </span>
            <span className="logo-text">Suluu</span>
          </Link>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="#111827" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="#111827" strokeWidth="1.8" strokeLinecap="round"/>
              )}
            </svg>
            <span>Меню</span>
          </button>
          
          <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <nav className="nav-main-links" aria-label="Меню">
              <Link 
                to="/services" 
                className={`nav-link ${isActive('/services') ? 'active' : ''}`} 
                onClick={handleLinkClick}
              >
                {t('nav.services')}
              </Link>
              <Link 
                to="/professionals" 
                className={`nav-link ${isActive('/professionals') ? 'active' : ''}`} 
                onClick={handleLinkClick}
              >
                {t('nav.professionals')}
              </Link>
              <Link 
                to="/beauty-tracker" 
                className={`nav-link ${isActive('/beauty-tracker') ? 'active' : ''}`} 
                onClick={handleLinkClick}
              >
                {t('nav.beautyTracker')}
              </Link>
              <Link 
                to="/news" 
                className={`nav-link ${isActive('/news') ? 'active' : ''}`} 
                onClick={handleLinkClick}
              >
                {t('nav.news')}
              </Link>
              <Link 
                to="/shop" 
                className={`nav-link ${isActive('/shop') ? 'active' : ''}`} 
                onClick={handleLinkClick}
              >
                {t('nav.shop')}
              </Link>
            </nav>
            
            <div className="nav-right-section">
              <div className="language-selector" role="button" aria-label="Язык">
                <Globe size={18} className="icon" />
                <span className="language-text">
                  {language === 'ru' ? 'РУ' : language === 'ky' ? 'КЫ' : 'EN'}
                </span>
                <button
                  onClick={() => {
                    const languages = ['ru', 'en', 'ky']
                    const currentIndex = languages.indexOf(language)
                    const nextIndex = (currentIndex + 1) % languages.length
                    changeLanguage(languages[nextIndex])
                  }}
                  className="language-toggle"
                  aria-label="Change language"
                >
                  <ChevronDown size={16} className="icon" />
                </button>
              </div>
              
              <div className="user-menu-wrapper" ref={userMenuRef}>
                {isAuthenticated ? (
                  <>
                    <button 
                      className={`user-menu-trigger ${userMenuOpen ? 'active' : ''}`}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                    >
                      <div className="user-avatar">
                        {user?.full_name?.charAt(0)?.toUpperCase() || (
                          <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#FF6B6B" strokeWidth="1.7"/>
                            <path d="M20 21a8 8 0 1 0-16 0" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      {user?.full_name && <span className="user-name-text">{user.full_name}</span>}
                      <ChevronDown size={16} className={`chevron ${userMenuOpen ? 'open' : ''}`} />
                    </button>
                    
                    <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`} role="menu" aria-label="Профиль">
                      <Link to="/profile" className="dropdown-item" onClick={handleLinkClick} role="menuitem">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#111827" strokeWidth="1.7"/>
                          <path d="M20 21a8 8 0 1 0-16 0" stroke="#111827" strokeWidth="1.7" strokeLinecap="round"/>
                        </svg>
                        <span>{t('nav.profile')}</span>
                      </Link>
                      {user?.role === 'client' && (
                        <Link to="/client" className="dropdown-item" onClick={handleLinkClick} role="menuitem">
                          <LayoutDashboard size={18} />
                          <span>{t('nav.myCabinet')}</span>
                        </Link>
                      )}
                      {user?.role === 'professional' && (
                        <Link to="/professional" className="dropdown-item" onClick={handleLinkClick} role="menuitem">
                          <LayoutDashboard size={18} />
                          <span>{t('nav.masterCabinet')}</span>
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item admin-item" onClick={handleLinkClick} role="menuitem">
                          <Shield size={18} />
                          <span>{t('nav.adminPanel')}</span>
                        </Link>
                      )}
                      <Link to="/bookings" className="dropdown-item" onClick={handleLinkClick} role="menuitem">
                        <ShoppingBag size={18} />
                        <span>{t('nav.myOrders')}</span>
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item logout-item" role="menuitem">
                        <LogOut size={18} />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      className={`user-menu-trigger ${userMenuOpen ? 'active' : ''}`}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                    >
                      <div className="user-avatar">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#FF6B6B" strokeWidth="1.7"/>
                          <path d="M20 21a8 8 0 1 0-16 0" stroke="#FF6B6B" strokeWidth="1.7" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <ChevronDown size={16} className={`chevron ${userMenuOpen ? 'open' : ''}`} />
                    </button>
                    
                    <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`} role="menu" aria-label="Профиль">
                      <Link to="/login" className="dropdown-item" onClick={handleLinkClick} role="menuitem">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#111827" strokeWidth="1.7"/>
                          <path d="M20 21a8 8 0 1 0-16 0" stroke="#111827" strokeWidth="1.7" strokeLinecap="round"/>
                        </svg>
                        <span>{t('nav.login')}</span>
                      </Link>
                      <Link to="/register" className="dropdown-item" onClick={handleLinkClick} role="menuitem">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                          <path d="M12 5v14M5 12h14" stroke="#111827" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        <span>{t('nav.register')}</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className={`mobile-panel ${mobileMenuOpen ? 'show' : ''}`} id="mobilePanel" aria-label="Мобильное меню">
            <Link 
              to="/services" 
              className={isActive('/services') ? 'active' : ''} 
              onClick={handleLinkClick}
            >
              {t('nav.services')}
            </Link>
            <Link 
              to="/professionals" 
              className={isActive('/professionals') ? 'active' : ''} 
              onClick={handleLinkClick}
            >
              {t('nav.professionals')}
            </Link>
            <Link 
              to="/beauty-tracker" 
              className={isActive('/beauty-tracker') ? 'active' : ''} 
              onClick={handleLinkClick}
            >
              {t('nav.beautyTracker')}
            </Link>
            <Link 
              to="/news" 
              className={isActive('/news') ? 'active' : ''} 
              onClick={handleLinkClick}
            >
              {t('nav.news')}
            </Link>
            <Link 
              to="/shop" 
              className={isActive('/shop') ? 'active' : ''} 
              onClick={handleLinkClick}
            >
              {t('nav.shop')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

