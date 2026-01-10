import { useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * SEO Component for managing page meta tags and Schema.org structured data
 */
const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  type = 'website',
  schema
}) => {
  const { language } = useLanguage()

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    if (description) {
      metaDescription.setAttribute('content', description)
    }

    // Update or create meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }

    // Update Open Graph tags
    const updateOGTag = (property, content) => {
      if (!content) return
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    updateOGTag('og:title', title)
    updateOGTag('og:description', description)
    updateOGTag('og:type', type)
    updateOGTag('og:image', image || `${window.location.origin}/vite.svg`)
    updateOGTag('og:url', window.location.href)
    updateOGTag('og:locale', language === 'ru' ? 'ru_RU' : language === 'ky' ? 'ky_KG' : 'en_US')

    // Update Twitter Card tags
    const updateTwitterTag = (name, content) => {
      if (!content) return
      let tag = document.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    updateTwitterTag('twitter:card', 'summary_large_image')
    updateTwitterTag('twitter:title', title)
    updateTwitterTag('twitter:description', description)
    if (image) {
      updateTwitterTag('twitter:image', image)
    }

    // Update language attribute
    document.documentElement.lang = language

    // Add Schema.org structured data
    let schemaScript = document.getElementById('schema-org-data')
    if (schema) {
      if (schemaScript) {
        schemaScript.remove()
      }
      schemaScript = document.createElement('script')
      schemaScript.id = 'schema-org-data'
      schemaScript.type = 'application/ld+json'
      schemaScript.textContent = JSON.stringify(schema)
      document.head.appendChild(schemaScript)
    } else if (schemaScript) {
      schemaScript.remove()
    }
  }, [title, description, keywords, image, type, schema, language])

  return null
}

export default SEO
