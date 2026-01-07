import { useState, useEffect } from 'react'

const MockDataToggle = () => {
  const [useMock, setUseMock] = useState(
    localStorage.getItem('useMockData') !== 'false'
  )

  useEffect(() => {
    localStorage.setItem('useMockData', useMock.toString())
  }, [useMock])

  const handleToggle = () => {
    const newValue = !useMock
    setUseMock(newValue)
    localStorage.setItem('useMockData', newValue.toString())
    alert('Перезагрузите страницу для применения изменений')
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#fff',
      padding: '10px 15px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontSize: '12px',
      border: '1px solid #ddd'
    }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={useMock}
          onChange={handleToggle}
          style={{ cursor: 'pointer' }}
        />
        <span>Мок-данные</span>
      </label>
    </div>
  )
}

export default MockDataToggle

