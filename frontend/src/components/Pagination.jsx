import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './Pagination.css'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 10,
  totalItems,
  onItemsPerPageChange 
}) => {
  const { language } = useLanguage()
  
  if (totalPages <= 1 && !onItemsPerPageChange) {
    return null
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        {totalItems !== undefined && (
          <span className="pagination-text">
            {language === 'ru' 
              ? `Показано ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} из ${totalItems}`
              : language === 'ky'
              ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} ${totalItems}дан`
              : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}`
            }
          </span>
        )}
        {onItemsPerPageChange && (
          <div className="items-per-page">
            <label>
              {language === 'ru' ? 'На странице:' : language === 'ky' ? 'Баракта:' : 'Per page:'}
            </label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="items-per-page-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={language === 'ru' ? 'Предыдущая страница' : language === 'ky' ? 'Мурунку барак' : 'Previous page'}
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={language === 'ru' ? 'Следующая страница' : language === 'ky' ? 'Кийинки барак' : 'Next page'}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
