import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Что-то пошло не так</h1>
          <p>Пожалуйста, обновите страницу</p>
          <button onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary>Детали ошибки</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

