import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Professionals from './pages/Professionals'
import ProfessionalDetail from './pages/ProfessionalDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Bookings from './pages/Bookings'
import BookingForm from './pages/BookingForm'
import AdminDashboard from './pages/AdminDashboard'
import ProfessionalCabinet from './pages/ProfessionalCabinet'
import ClientCabinet from './pages/ClientCabinet'
import BeautyTracker from './pages/BeautyTracker'
import TrackerPage from './pages/TrackerPage'
import ProtectedRoute from './components/ProtectedRoute'
import MockDataToggle from './components/MockDataToggle'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/professionals" element={<Professionals />} />
              <Route path="/professionals/:id" element={<ProfessionalDetail />} />
              <Route path="/beauty-tracker" element={<BeautyTracker />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/new/:serviceId"
                element={
                  <ProtectedRoute>
                    <BookingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/professional"
                element={
                  <ProtectedRoute>
                    <ProfessionalCabinet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client"
                element={
                  <ProtectedRoute>
                    <ClientCabinet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/tracker"
                element={
                  <ProtectedRoute>
                    <TrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/professional/tracker"
                element={
                  <ProtectedRoute>
                    <TrackerPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <MockDataToggle />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

