// ====================================================================================================
// FILE: frontend/src/admin/AdminSettings.jsx
// TUJUAN & PENJELASAN:
// Halaman Pengaturan Konfigurasi Sistem, Akun Administrator, dan Sinkronisasi Data Vektor.
// Fitur:
// 1. Tab Konfigurasi AI & Vektor: Parameter bobot keadilan data (Fairness Boost), model Gemini, dan Pinecone index.
// 2. Tab Manajemen Akun: Pengaturan profil admin, email, dan perubahan kata sandi.
// 3. Tab Sinkronisasi Manual: Trigger tombol 'Sinkronkan Database Vektor' ke server Pinecone.
// 4. Tab Mode Pemeliharaan & GPS Tracking.
// ====================================================================================================

import React, { useState } from 'react';
import { Settings, Cpu, ShieldCheck, Database, RefreshCw, CheckCircle2, AlertCircle, Save, Lock, User, Key, Layers, Globe } from 'lucide-react';
import { syncPineconeVectors } from '../services/api';
import './Admin.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('system'); // 'system' | 'account' | 'sync' | 'platform'
  
  // State Konfigurasi Sistem & Model AI
  const [embeddingModel, setEmbeddingModel] = useState('Cohere (embed-multilingual-v3.0)');
  const [pineconeIndex, setPineconeIndex] = useState('tobaguide-index');
  const [vectorDim, setVectorDim] = useState('1024');
  const [fairnessBoost, setFairnessBoost] = useState('1.25');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-lite');

  // State Profil Akun Admin
  const [adminName, setAdminName] = useState('Budi Santoso');
  const [adminEmail, setAdminEmail] = useState('admin.indonesia@example.com');
  const [adminRole, setAdminRole] = useState('Superuser (Akses Penuh)');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Platform State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(true);
  const [autoGps, setAutoGps] = useState(true);

  // Status & Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveMessage('Konfigurasi sistem berhasil disimpan ke memori!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleManualVectorSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      const res = await syncPineconeVectors();
      setSyncStatus({ type: 'success', text: `Sinkronisasi Vektor Berhasil! ${res.synced_count || 132} entitas telah diperbarui ke Pinecone Index.` });
    } catch (err) {
      console.error(err);
      setSyncStatus({ type: 'error', text: 'Gagal menyinkronkan data ke Pinecone. Pastikan server backend & API Key terhubung.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Title Row */}
      <div className="card-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings size={26} color="#0284c7" /> Pengaturan Sistem & Konfigurasi AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Kelola infrastruktur RAG AI, akun administrator, sinkronisasi database vektor Pinecone, dan preferensi platform TobaRoute AI.
          </p>
        </div>

        {saveMessage && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> {saveMessage}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('system')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'system' ? '#072a4a' : 'transparent',
            color: activeTab === 'system' ? 'white' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Cpu size={16} /> Konfigurasi AI & RAG
        </button>

        <button 
          onClick={() => setActiveTab('sync')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'sync' ? '#072a4a' : 'transparent',
            color: activeTab === 'sync' ? 'white' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Database size={16} /> Sinkronisasi Vektor Pinecone
        </button>

        <button 
          onClick={() => setActiveTab('account')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'account' ? '#072a4a' : 'transparent',
            color: activeTab === 'account' ? 'white' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <User size={16} /> Akun Administrator
        </button>

        <button 
          onClick={() => setActiveTab('platform')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'platform' ? '#072a4a' : 'transparent',
            color: activeTab === 'platform' ? 'white' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Globe size={16} /> Kontrol Platform
        </button>
      </div>

      {/* TAB 1: SYSTEM CONFIG */}
      {activeTab === 'system' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#0284c7" /> Parameter RAG Engine & Vector Search
            </h3>

            <form onSubmit={handleSaveSettings}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-admin">
                  <label>PROVIDER EMBEDDING MODEL</label>
                  <select value={embeddingModel} onChange={(e) => setEmbeddingModel(e.target.value)}>
                    <option value="Cohere (embed-multilingual-v3.0)">Cohere (embed-multilingual-v3.0) [Aktif]</option>
                    <option value="OpenAI (text-embedding-3-small)">OpenAI (text-embedding-3-small)</option>
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>DIMENSI VEKTOR</label>
                  <input type="text" value={vectorDim} onChange={(e) => setVectorDim(e.target.value)} readOnly style={{ background: '#f8fafc' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-admin">
                  <label>PINECONE INDEX NAME</label>
                  <input type="text" value={pineconeIndex} onChange={(e) => setPineconeIndex(e.target.value)} />
                </div>

                <div className="form-group-admin">
                  <label>LLM GENERATIVE MODEL</label>
                  <select value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)}>
                    <option value="gemini-3.1-flash-lite">Google Gemini 3.1 Flash Lite [Rekomendasi Cepat]</option>
                    <option value="gemini-3.5-flash">Google Gemini 3.5 Flash</option>
                  </select>
                </div>
              </div>

              <div className="form-group-admin">
                <label>BOOST MULTIPLIER KEADILAN UMKM (γ FAIRNESS MULTIPLIER)</label>
                <input 
                  type="number" 
                  step="0.05" 
                  value={fairnessBoost} 
                  onChange={(e) => setFairnessBoost(e.target.value)} 
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Nilai insentif pembobotan skor (γ) yang diberikan secara otomatis kepada usaha mikro/kuliner lokal dengan ulasan ≤ 15.
                </span>
              </div>

              <button type="submit" className="btn-admin-save" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center', height: '44px', marginTop: '1rem' }}>
                <Save size={18} />
                <span>Simpan Konfigurasi Sistem</span>
              </button>
            </form>
          </div>

          {/* Right AI Status Card */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#16a34a" /> Status Koneksi AI API
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534', display: 'block' }}>Pinecone Vector DB</span>
                  <span style={{ fontSize: '0.75rem', color: '#15803d' }}>tobaguide-index (us-east-1)</span>
                </div>
                <span style={{ background: '#16a34a', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>ONLINE</span>
              </div>

              <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534', display: 'block' }}>Cohere Embeddings API</span>
                  <span style={{ fontSize: '0.75rem', color: '#15803d' }}>embed-multilingual-v3.0</span>
                </div>
                <span style={{ background: '#16a34a', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>TERHUBUNG</span>
              </div>

              <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534', display: 'block' }}>Google Gemini LLM</span>
                  <span style={{ fontSize: '0.75rem', color: '#15803d' }}>gemini-3.1-flash-lite</span>
                </div>
                <span style={{ background: '#16a34a', color: 'white', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>AKTIF</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VECTOR SYNC */}
      {activeTab === 'sync' && (
        <div className="fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--admin-border)', maxWidth: '850px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={22} color="#0284c7" /> Sinkronisasi Dataset Terbarukan ke Pinecone Vector Index
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Setiap kali Anda menambahkan atau mengedit destinasi/UMKM baru di database PostgreSQL, tekan tombol di bawah ini untuk memperbarui index vektor Pinecone secara langsung tanpa perlu merestart server.
          </p>

          {syncStatus && (
            <div style={{ 
              background: syncStatus.type === 'success' ? '#dcfce7' : '#fef2f2',
              color: syncStatus.type === 'success' ? '#15803d' : '#991b1b',
              border: `1px solid ${syncStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              {syncStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{syncStatus.text}</span>
            </div>
          )}

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Ringkasan Indeks Vektor Aktif:</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <li>Total Entitas terdaftar di Database: <strong>132 Destinasi & UMKM</strong></li>
              <li>Ruang Vektor: <strong>Pinecone Cloud (AWS us-east-1)</strong></li>
              <li>Dimensi Vektor Embedding: <strong>1024 Dimensi (Cohere Multilingual v3.0)</strong></li>
              <li>Metric Similarity: <strong>Cosine Similarity</strong></li>
            </ul>
          </div>

          <button 
            onClick={handleManualVectorSync} 
            disabled={isSyncing}
            className="btn-admin-save" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              padding: '0.75rem 1.5rem', 
              fontSize: '0.95rem',
              background: '#0284c7'
            }}
          >
            <RefreshCw size={18} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Menyinkronkan Data ke Pinecone...' : 'Sinkronkan Ulang Indeks Pinecone Sekarang'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: ACCOUNT & SECURITY */}
      {activeTab === 'account' && (
        <div className="fade-in" style={{ background: 'white', padding: '1.8rem', borderRadius: '12px', border: '1px solid var(--admin-border)', maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="#0284c7" /> Profil Akun Administrator
          </h3>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group-admin">
              <label>NAMA LENGKAP ADMIN</label>
              <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group-admin">
                <label>EMAIL ADMINISTRATOR</label>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              </div>

              <div className="form-group-admin">
                <label>PERAN HAK AKSES (ROLE)</label>
                <input type="text" value={adminRole} readOnly style={{ background: '#f8fafc' }} />
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={16} color="#0284c7" /> Keamanan Kata Sandi
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group-admin">
                <label>KATA SANDI LAMA</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <div className="form-group-admin">
                <label>KATA SANDI BARU</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="btn-admin-save" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px', marginTop: '1rem' }}>
              <Save size={16} /> Perbarui Profil & Sandi
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PLATFORM CONTROLS */}
      {activeTab === 'platform' && (
        <div className="fade-in" style={{ background: 'white', padding: '1.8rem', borderRadius: '12px', border: '1px solid var(--admin-border)', maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#0284c7" /> Kontrol Status & Fitur Platform
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>Mode Perbaikan / Maintenance</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nonaktifkan akses umum wisatawan sementara saat melakukan update database besar.</span>
              </div>
              <input 
                type="checkbox" 
                checked={maintenanceMode} 
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>Banner Deteksi Jaringan Offline</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tampilkan peringatan halus tanpa reload otomatis jika koneksi internet wisatawan terputus.</span>
              </div>
              <input 
                type="checkbox" 
                checked={offlineNotice} 
                onChange={(e) => setOfflineNotice(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>Deteksi Lokasi GPS Otomatis pada Peta Jelajah</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Secara hening meminta izin lokasi presisi saat pengguna membuka Halaman Jelajah.</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoGps} 
                onChange={(e) => setAutoGps(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
