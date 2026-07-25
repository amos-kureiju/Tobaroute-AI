import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Home from './pages/Home';
import Explore from './pages/Explore';
import About from './pages/About';
import Chatbot from './components/Chatbot';

// Admin Imports dari Folder Khusus (src/admin)
import { 
  AdminLogin, 
  AdminLayout, 
  AdminDashboard, 
  AdminDestinations, 
  AdminContent, 
  AdminAIMonitoring 
} from './admin';

import './App.css';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
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

      {/* Global Chatbot */}
      <Chatbot />
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

