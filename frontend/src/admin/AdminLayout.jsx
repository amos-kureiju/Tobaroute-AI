import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, MapPin, FileText, Activity, Settings, LogOut, Search, Bell, HelpCircle } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('tobaguide_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="admin-portal-layout">
      {/* DARK BLUE LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        <div>
          {/* Header Brand */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <Compass size={28} color="#38bdf8" />
              <div>
                <h1>TobaRoute AI</h1>
                <span>Lake Toba Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
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
          </nav>
        </div>

        {/* Footer Status & Actions */}
        <div className="sidebar-footer">
          <div className="status-indicator-badge">
            <span className="status-dot"></span>
            <span>SYSTEM STATUS: ACTIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
              <Settings size={16} />
              <span>Settings</span>
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="sidebar-link" 
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <LogOut size={16} color="#ef4444" />
              <span style={{ color: '#fca5a5' }}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WRAPPER */}
      <div className="admin-main-wrapper">
        {/* TOP HEADER BAR */}
        <header className="admin-header">
          <div className="admin-search-box">
            <Search className="admin-search-icon" size={16} />
            <input type="text" placeholder="Search system data..." />
          </div>

          <div className="admin-header-actions">
            <button className="header-icon-btn" title="Notifikasi">
              <Bell size={18} />
              <span className="icon-badge-dot"></span>
            </button>

            <button className="header-icon-btn" title="Bantuan">
              <HelpCircle size={18} />
            </button>

            <div className="admin-profile-pill">
              <div className="admin-avatar">AP</div>
              <div className="admin-user-info">
                <span className="admin-name">Admin Portal</span>
                <span className="admin-role">SUPERUSER</span>
              </div>
            </div>
          </div>
        </header>

        {/* BODY PAGE CONTENT */}
        <div className="admin-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
