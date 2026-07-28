import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import './Admin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'success' | 'forgot-sent'

  // Form states
  const [nama, setNama] = useState('Budi Santoso');
  const [email, setEmail] = useState('admin.indonesia@example.com');
  const [username, setUsername] = useState('budi_admin');
  const [role, setRole] = useState('Sistem Analis');
  const [password, setPassword] = useState('••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••');
  const [agree, setAgree] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Kombinasi email atau kata sandi salah. Silakan coba lagi.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMode('success');
    }, 800);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!nama || !email || !username) {
      setErrorMsg('Beberapa informasi yang Anda masukkan tidak valid. Silakan periksa kembali formulir Anda.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMode('success');
    }, 800);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Silakan masukkan alamat email terdaftar Anda.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setMode('forgot-sent');
    }, 800);
  };

  const proceedToDashboard = () => {
    localStorage.setItem('tobaguide_admin_token', 'active_superuser_session');
    navigate('/admin/dashboard');
  };

  return (
    <div className="admin-auth-container fade-in">
      {/* LEFT COLUMN: FORM */}
      <div className="auth-split-left">
        <div className="auth-brand">
          <Compass size={32} color="#0284c7" />
          <div>
            <h2>TobaRoute AI</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Lake Toba AdminGateway</span>
          </div>
        </div>

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <div className="auth-form-card fade-in">
            <h1 className="auth-title">Masuk ke Dashboard</h1>
            <p className="auth-subtitle">Masukkan kredensial akun administrator Anda untuk mengelola portal TobaRoute AI.</p>

            {errorMsg && (
              <div className="auth-alert-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group-admin">
                <label>USERNAME ATAU EMAIL</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.indonesia@example.com"
                  required
                />
              </div>

              <div className="form-group-admin">
                <label>PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? 'Memproses...' : <><span>Masuk ke Dashboard</span> <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-footer-links">
              <span>Belum punya akun? </span>
              <span className="auth-link" onClick={() => { setErrorMsg(''); setMode('register'); }}>
                Daftar Akun Baru
              </span>
              <div style={{ marginTop: '0.75rem' }}>
                <span className="auth-link" style={{ fontSize: '0.82rem', color: '#64748b' }} onClick={() => { setErrorMsg(''); setMode('forgot'); }}>
                  Lupa Kata Sandi?
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTER MODE */}
        {mode === 'register' && (
          <div className="auth-form-card fade-in">
            <h1 className="auth-title">Registrasi Akun Baru</h1>
            <p className="auth-subtitle">Lengkapi kredensial Anda untuk mengakses dashboard manajemen sistem.</p>

            {errorMsg && (
              <div className="auth-alert-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group-admin">
                <label>NAMA LENGKAP</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Budi Santoso"
                  required
                />
              </div>

              <div className="form-group-admin">
                <label>ALAMAT EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi.santoso@tobaroute.ai"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-admin">
                  <label>USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="budi_admin"
                    required
                  />
                </div>

                <div className="form-group-admin">
                  <label>ROLE</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Sistem Analis">Sistem Analis</option>
                    <option value="Admin Portal">Admin Portal</option>
                    <option value="Superuser">Superuser</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-admin">
                  <label>PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="form-group-admin">
                  <label>KONFIRMASI PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#475569' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  style={{ width: 'auto', height: 'auto' }}
                />
                <label htmlFor="terms" style={{ textTransform: 'none', margin: 0, fontWeight: 400 }}>
                  Saya setuju dengan <a href="#" style={{ color: '#0284c7' }}>Syarat & Ketentuan</a> serta <a href="#" style={{ color: '#0284c7' }}>Kebijakan Privasi</a> TobaRoute AI.
                </label>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? 'Membuat Akun...' : <><span>Buat Akun Admin</span> <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-footer-links">
              <span>Sudah punya akun? </span>
              <span className="auth-link" onClick={() => { setErrorMsg(''); setMode('login'); }}>
                Masuk ke Dashboard
              </span>
            </div>
          </div>
        )}

        {/* 3. SUCCESS MODE */}
        {mode === 'success' && (
          <div className="auth-form-card fade-in" style={{ textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={42} />
            </div>

            <h1 className="auth-title">Akun Berhasil Dibuat! / Login Berhasil!</h1>
            <p className="auth-subtitle">
              Selamat! Akun Anda telah berhasil dikonfirmasi. Anda sekarang dapat masuk ke dashboard untuk mengelola ekosistem pariwisata Danau Toba.
            </p>

            <button className="btn-auth-submit" onClick={proceedToDashboard} style={{ background: '#0284c7' }}>
              <span>Masuk ke Dashboard</span> <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* 4. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <div className="auth-form-card fade-in">
            <h1 className="auth-title">Lupa Kata Sandi</h1>
            <p className="auth-subtitle">Masukkan email Anda untuk menerima instruksi pemulihan kata sandi.</p>

            {errorMsg && (
              <div className="auth-alert-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group-admin">
                <label>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.indonesia@example.com"
                  required
                />
              </div>

              <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                {isLoading ? 'Mengirim...' : <><span>Kirim Instruksi Pemulihan</span> <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-footer-links">
              <span className="auth-link" onClick={() => { setErrorMsg(''); setMode('login'); }}>
                ← Kembali ke Login
              </span>
            </div>
          </div>
        )}

        {/* 5. FORGOT SENT MODE */}
        {mode === 'forgot-sent' && (
          <div className="auth-form-card fade-in" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#e0f2fe', color: '#0369a1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Mail size={32} />
            </div>

            <h1 className="auth-title">Instruksi Terkirim!</h1>
            <p className="auth-subtitle">
              Kami telah mengirimkan instruksi pemulihan kata sandi ke email Anda. Silakan periksa folder masuk atau folder spam Anda.
            </p>

            <button className="btn-auth-submit" onClick={() => setMode('login')} style={{ background: '#072a4a' }}>
              <span>Kembali ke Login</span>
            </button>
          </div>
        )}

        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2rem' }}>
          POWERED BY LAKE TOBA AI ECOSYSTEM • VER 2.0-STABLE
        </div>
      </div>

      {/* RIGHT COLUMN: SCENIC HERO */}
      <div className="auth-split-right">
        <div className="auth-right-overlay"></div>

        <div className="auth-right-content">
          <div className="system-status-pill">
            <span style={{ width: 8, height: 8, background: '#34d399', borderRadius: '50%' }}></span>
            SYSTEM STATUS: ONLINE
          </div>

          <div className="auth-hero-card">
            <h4>Pusat Data Navigasi</h4>

            <div className="hero-stat-row">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>DATA TERPROSES</span>
                <span className="hero-stat-value">128.4</span>
                <span className="hero-stat-unit">GB</span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>TITIK LOKASI</span>
                <span className="hero-stat-value">42</span>
                <span className="hero-stat-unit">Nodes</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>EFFICIENCY RATE</span>
              <span className="hero-badge-tag">OPTIMAL</span>
            </div>
          </div>

          <div className="auth-hero-footer-text">
            PUSAT KENDALI PARIWISATA DIGITAL<br />SUMATERA UTARA
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
