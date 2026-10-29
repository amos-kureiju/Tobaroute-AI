// ====================================================================================================
// FILE: frontend/src/App.jsx
// TUJUAN:
// Komponen Root aplikasi Single Page Application (SPA) React menggunakan React Router v6.
// Mengatur:
// 1. Sistem Routing Halaman Publik (Beranda '/', Jelajah '/explore', Tentang '/about', dll).
// 2. Proteksi Halaman Administrator ('/admin/*') dengan Route Guard berbasis Token.
// 3. Layout Utama: Navbar kaca premium, tombol aksi cepat, footer inspiratif, dan offline banner.
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  Compass, WifiOff, Sparkles, Store, Navigation, 
  Info, MapPin, Phone, ShieldCheck, Heart, Menu, X, ArrowRight 
} from 'lucide-react';
import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';
import ItineraryPlanner from './pages/ItineraryPlanner';
import UmkmMarketplace from './pages/UmkmMarketplace';
import AIChatWidget from './components/AIChatWidget';

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
// ====================================================================================================
const MainLayout = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  // Tutup mobile menu saat pindah rute
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Banner peringatan jika internet terputus */}
      {isOffline && (
        <div className="offline-banner fade-in">
          <WifiOff size={16} /> Mode Offline: Koneksi terputus. TobaRoute tetap dapat digunakan dengan data tersimpan.
        </div>
      )}

      {/* Navigasi Utama Publik */}
      <header className="navbar-wrapper">
        <nav className="navbar glass-navbar">
          <div className="container nav-content">
            
            {/* Logo Brand */}
            <NavLink to="/" className="logo-brand" style={{ textDecoration: 'none' }}>
              <div className="logo-icon-wrap">
                <Compass size={24} className="logo-compass" />
              </div>
              <div className="logo-text-group">
                <div className="logo-title">
                  TobaRoute <span className="logo-ai-badge">AI</span>
                </div>
                <span className="logo-subtag">UNESCO Geopark Guide</span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <div className="nav-links-desktop">
              <NavLink 
                to="/" 
                className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
                end
              >
                <Compass size={15} /> Beranda
              </NavLink>
              <NavLink 
                to="/planner" 
                className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
              >
                <Sparkles size={15} /> Itinerary AI
              </NavLink>
              <NavLink 
                to="/umkm" 
                className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
              >
                <Store size={15} /> Sentra UMKM
              </NavLink>
              <NavLink 
                to="/explore" 
                className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
              >
                <Navigation size={15} /> Jelajah GIS
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => (isActive ? 'nav-item-link active' : 'nav-item-link')}
              >
                <Info size={15} /> Tentang
              </NavLink>
            </div>

            {/* Quick Action Button */}
            <div className="nav-right-actions">
              <NavLink to="/planner" className="btn-nav-action">
                <Sparkles size={14} /> Rencanakan Trip
              </NavLink>
              
              {/* Mobile Menu Toggle Button */}
              <button 
                type="button"
                className="btn-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="mobile-nav-dropdown fade-in">
              <NavLink to="/" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')} end>
                <Compass size={16} /> Beranda
              </NavLink>
              <NavLink to="/planner" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
                <Sparkles size={16} /> Itinerary AI Studio
              </NavLink>
              <NavLink to="/umkm" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
                <Store size={16} /> Sentra UMKM Lokal
              </NavLink>
              <NavLink to="/explore" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
                <Navigation size={16} /> Peta Eksplorasi GIS
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
                <Info size={16} /> Tentang & Riset
              </NavLink>
            </div>
          )}
        </nav>
      </header>

      {/* Kontainer Badan Aplikasi */}
      <main className="app-main-body">
        {children}
      </main>

      {/* Floating AI Travel Concierge Assistant */}
      <AIChatWidget />

      {/* Footer Navigasi Publik */}
      <footer className="footer-enhanced">
        <div className="container footer-grid">
          
          {/* Kolom 1: Brand & Filosofi */}
          <div className="footer-brand-col">
            <div className="logo-brand" style={{ marginBottom: '0.6rem' }}>
              <div className="logo-icon-wrap">
                <Compass size={22} color="#0284c7" />
              </div>
              <div className="logo-text-group">
                <div className="logo-title" style={{ color: '#ffffff' }}>
                  TobaRoute <span className="logo-ai-badge">AI</span>
                </div>
              </div>
            </div>
            <p className="footer-desc-text">
              Platform kecerdasan buatan terpadu untuk rute presisi, panduan akses transportasi lengkap, dan keterpaparan adil bagi UMKM di kawasan Kaldera Danau Toba.
            </p>
            <div className="batak-philosophy-quote">
              <em>"Aek godang tu aek laut, Dos ni roha sibahen na saut."</em>
              <span>Kebersamaan dan keselarasan hati membawa keberhasilan.</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Navigasi Utama</h4>
            <ul className="footer-links-list">
              <li><NavLink to="/"><Compass size={13} /> Beranda</NavLink></li>
              <li><NavLink to="/planner"><Sparkles size={13} /> Itinerary AI Studio</NavLink></li>
              <li><NavLink to="/umkm"><Store size={13} /> Sentra UMKM Danau Toba</NavLink></li>
              <li><NavLink to="/explore"><Navigation size={13} /> Peta GIS Interaktif</NavLink></li>
              <li><NavLink to="/about"><Info size={13} /> Tentang Platform</NavLink></li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Wisatawan */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Layanan Wisatawan</h4>
            <div className="footer-contact-info">
              <div className="contact-item">
                <ShieldCheck size={14} color="#10b981" />
                <span>UNESCO Global Geopark Caldera Toba</span>
              </div>
              <div className="contact-item">
                <MapPin size={14} color="#38bdf8" />
                <span>24 Kecamatan Lingkar Danau Toba, Sumatera Utara</span>
              </div>
              <div className="contact-item">
                <Phone size={14} color="#fbbf24" />
                <span>TIC Danau Toba / Hotline: 112</span>
              </div>
            </div>
          </div>

        </div>

        {/* Baris Hak Cipta */}
        <div className="footer-bottom-bar">
          <div className="container footer-bottom-inner">
            <p>&copy; 2026 TobaRoute AI. Dikembangkan untuk Keadilan Pariwisata & Aksesibilitas Danau Toba.</p>
            <div className="footer-bottom-badges">
              <span>✈️ Info Bandara Silangit</span>
              <span>🚢 Jadwal Feri Terpadu</span>
              <span>🌿 100% UMKM Friendly</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ====================================================================================================
// KOMPONEN UTAMA: App
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
