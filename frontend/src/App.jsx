import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Compass, WifiOff } from 'lucide-react';
import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';

// Admin Imports dari Folder Khusus (src/admin)
import { 
  AdminLogin, 
  AdminLayout, 
  AdminDashboard, 
  AdminDestinations, 
  AdminContent, 
  AdminAIMonitoring,
  AdminSettings 
} from './admin';

import './App.css';

const MainLayout = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Offline Status Warning Banner */}
      {isOffline && (
        <div className="offline-banner fade-in" style={{
          background: '#fef2f2',
          color: '#991b1b',
          borderBottom: '1px solid #fecaca',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          position: 'sticky',
          top: 0,
          zIndex: 10000
        }}>
          <WifiOff size={16} /> Mode Offline: Koneksi jaringan terputus. TobaRoute tetap dapat digunakan dengan data tersimpan tanpa reload otomatis.
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar glass-panel">
        <div className="container nav-content">
          <div className="logo">
            <Compass size={28} color="var(--color-primary)" />
            <h1>TobaRoute <span className="highlight">AI</span></h1>
          </div>
          <div className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => (isActive ? 'active' : '')}
              end
            >
              Beranda
            </NavLink>
            <NavLink 
              to="/explore" 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Jelajah
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Tentang
            </NavLink>
          </div>
        </div>
      </nav>

      {children}

      <footer className="footer">
        <p>&copy; 2026 TobaRoute AI. Dibangun untuk mendukung Keadilan Pariwisata Danau Toba.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />

        {/* ADMIN AUTH ROUTE */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN DASHBOARD PORTAL ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="ai-monitoring" element={<AdminAIMonitoring />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

