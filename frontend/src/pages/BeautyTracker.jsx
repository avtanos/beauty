import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import SEO from '../components/SEO'
import './BeautyTracker.css'

function BeautyTracker() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [info, setInfo] = useState(null)
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [demoDay, setDemoDay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkedHabits, setCheckedHabits] = useState([true, true, false, false])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[BeautyTracker] Fetching public tracker data...')
        const [infoRes, programsRes] = await Promise.all([
          api.get('/tracker/public').catch(() => ({ data: null })),
          api.get('/tracker/public/programs').catch(() => ({ data: [] }))
        ])
        setInfo(infoRes.data)
        
        // Backend endpoint /tracker/public/programs уже фильтрует ТОЛЬКО активные программы
        // (проверка на строке 17-18 в tracker.py: models.TrackerProgramTemplate.is_active == True)
        // Но для дополнительной безопасности фильтруем на frontend тоже
        const allPrograms = programsRes.data || []
        const activePrograms = allPrograms.filter(program => 
          program.is_active !== false  // Если поле is_active отсутствует, считаем программу активной
        )
        
        console.log(`[BeautyTracker] ✅ Loaded ${activePrograms.length} active programs from backend (filtered from ${allPrograms.length} total):`, activePrograms.map(p => `${p.id}: ${p.name} (${p.days_count} days)`))
        setPrograms(activePrograms)
        
        // Если есть активные программы, загружаем первую для демо
        if (activePrograms.length > 0) {
          const firstProgram = activePrograms[0]
          console.log(`[BeautyTracker] Selecting first active program: ${firstProgram.name} (ID: ${firstProgram.id})`)
          setSelectedProgram(firstProgram)
          loadDemoDay(firstProgram.id)
        } else {
          console.log('[BeautyTracker] ⚠️ No active programs found')
          setSelectedProgram(null)
          setDemoDay(null)
        }
      } catch (error) {
        console.error('[BeautyTracker] ❌ Error fetching tracker info:', error)
        console.error('[BeautyTracker] Error details:', error.response?.data || error.message)
        setPrograms([])
        setSelectedProgram(null)
        setDemoDay(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const loadDemoDay = async (programId) => {
    try {
      console.log(`[BeautyTracker] Loading demo day for program ${programId}`)
      
      // Backend endpoint уже проверяет, что программа активна и возвращает только активные привычки
      const demoRes = await api.get(`/tracker/public/programs/${programId}/demo-day`).catch((error) => {
        console.error(`[BeautyTracker] Failed to load demo day for program ${programId}:`, error)
        return { data: null }
      })
      
      if (demoRes?.data) {
        // Backend endpoint уже возвращает только активные привычки
        // (проверка на строке 99 в tracker.py: if habit and habit.is_active)
        const habits = demoRes.data.habits || []
        
        setDemoDay(demoRes.data)
        
        // Сброс checkedHabits в зависимости от количества привычек
        if (habits.length > 0) {
          setCheckedHabits(new Array(habits.length).fill(false))
        } else {
          setCheckedHabits([])
        }
        
        console.log(`[BeautyTracker] ✅ Loaded demo day for program ${demoRes.data.program_name} with ${habits.length} active habits`)
      } else {
        console.warn(`[BeautyTracker] No demo day data for program ${programId}`)
        setDemoDay(null)
        setCheckedHabits([])
      }
    } catch (error) {
      console.error('[BeautyTracker] Error loading demo day:', error)
      setDemoDay(null)
      setCheckedHabits([])
    }
  }

  useEffect(() => {
    if (selectedProgram && selectedProgram.id) {
      loadDemoDay(selectedProgram.id)
    } else {
      setDemoDay(null)
      setCheckedHabits([])
    }
  }, [selectedProgram])

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
  
  const getHabitTitle = (habit) => {
    if (language === 'ru' && habit.title_ru) return habit.title_ru
    if (language === 'ky' && habit.title_ky) return habit.title_ky
    return habit.title
  }

  const handleCheckboxChange = (index) => {
    const newChecked = [...checkedHabits]
    newChecked[index] = !newChecked[index]
    setCheckedHabits(newChecked)
  }

  const completedCount = checkedHabits.filter(Boolean).length
  const totalHabits = checkedHabits.length
  const progressPercent = (completedCount / totalHabits) * 100

  // Demo habits if no data from API
  const demoHabits = demoDay?.habits || [
    { title: language === 'ru' ? 'Умывание + SPF' : language === 'ky' ? 'Жууу + SPF' : 'Washing + SPF', category: 'face' },
    { title: language === 'ru' ? 'Увлажнение тела' : language === 'ky' ? 'Дене нымдатуу' : 'Body moisturizing', category: 'body' },
    { title: language === 'ru' ? '10 минут растяжки' : language === 'ky' ? '10 мүнөт созулуу' : '10 minutes stretching', category: 'lifestyle' },
    { title: language === 'ru' ? 'Вода 6–8 стаканов' : language === 'ky' ? 'Суу 6–8 стакан' : 'Water 6–8 glasses', category: 'lifestyle' }
  ]

  const baseUrl = window.location.origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Beauty Tracker",
    "applicationCategory": "HealthApplication",
    "description": t('seo.tracker.description'),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KGS"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100+"
    }
  }

  if (loading) {
    return <div className="bt-loading">{t('common.loading')}</div>
  }

  const subtitleText = language === 'ru' 
    ? 'Мягкая 30-дневная программа привычек красоты и заботы о себе. Каждый день — простой план без перегрузки и лишней сложности.'
    : language === 'ky'
    ? 'Сулуулук жана өзүңүзгө кам көрүүнүн жумшак 30 күндүк программасы. Ар бир күн — жүктөлүү жана керексиз татаалдыксыз жөнөкөй план.'
    : 'A gentle 30-day program of beauty habits and self-care. Every day is a simple plan without overload and unnecessary complexity.'

  const getProgramDescription = (program) => {
    if (language === 'ru' && program.description_ru) return program.description_ru
    if (language === 'ky' && program.description_ky) return program.description_ky
    return program.description || ''
  }

  return (
    <div className="bt-page">
      <SEO
        title={t('seo.tracker.title')}
        description={t('seo.tracker.description')}
        keywords={t('seo.tracker.keywords')}
        type="website"
        schema={schema}
      />
      <section className="bt-hero">
        <div className="bt-container">
          <div className="bt-heroTop">
            <div className="bt-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <path d="M12 2l1.4 5L18 9l-4.6 2L12 16l-1.4-5L6 9l4.6-2L12 2Z"
                      stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M4.5 13l.7 2.5 2.3 1-2.3 1-.7 2.5-.7-2.5-2.3-1 2.3-1 .7-2.5Z"
                      stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" opacity=".7"/>
              </svg>
            </div>

            <h1 className="bt-title">{getTitle()}</h1>

            <p className="bt-subtitle">
              {subtitleText.split('. ').map((part, i, arr) => (
                <span key={i}>
                  {part}{i < arr.length - 1 ? '. ' : ''}
                  {i === 0 && <br />}
                </span>
              ))}
            </p>

            {/* Список программ */}
            {programs.length > 0 && (
              <div className="bt-programs-list" style={{ 
                marginTop: '2rem', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1rem',
                justifyContent: 'center'
              }}>
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => setSelectedProgram(program)}
                    style={{
                      padding: '1rem 1.5rem',
                      border: selectedProgram?.id === program.id ? '2px solid #ff6b9d' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedProgram?.id === program.id ? '#fff5f8' : '#fff',
                      minWidth: '200px',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProgram?.id !== program.id) {
                        e.currentTarget.style.borderColor = '#ff6b9d'
                        e.currentTarget.style.backgroundColor = '#fffafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProgram?.id !== program.id) {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.backgroundColor = '#fff'
                      }
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      color: selectedProgram?.id === program.id ? '#ff6b9d' : '#333'
                    }}>
                      {program.name}
                    </h3>
                    <p style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '0.9rem', 
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {getProgramDescription(program)}
                    </p>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#999',
                      fontWeight: '500'
                    }}>
                      {program.days_count} {language === 'ru' ? 'дней' : language === 'ky' ? 'күн' : 'days'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bt-actions" style={{ marginTop: programs.length > 0 ? '2rem' : '0' }}>
              {user ? (
                <Link 
                  to={user.role === 'professional' ? '/professional/tracker' : '/client/tracker'} 
                  className="bt-btn bt-btnPrimary"
                >
                  {language === 'ru' ? 'Начать' : language === 'ky' ? 'Баштоо' : 'Start'}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bt-btn bt-btnPrimary">
                    {language === 'ru' ? 'Начать' : language === 'ky' ? 'Баштоо' : 'Start'}
                  </Link>
                  <Link to="/beauty-tracker" className="bt-btn bt-btnGhost">
                    {language === 'ru' ? 'Как работает' : language === 'ky' ? 'Кантип иштейт' : 'How it works'}
                  </Link>
                </>
              )}
            </div>
          </div>

          {selectedProgram && demoDay && (
            <div className="bt-card">
              <div className="bt-cardHeader">
                <div>
                  <div className="bt-kicker">
                    {language === 'ru' ? 'Сегодня' : language === 'ky' ? 'Бүгүн' : 'Today'}
                  </div>
                  <div className="bt-cardTitle">
                    {language === 'ru' 
                      ? `День ${demoDay.day_number} из ${selectedProgram.days_count}` 
                      : language === 'ky' 
                      ? `Күн ${demoDay.day_number}/${selectedProgram.days_count}` 
                      : `Day ${demoDay.day_number} of ${selectedProgram.days_count}`}
                  </div>
                  {selectedProgram.name && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.9rem', 
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      {selectedProgram.name}
                    </div>
                  )}
                </div>

              <div className="bt-progressWrap" aria-label={language === 'ru' ? 'Прогресс дня' : 'Day progress'}>
                <div className="bt-progressMeta">
                  <span>{language === 'ru' ? 'Выполнено' : language === 'ky' ? 'Аякталды' : 'Completed'}</span>
                  <span className="bt-progressValue">{completedCount}/{totalHabits}</span>
                </div>
                <div className="bt-progressBar">
                  <div className="bt-progressFill" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bt-grid">
              <div className="bt-panel">
                <div className="bt-panelTitle">
                  {language === 'ru' ? 'План на сегодня' : language === 'ky' ? 'Бүгүнкү план' : 'Plan for today'}
                </div>

                {demoHabits.map((habit, index) => (
                  <label key={index} className="bt-check">
                    <input 
                      type="checkbox" 
                      checked={checkedHabits[index] || false}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <span>{getHabitTitle(habit)}</span>
                  </label>
                ))}

                <div className="bt-panelActions">
                  <button 
                    className="bt-btn bt-btnPrimary bt-btnBlock" 
                    type="button"
                    onClick={() => {
                      if (user) {
                        // Save progress logic here
                        console.log('Saving progress...')
                      } else {
                        window.location.href = '/#/register'
                      }
                    }}
                  >
                    {language === 'ru' ? 'Сохранить прогресс' : language === 'ky' ? 'Прогрести сакта' : 'Save progress'}
                  </button>
                  {user ? (
                    <Link 
                      to={user.role === 'professional' ? '/professional/tracker' : '/client/tracker'} 
                      className="bt-btn bt-btnText"
                    >
                      {language === 'ru' ? 'Открыть весь план' : language === 'ky' ? 'Бардык пландды ачуу' : 'Open full plan'}
                    </Link>
                  ) : (
                    <Link to="/register" className="bt-btn bt-btnText">
                      {language === 'ru' ? 'Открыть весь план' : language === 'ky' ? 'Бардык пландды ачуу' : 'Open full plan'}
                    </Link>
                  )}
                </div>
              </div>

              <div className="bt-panel bt-panelSoft">
                <div className="bt-panelTitle">
                  {language === 'ru' ? 'Почему это удобно' : language === 'ky' ? 'Эмне үчүн ыңгайлуу' : 'Why it\'s convenient'}
                </div>

                <ul className="bt-list">
                  <li>
                    {language === 'ru' 
                      ? 'Дни открываются последовательно: день N после N-1.'
                      : language === 'ky'
                      ? 'Күндөр ырааттуу ачылат: N күн N-1ден кийин.'
                      : 'Days open sequentially: day N after N-1.'}
                  </li>
                  <li>
                    {language === 'ru' 
                      ? 'Короткие задачи: 5–10 минут в день.'
                      : language === 'ky'
                      ? 'Кыска маселелер: күнүнө 5–10 мүнөт.'
                      : 'Short tasks: 5–10 minutes a day.'}
                  </li>
                  <li>
                    {language === 'ru' 
                      ? 'Прогресс, серия дней и мотивация.'
                      : language === 'ky'
                      ? 'Прогресс, күндөрдүн сериясы жана мотивация.'
                      : 'Progress, series of days and motivation.'}
                  </li>
                </ul>

                <div className="bt-miniCards">
                  <div className="bt-mini">
                    {language === 'ru' ? 'Лицо' : language === 'ky' ? 'Бет' : 'Face'}
                  </div>
                  <div className="bt-mini">
                    {language === 'ru' ? 'Тело' : language === 'ky' ? 'Дене' : 'Body'}
                  </div>
                  <div className="bt-mini">
                    {language === 'ru' ? 'Здоровье' : language === 'ky' ? 'Ден соолук' : 'Health'}
                  </div>
                  <div className="bt-mini bt-locked">
                    {language === 'ru' 
                      ? 'День 2 (завтра)' 
                      : language === 'ky' 
                      ? 'Күн 2 (эртең)' 
                      : 'Day 2 (tomorrow)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default BeautyTracker
