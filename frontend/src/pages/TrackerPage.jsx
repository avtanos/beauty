import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  CheckCircle, Circle, Calendar, TrendingUp, SkipForward, 
  Lock, Sparkles, Target, BarChart3 
} from 'lucide-react'
import api from '../services/api'
import './TrackerPage.css'

function TrackerPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [program, setProgram] = useState(null)
  const [currentDay, setCurrentDay] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [programRes, progressRes] = await Promise.all([
        api.get('/tracker/programs/current').catch(() => ({ data: null })),
        api.get('/tracker/progress').catch(() => ({ data: null }))
      ])

      if (programRes.data) {
        setProgram(programRes.data)
        loadCurrentDay()
      }
      
      if (progressRes.data) {
        setProgress(progressRes.data)
      }
    } catch (err) {
      setError(t('common.error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentDay = async () => {
    try {
      const res = await api.get('/tracker/days/current')
      setCurrentDay(res.data)
    } catch (err) {
      console.error('Error loading current day:', err)
    }
  }

  const startProgram = async () => {
    try {
      const res = await api.post('/tracker/programs/start')
      setProgram(res.data)
      await loadCurrentDay()
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка запуска программы')
    }
  }

  const toggleHabit = async (habitId) => {
    if (!currentDay) return
    
    try {
      await api.post(`/tracker/days/${currentDay.day_number}/habits/${habitId}/toggle`)
      await loadCurrentDay()
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка обновления привычки')
    }
  }

  const completeDay = async () => {
    if (!currentDay) return
    
    try {
      await api.post(`/tracker/days/${currentDay.day_number}/complete`)
      await loadData()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка завершения дня')
    }
  }

  const skipDay = async () => {
    if (!currentDay) return
    
    if (!window.confirm(t('tracker.skipDay') + '?')) {
      return
    }
    
    try {
      await api.post(`/tracker/days/${currentDay.day_number}/skip`)
      await loadData()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.detail || 'Ошибка пропуска дня')
    }
  }

  if (loading) {
    return (
      <div className="tracker-page">
        <div className="tracker-loading">{t('common.loading')}</div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="tracker-page">
        <div className="tracker-start">
          <div className="start-card">
            <Sparkles className="start-icon" size={64} />
            <h1>{t('tracker.title')}</h1>
            <p>{t('tracker.startJourney')}</p>
            {error && <div className="error-message">{error}</div>}
            <button onClick={startProgram} className="start-button">
              {t('tracker.startProgram')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'face': return '🧴'
      case 'body': return '💆'
      case 'lifestyle': return '🌿'
      case 'focus': return '✨'
      default: return '✓'
    }
  }

  const getCategoryName = (category) => {
    return t(`tracker.categories.${category}`) || category
  }
  
  const getHabitTitle = (habit) => {
    if (language === 'ru' && habit.title_ru) return habit.title_ru
    if (language === 'ky' && habit.title_ky) return habit.title_ky
    return habit.title
  }
  
  const getHabitDescription = (habit) => {
    if (language === 'ru' && habit.description_ru) return habit.description_ru
    if (language === 'ky' && habit.description_ky) return habit.description_ky
    return habit.description
  }
  
  const getFocusText = () => {
    if (!currentDay) return null
    if (language === 'ru' && currentDay.focus_text_ru) return currentDay.focus_text_ru
    if (language === 'ky' && currentDay.focus_text_ky) return currentDay.focus_text_ky
    return currentDay.focus_text
  }

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <div className="header-content">
          <Sparkles className="header-icon" />
          <div>
            <h1>{t('tracker.title')}</h1>
            <p className="header-subtitle">{t('tracker.subtitle')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {progress && (
        <div className="progress-section">
          <div className="progress-card">
            <div className="progress-item">
              <BarChart3 className="progress-icon" />
              <div>
                <div className="progress-label">{t('tracker.progress')}</div>
                <div className="progress-value">{progress.completion_percentage.toFixed(0)}%</div>
              </div>
            </div>
            <div className="progress-item">
              <CheckCircle className="progress-icon" />
              <div>
                <div className="progress-label">{t('tracker.completed')}</div>
                <div className="progress-value">{progress.completed_days} / 30</div>
              </div>
            </div>
            <div className="progress-item">
              <TrendingUp className="progress-icon" />
              <div>
                <div className="progress-label">{t('tracker.streak')}</div>
                <div className="progress-value">{progress.current_streak} {t('tracker.days')}</div>
              </div>
            </div>
            <div className="progress-item">
              <SkipForward className="progress-icon" />
              <div>
                <div className="progress-label">{t('tracker.usedSkips')}</div>
                <div className="progress-value">{progress.used_skips} / {progress.allowed_skips}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentDay && (
        <div className="current-day-section">
          <div className="day-card">
            <div className="day-header">
              <Calendar className="day-icon" />
              <div>
                <h2>{t('tracker.day')} {currentDay.day_number}</h2>
                {getFocusText() && (
                  <p className="day-focus">{getFocusText()}</p>
                )}
              </div>
            </div>

            {currentDay.status === 'locked' && (
              <div className="locked-message">
                <Lock />
                <p>{t('tracker.locked')}</p>
              </div>
            )}

            {currentDay.status === 'open' && (
              <>
                <div className="habits-list">
                  <h3>{t('tracker.habits')}</h3>
                  {currentDay.habits?.map((habit) => (
                    <div 
                      key={habit.id} 
                      className={`habit-item ${habit.completed ? 'completed' : ''}`}
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <div className="habit-check">
                        {habit.completed ? (
                          <CheckCircle className="check-icon" />
                        ) : (
                          <Circle className="check-icon" />
                        )}
                      </div>
                      <div className="habit-content">
                        <div className="habit-header">
                          <span className="habit-category">
                            {getCategoryIcon(habit.category)} {getCategoryName(habit.category)}
                          </span>
                        </div>
                        <div className="habit-title">{getHabitTitle(habit)}</div>
                        {getHabitDescription(habit) && (
                          <div className="habit-description">{getHabitDescription(habit)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="day-actions">
                  <button 
                    onClick={skipDay}
                    className="action-button skip"
                    disabled={progress && progress.used_skips >= progress.allowed_skips}
                  >
                    <SkipForward />
                    {t('tracker.skipDay')}
                  </button>
                  <button 
                    onClick={completeDay}
                    className="action-button complete"
                  >
                    <CheckCircle />
                    {t('tracker.completeDay')}
                  </button>
                </div>
              </>
            )}

            {currentDay.status === 'completed' && (
              <div className="completed-message">
                <CheckCircle className="completed-icon" />
                <p>{t('tracker.dayCompleted')}</p>
              </div>
            )}

            {currentDay.status === 'skipped' && (
              <div className="skipped-message">
                <SkipForward className="skipped-icon" />
                <p>{t('tracker.daySkipped')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!currentDay && program && (
        <div className="no-day-message">
          <p>{t('common.loading')}</p>
        </div>
      )}
    </div>
  )
}

export default TrackerPage
