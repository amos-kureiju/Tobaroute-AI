// ====================================================================================================
// FILE: frontend/src/admin/AdminLayout.jsx
// TUJUAN:
// Kerangka antarmuka khusus Administrator (Admin Portal Layout).
// Mengatur:
// 1. Sidebar Navigasi Kiri (Dashboard, Manajemen Destinasi, Konten Beranda, Monitoring AI, Pengaturan).
// 2. Top Header Bar (Status koneksi server, indikator profil admin, tombol Logout).
// 3. Outlet: Tempat merender sub-halaman admin yang sedang aktif.
// ====================================================================================================

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, MapPin, FileText, Activity, Settings, LogOut, Bell } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  // FUNGSI: Logout dan menghapus token otentikasi dari localStorage
  const handleLogout = () => {
    localStorage.removeItem('tobaguide_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="admin-portal-layout">
      {/* SIDEBAR ADMINISTRATOR */}
      <aside className="admin-sidebar">
        <div>
          {/* Logo & Header Portal */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Compass size={28} color="#38bdf8" />
              <div>
                <h1>TobaRoute AI</h1>
                <span>Lake Toba Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Menu Navigasi Sidebar */}
          <nav className="sidebar-nav">
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink 
              to="/admin/destinations" 
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <MapPin size={18} />
              <span>Destination Management</span>
            </NavLink>

            <NavLink 
              to="/admin/content" 
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <FileText size={18} />
              <span>Home Content</span>
            </NavLink>

            <NavLink 
              to="/admin/ai-monitoring" 
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <Activity size={18} />
              <span>AI Monitoring</span>
            </NavLink>

            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer Sidebar & Tombol Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN KANAN */}
      <div className="admin-main-wrapper">
        {/* Topbar Administrator */}
        <header className="admin-topbar">
          <div className="topbar-search">
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
              Sistem Manajemen Pariwisata Berkelanjutan Danau Toba
            </span>
          </div>

          <div className="topbar-actions">
            <button className="topbar-btn" title="Notifikasi Sistem">
              <Bell size={18} />
              <span className="badge-dot"></span>
            </button>

            <div className="admin-profile-pill">
              <div className="profile-avatar">A</div>
              <div className="profile-info">
                <span className="profile-name">Administrator</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Render Konten Halaman Admin yang Dipilih */}
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
