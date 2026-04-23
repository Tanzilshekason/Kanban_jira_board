import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Reports from './components/Reports'
import './App.css'

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = window.location.pathname

  return (
    <div className="authenticated-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">V</span>
            <span className="logo-text">VibeFlow</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-group-title">PLANNING</div>
            <Link to="/" className={location === '/' ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">📋</span>
              <span className="nav-text">Kanban Board</span>
            </Link>
            <Link to="/reports" className={location === '/reports' ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">📊</span>
              <span className="nav-text">Reports</span>
            </Link>
          </div>
          <div className="nav-group">
            <div className="nav-group-title">SYSTEM</div>
            <a href="/admin/" className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Admin Panel</span>
            </a>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
            <div className="user-details">
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-container">
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumbs">
              <span>Projects</span> / <span>VibeFlow</span> / <span>{location === '/reports' ? 'Reports' : 'Kanban Board'}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-actions">
              <button onClick={logout} className="logout-btn-minimal" title="Logout">
                🚪 Logout
              </button>
            </div>
          </div>
        </header>
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  )
}

// Main app content that uses authentication and routing
const AppContent = () => {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading VibeFlow...</p>
      </div>
    )
  }

  if (user) {
    return (
      <AuthenticatedLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/time" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthenticatedLayout>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          showRegister ? (
            <Register onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <Login onSwitchToRegister={() => setShowRegister(true)} />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App component with AuthProvider and Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
