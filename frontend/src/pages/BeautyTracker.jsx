import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { CheckCircle, Sparkles, Calendar, Target, Heart } from 'lucide-react'
import api from '../services/api'
import './BeautyTracker.css'

function BeautyTracker() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [info, setInfo] = useState(null)
  const [demoDay, setDemoDay] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, demoRes] = await Promise.all([
          api.get('/tracker/public'),
          api.get('/tracker/public/demo-day').catch(() => null)
        ])
        setInfo(infoRes.data)
        setDemoDay(demoRes?.data || null)
      } catch (error) {
        console.error('Error fetching tracker info:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getTitle = () => {
    if (language === 'ru' && info?.title_ru) return info.title_ru
    if (language === 'ky' && info?.title_ky) return info.title_ky
    return info?.title || t('tracker.title')
  }
  
  const getDescription = () => {
    if (language === 'ru' && info?.description_ru) return info.description_ru
    if (language === 'ky' && info?.description_ky) return info.description_ky
    return info?.description || t('tracker.description')
  }
  
  const getBenefits = () => {
    if (language === 'ru' && info?.benefits_ru) return info.benefits_ru
    if (language === 'ky' && info?.benefits_ky) return info.benefits_ky
    return info?.benefits || []
  }
  
  const getHabitTitle = (habit) => {
    if (language === 'ru' && habit.title_ru) return habit.title_ru
    if (language === 'ky' && habit.title_ky) return habit.title_ky
    return habit.title
  }
  
  const getFocusText = () => {
    if (!demoDay) return null
    if (language === 'ru' && demoDay.focus_text_ru) return demoDay.focus_text_ru
    if (language === 'ky' && demoDay.focus_text_ky) return demoDay.focus_text_ky
    return demoDay.focus_text
  }

  if (loading) {
    return <div className="beauty-tracker-loading">{t('common.loading')}</div>
  }

  return (
    <div className="beauty-tracker-page">
      <div className="beauty-tracker-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Sparkles size={64} />
          </div>
          <h1>{getTitle()}</h1>
          <p className="hero-subtitle">
            {getDescription()}
          </p>
        </div>
      </div>

      <div className="beauty-tracker-content">
        <section className="tracker-section">
          <h2>{t('tracker.title')}</h2>
          <p>
            {t('tracker.description')}
          </p>
        </section>

        <section className="tracker-section">
          <h2>{language === 'ru' ? 'Преимущества' : language === 'ky' ? 'Артыкчылыктар' : 'Benefits'}</h2>
          <div className="benefits-grid">
            {getBenefits().map((benefit, index) => (
              <div key={index} className="benefit-card">
                <CheckCircle className="benefit-icon" />
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {demoDay && (
          <section className="tracker-section demo-section">
            <h2>{language === 'ru' ? 'Пример дня' : language === 'ky' ? 'Күн мисалы' : 'Example Day'}</h2>
            <div className="demo-day-card">
              <div className="demo-day-header">
                <Calendar className="demo-icon" />
                <h3>{t('tracker.day')} {demoDay.day_number}</h3>
              </div>
              {getFocusText() && (
                <p className="demo-focus">{getFocusText()}</p>
              )}
              <div className="demo-habits">
                <h4>{t('tracker.habits')}:</h4>
                <ul>
                  {demoDay.habits?.map((habit, idx) => (
                    <li key={idx}>
                      <span className="habit-category">{t(`tracker.categories.${habit.category}`)}</span>
                      {getHabitTitle(habit)}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="demo-note">
                {language === 'ru' ? 'Это демо-версия. Для полного доступа зарегистрируйтесь.' : 
                 language === 'ky' ? 'Бул демо-версия. Толук жеткиликтүүлүк үчүн катталыңыз.' :
                 'This is a demo version. Register for full access.'}
              </p>
            </div>
          </section>
        )}

        <section className="tracker-section cta-section">
          <div className="cta-card">
            <Target className="cta-icon" />
            <h2>{language === 'ru' ? 'Готовы начать?' : language === 'ky' ? 'Баштоого даярсызбы?' : 'Ready to start?'}</h2>
            <p>
              {language === 'ru' ? 'Присоединяйтесь к программе и начните свой путь к регулярному уходу за собой.' :
               language === 'ky' ? 'Программага кошулуп, өзүңүзгө кам көрүүнүн туруктуулугуна жолуңузду баштаңыз.' :
               'Join the program and start your journey to consistent self-care.'}
            </p>
            {user ? (
              <Link to={user.role === 'professional' ? '/professional/tracker' : '/client/tracker'} className="cta-button">
                {language === 'ru' ? 'Открыть мой трекер' : language === 'ky' ? 'Менин трекеримди ачуу' : 'Open my tracker'}
              </Link>
            ) : (
              <div className="cta-buttons">
                <Link to="/register" className="cta-button primary">
                  {t('nav.register')}
                </Link>
                <Link to="/login" className="cta-button secondary">
                  {t('nav.login')}
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default BeautyTracker
