import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import api from '../services/api'
import SEO from '../components/SEO'
import './Professionals.css'

const Professionals = () => {
  const { t } = useLanguage()
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const response = await api.get('/users/professionals?min_rating=4.8')
      setProfessionals(response.data)
    } catch (error) {
      console.error('Failed to fetch professionals:', error)
    } finally {
      setLoading(false)
    }
  }

  const baseUrl = window.location.origin
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": professionals.slice(0, 10).map((prof, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": prof.full_name,
        "jobTitle": "Beauty Professional",
        "aggregateRating": prof.rating ? {
          "@type": "AggregateRating",
          "ratingValue": prof.rating,
          "ratingCount": prof.total_reviews || 0
        } : undefined
      }
    }))
  }

  return (
    <div className="professionals-page">
      <SEO
        title={t('seo.professionals.title')}
        description={t('seo.professionals.description')}
        keywords={t('seo.professionals.keywords')}
        type="website"
        schema={schema}
      />
      <div className="container">
        <h1 className="page-title">{t('professionals.title')}</h1>
        <p className="page-subtitle">
          {t('home.highRatingDesc')}
        </p>

        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : professionals.length === 0 ? (
          <div className="empty-state">
            <p>{t('common.error')}</p>
          </div>
        ) : (
          <div className="professionals-grid">
            {professionals.map((professional) => (
              <Link
                key={professional.id}
                to={`/professionals/${professional.id}`}
                className="professional-card"
              >
                <div className="professional-avatar">
                  {professional.profile_image ? (
                    <img
                      src={professional.profile_image}
                      alt={professional.full_name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {professional.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="professional-info">
                  <h3>{professional.full_name}</h3>
                  <div className="professional-rating">
                    <span className="rating-stars">
                      {'★'.repeat(Math.floor(professional.rating || 0))}
                    </span>
                    <span className="rating-value">
                      {professional.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="rating-count">
                      ({professional.total_reviews || 0} отзывов)
                    </span>
                  </div>
                  {professional.bio && (
                    <p className="professional-bio">{professional.bio}</p>
                  )}
                  {professional.experience_years && (
                    <p className="professional-experience">
                      Опыт: {professional.experience_years} лет
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Professionals

