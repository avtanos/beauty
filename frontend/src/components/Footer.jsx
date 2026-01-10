import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Suluu</h3>
            <p>Beauty Services</p>
          </div>
          
          <div className="footer-section">
            <h4>Услуги</h4>
            <ul>
              <li><Link to="/services">Все услуги</Link></li>
              <li><Link to="/professionals">Мастера</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Email: info@beautyservices.kg</p>
            <p>Телефон: +996 XXX XXX XXX</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Suluu. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

