// ====================================================================================================
// FILE: frontend/src/App.jsx
// TUJUAN:
// Komponen Root aplikasi Single Page Application (SPA) React menggunakan React Router v6.
// Mengatur:
// 1. Sistem Routing Halaman Publik (Beranda '/', Jelajah '/explore', Tentang '/about').
// 2. Proteksi Halaman Administrator ('/admin/*') dengan Route Guard berbasis Token.
// 3. Layout Utama (Navbar kaca modern, Hero tanpa jarak/gap, Footer, dan deteksi offline status).
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Compass, WifiOff } from 'lucide-react';
import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';
import ItineraryPlanner from './pages/ItineraryPlanner';
import UmkmMarketplace from './pages/UmkmMarketplace';

// Mengimpor halaman & modul khusus Administrator dari folder src/admin
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

// ====================================================================================================
// KOMPONEN: ProtectedRoute (Route Guard)
// TUJUAN:
// Memastikan hanya user yang memiliki token login valid di localStorage yang dapat mengakses
// halaman manajemen admin. Jika belum login, otomatis dialihkan ke '/admin/login'.
// ====================================================================================================
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('tobaguide_admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// ====================================================================================================
// KOMPONEN: MainLayout
// TUJUAN:
// Kerangka antarmuka pengguna publik yang mencakup Navbar responsif, Banner deteksi koneksi offline,
// kontainer konten utama yang rapat ke atas (flush edge-to-edge), dan Footer resmi.
// ====================================================================================================
const MainLayout = ({ children }) => {
  // State untuk memonitor apakah perangkat pengguna terputus dari internet (offline mode)
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
      {/* Banner peringatan jika internet terputus */}
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

      {/* Navigasi Utama Publik */}
      <nav className="navbar glass-panel">
        <div className="container nav-content">
          <NavLink to="/" className="logo" style={{ textDecoration: 'none' }}>
            <Compass size={28} color="var(--color-primary)" />
            <h1>TobaRoute <span className="highlight">AI</span></h1>
          </NavLink>
          <div className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => (isActive ? 'active' : '')}
              end
            >
              Beranda
            </NavLink>
            <NavLink 
              to="/planner" 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Itinerary AI
            </NavLink>
            <NavLink 
              to="/umkm" 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Sentra UMKM
            </NavLink>
            <NavLink 
              to="/explore" 
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Jelajah GIS
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

      {/* Kontainer Badan Aplikasi (Tanpa Padding Gap ke Navbar) */}
      <div className="app-main-body">
        {children}
      </div>

      {/* Footer Navigasi Publik */}
      <footer className="footer">
        <div className="container footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.88rem' }}>
            <NavLink to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Beranda</NavLink>
            <NavLink to="/planner" style={{ color: '#64748b', textDecoration: 'none' }}>Studio Itinerary</NavLink>
            <NavLink to="/umkm" style={{ color: '#64748b', textDecoration: 'none' }}>Sentra UMKM</NavLink>
            <NavLink to="/explore" style={{ color: '#64748b', textDecoration: 'none' }}>Peta Jelajah</NavLink>
            <NavLink to="/about" style={{ color: '#64748b', textDecoration: 'none' }}>Tentang & Riset</NavLink>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
            &copy; 2026 TobaRoute AI. Platform Kecerdasan Pariwisata & Pemberdayaan UMKM Kawasan Danau Toba.
          </p>
        </div>
      </footer>
    </div>
  );
};

// ====================================================================================================
// KOMPONEN UTAMA: App
// TUJUAN: Mendefinisikan seluruh pemetaan URL rute aplikasi dengan React Router.
// ====================================================================================================
function App() {
  return (
    <Router>
      <Routes>
        {/* RUTE HALAMAN PUBLIK */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/planner" element={<MainLayout><ItineraryPlanner /></MainLayout>} />
        <Route path="/umkm" element={<MainLayout><UmkmMarketplace /></MainLayout>} />
        <Route path="/explore" element={<MainLayout><Explore /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />

        {/* RUTE OTENTIKASI ADMINISTRATOR */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* RUTE PORTAL ADMINISTRATOR (DIPROTEKSI OLEH TOKEN) */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="ai-monitoring" element={<AdminAIMonitoring />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* REDIRECT URL TIDAK DIKENAL KEMBALI KE BERANDA */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
