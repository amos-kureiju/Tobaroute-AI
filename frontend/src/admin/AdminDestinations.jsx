import React, { useState, useEffect } from 'react';
import { getDestinations, deleteDestinasi, addDestinasi, updateDestinasi, syncPineconeVectors } from '../services/api';
import { Search, Plus, Edit, Trash2, MapPin, Star, Filter, CheckCircle2, AlertCircle, X, RefreshCw, Eye, Image as ImageIcon, Save, Map } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import './Admin.css';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState('form'); // 'form' | 'preview'
  const [newForm, setNewForm] = useState({
    nama: '',
    kecamatan: 'Balige',
    kategori: 'wisata',
    nama_jalan: 'Jl. Raya Lintas Sumatra, Balige',
    deskripsi_singkat: '',
    deskripsi_lengkap: '',
    gambar_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    jumlah_ulasan: 25,
    latitude: 2.3333,
    longitude: 99.0667
  });

  // Edit Modal State
  const [editingDestinasi, setEditingDestinasi] = useState(null); // null or object
  const [editTab, setEditTab] = useState('form'); // 'form' | 'preview'
  const [editForm, setEditForm] = useState({});

  // Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState(null);

  const fetchDest = async () => {
    try {
      setLoading(true);
      const data = await getDestinations('', 1000);
      setDestinations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDest();
  }, []);

  const handleOpenEdit = (item) => {
    setEditingDestinasi(item);
    setEditForm({
      nama: item.nama || '',
      kecamatan: item.kecamatan || 'Balige',
      kategori: item.kategori || 'wisata',
      nama_jalan: item.nama_jalan || '',
      deskripsi_singkat: item.deskripsi_singkat || '',
      deskripsi_lengkap: item.deskripsi_lengkap || '',
      gambar_url: item.gambar_url || '',
      rating: item.rating || 4.8,
      jumlah_ulasan: item.jumlah_ulasan || 10,
      latitude: item.latitude || 2.3333,
      longitude: item.longitude || 99.0667
    });
    setEditTab('form');
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus entitas "${nama}" dari PostgreSQL & Pinecone?`)) return;

    try {
      await deleteDestinasi(id);
      setDestinations(destinations.filter(d => d.id !== id));
      setNoticeMessage({ type: 'success', text: `Destinasi "${nama}" berhasil dihapus dari database & indeks vektor.` });
      setTimeout(() => setNoticeMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setNoticeMessage({ type: 'error', text: 'Gagal menghapus destinasi dari database.' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newForm.nama) return;

    try {
      setIsSubmitting(true);
      await addDestinasi(newForm);
      await fetchDest();
      setIsAddModalOpen(false);
      setNewForm({
        nama: '',
        kecamatan: 'Balige',
        kategori: 'wisata',
        nama_jalan: 'Jl. Raya Lintas Sumatra, Balige',
        deskripsi_singkat: '',
        deskripsi_lengkap: '',
        gambar_url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        jumlah_ulasan: 25,
        latitude: 2.3333,
        longitude: 99.0667
      });
      setNoticeMessage({ type: 'success', text: `Destinasi "${newForm.nama}" berhasil ditambahkan & vektor Pinecone diperbarui secara real-time!` });
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch (e) {
      console.error(e);
      setNoticeMessage({ type: 'error', text: 'Gagal menambah destinasi baru.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDestinasi || !editForm.nama) return;

    try {
      setIsSubmitting(true);
      await updateDestinasi(editingDestinasi.id, editForm);
      await fetchDest();
      setEditingDestinasi(null);
      setNoticeMessage({ type: 'success', text: `Data "${editForm.nama}" berhasil diperbarui & disinkronkan ke Pinecone!` });
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch (e) {
      console.error(e);
      setNoticeMessage({ type: 'error', text: 'Gagal memperbarui data destinasi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncPineconeVectors();
      setNoticeMessage({ type: 'success', text: `Berhasil menyinkronkan ulang ${res.synced_count || 132} entitas ke database vektor Pinecone!` });
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setNoticeMessage({ type: 'error', text: 'Gagal melakukan sinkronisasi vektor.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const filtered = destinations.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.kecamatan && item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.nama_jalan && item.nama_jalan.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesKecamatan = selectedKecamatan === '' || item.kecamatan === selectedKecamatan;
    const matchesKategori = selectedKategori === '' || (item.kategori || '').toLowerCase() === selectedKategori.toLowerCase();
    return matchesSearch && matchesKecamatan && matchesKategori;
  });

  return (
    <div className="fade-in">
      {/* Title & Actions */}
      <div className="card-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0 }}>Kelola Data Destinasi & UMKM</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Manajemen lengkap entitas pariwisata, fasilitas kuliner, dan UMKM lokal di kawasan Lingkar Toba ({destinations.length} Data Real).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-admin-cancel" 
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Menyinkronkan Vektor...' : 'Sinkron Vektor Pinecone'}</span>
          </button>

          <button className="btn-admin-save" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Tambah Destinasi Baru
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div style={{
          background: noticeMessage.type === 'success' ? '#dcfce7' : '#fef2f2',
          color: noticeMessage.type === 'success' ? '#15803d' : '#991b1b',
          border: `1px solid ${noticeMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {noticeMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{noticeMessage.text}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Cari nama destinasi, kecamatan, atau nama jalan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <select 
          value={selectedKecamatan} 
          onChange={(e) => setSelectedKecamatan(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
        >
          <option value="">Semua Kecamatan</option>
          <option value="Balige">Balige (Toba)</option>
          <option value="Porsea">Porsea (Toba)</option>
          <option value="Laguboti">Laguboti (Toba)</option>
          <option value="Muara">Muara (Taput)</option>
          <option value="Silaen">Silaen (Toba)</option>
          <option value="Simanindo">Simanindo (Samosir)</option>
          <option value="Pangururan">Pangururan (Samosir)</option>
          <option value="Sianjur Mulamula">Sianjur Mulamula (Samosir)</option>
          <option value="Onan Runggu">Onan Runggu (Samosir)</option>
          <option value="Ronggur Nihuta">Ronggur Nihuta (Samosir)</option>
          <option value="Harian">Harian (Samosir)</option>
        </select>

        <select 
          value={selectedKategori} 
          onChange={(e) => setSelectedKategori(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
        >
          <option value="">Semua Kategori</option>
          <option value="wisata">Wisata Utama</option>
          <option value="umkm">UMKM Lokal</option>
          <option value="kuliner">Kuliner Batak</option>
          <option value="transportasi">Transportasi (Feri/Angkot)</option>
        </select>
      </div>

      {/* Table Data */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Memuat data destinasi dari database PostgreSQL...</div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>DESTINASI & DESKRIPSI</th>
                <th>KECAMATAN & ALAMAT</th>
                <th>KATEGORI</th>
                <th>RATING & ULASAN</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td style={{ maxWidth: '280px' }}>
                    <span className="dest-name-cell">{item.nama}</span>
                    <span className="dest-sub-cell">{item.deskripsi_singkat ? item.deskripsi_singkat.slice(0, 70) + '...' : ''}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, display: 'block', color: '#0f172a' }}>{item.kecamatan}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.nama_jalan ? item.nama_jalan.slice(0, 35) : 'Kawasan Danau Toba'}</span>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '6px', 
                      background: (item.kategori || '').toLowerCase() === 'umkm' ? '#dcfce7' : (item.kategori || '').toLowerCase() === 'kuliner' ? '#fef3c7' : '#e0f2fe', 
                      color: (item.kategori || '').toLowerCase() === 'umkm' ? '#15803d' : (item.kategori || '').toLowerCase() === 'kuliner' ? '#b45309' : '#0369a1', 
                      fontWeight: 700 
                    }}>
                      {(item.kategori || 'wisata').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" /> {item.rating} ({item.jumlah_ulasan || 0})
                    </span>
                  </td>
                  <td>
                    <span className="badge-status terverifikasi">Aktif (Vektor)</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="action-btn-icon" title="Edit Lokasi & Detail" onClick={() => handleOpenEdit(item)}>
                        <Edit size={16} color="#0284c7" />
                      </button>
                      <button className="action-btn-icon" title="Hapus" onClick={() => handleDelete(item.id, item.nama)} style={{ color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL EDIT DESTINATION MODAL */}
      {/* ========================================================================= */}
      {editingDestinasi && (
        <div className="modal-overlay-admin fade-in">
          <div className="modal-content-admin" style={{ maxWidth: '780px', width: '90%' }}>
            <div className="modal-header-admin" style={{ background: '#072a4a', color: 'white' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Edit size={20} color="#38bdf8" /> Edit Destinasi & Lokasi: {editingDestinasi.nama}
              </h3>
              <button onClick={() => setEditingDestinasi(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '0.5rem 1.5rem 0 1.5rem', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setEditTab('form')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderBottom: editTab === 'form' ? '3px solid #0284c7' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: 600,
                  color: editTab === 'form' ? '#0284c7' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                Form Edit Data
              </button>
              <button
                type="button"
                onClick={() => setEditTab('preview')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderBottom: editTab === 'preview' ? '3px solid #0284c7' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: 600,
                  color: editTab === 'preview' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Eye size={16} /> Pratinjau Kartu (Live Preview)
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              {editTab === 'form' ? (
                <div className="modal-body-admin" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <div className="form-group-admin">
                    <label>NAMA DESTINASI / UMKM</label>
                    <input 
                      type="text" 
                      value={editForm.nama || ''}
                      onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group-admin">
                      <label>KECAMATAN</label>
                      <select value={editForm.kecamatan || 'Balige'} onChange={(e) => setEditForm({ ...editForm, kecamatan: e.target.value })}>
                        <option value="Balige">Balige</option>
                        <option value="Porsea">Porsea</option>
                        <option value="Laguboti">Laguboti</option>
                        <option value="Muara">Muara</option>
                        <option value="Silaen">Silaen</option>
                        <option value="Simanindo">Simanindo (Samosir)</option>
                        <option value="Pangururan">Pangururan</option>
                      </select>
                    </div>

                    <div className="form-group-admin">
                      <label>KATEGORI ENTITAS</label>
                      <select value={editForm.kategori || 'wisata'} onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}>
                        <option value="wisata">Wisata Utama</option>
                        <option value="umkm">UMKM Lokal</option>
                        <option value="kuliner">Kuliner Batak</option>
                        <option value="transportasi">Transportasi (Feri/Angkot)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>ALAMAT PRESISI / NAMA JALAN</label>
                    <input 
                      type="text" 
                      placeholder="Jl. D.I. Panjaitan No. 12, Balige"
                      value={editForm.nama_jalan || ''}
                      onChange={(e) => setEditForm({ ...editForm, nama_jalan: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group-admin">
                      <label>LATITUDE KOORDINAT</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={editForm.latitude || 2.3333}
                        onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="form-group-admin">
                      <label>LONGITUDE KOORDINAT</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={editForm.longitude || 99.0667}
                        onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group-admin">
                      <label>RATING (0.0 - 5.0)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={editForm.rating || 4.8}
                        onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="form-group-admin">
                      <label>JUMLAH ULASAN</label>
                      <input 
                        type="number" 
                        value={editForm.jumlah_ulasan || 10}
                        onChange={(e) => setEditForm({ ...editForm, jumlah_ulasan: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>URL GAMBAR DESTINASI / FOTO HD</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..."
                      value={editForm.gambar_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, gambar_url: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>DESKRIPSI SINGKAT</label>
                    <input 
                      type="text" 
                      value={editForm.deskripsi_singkat || ''}
                      onChange={(e) => setEditForm({ ...editForm, deskripsi_singkat: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>DESKRIPSI LENGKAP</label>
                    <textarea 
                      rows="3" 
                      value={editForm.deskripsi_lengkap || ''}
                      onChange={(e) => setEditForm({ ...editForm, deskripsi_lengkap: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="modal-body-admin" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: '380px' }}>
                    <DestinationCard dest={{ ...editingDestinasi, ...editForm }} isUmkm={editForm.kategori === 'umkm'} />
                  </div>
                </div>
              )}

              <div className="modal-footer-admin">
                <button type="button" className="btn-admin-cancel" onClick={() => setEditingDestinasi(null)}>Batal</button>
                <button type="submit" className="btn-admin-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Memperbarui & Sinkron...' : 'Simpan & Sync Pinecone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PROFESSIONAL ADD NEW DESTINATION MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="modal-overlay-admin fade-in">
          <div className="modal-content-admin" style={{ maxWidth: '780px', width: '90%' }}>
            <div className="modal-header-admin" style={{ background: '#072a4a', color: 'white' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Plus size={20} color="#34d399" /> Tambah Destinasi Baru / UMKM Lokal
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '0.5rem 1.5rem 0 1.5rem', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setAddTab('form')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderBottom: addTab === 'form' ? '3px solid #0284c7' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: 600,
                  color: addTab === 'form' ? '#0284c7' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                Form Input Destinasi Baru
              </button>
              <button
                type="button"
                onClick={() => setAddTab('preview')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderBottom: addTab === 'preview' ? '3px solid #0284c7' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: 600,
                  color: addTab === 'preview' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Eye size={16} /> Pratinjau Kartu (Live Preview)
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              {addTab === 'form' ? (
                <div className="modal-body-admin" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <div className="form-group-admin">
                    <label>NAMA DESTINASI / UMKM</label>
                    <input 
                      type="text" 
                      placeholder="misal: Kedai Kopi Arabika Lintong Specialty"
                      value={newForm.nama}
                      onChange={(e) => setNewForm({ ...newForm, nama: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group-admin">
                      <label>KECAMATAN</label>
                      <select value={newForm.kecamatan} onChange={(e) => setNewForm({ ...newForm, kecamatan: e.target.value })}>
                        <option value="Balige">Balige</option>
                        <option value="Porsea">Porsea</option>
                        <option value="Laguboti">Laguboti</option>
                        <option value="Muara">Muara</option>
                        <option value="Silaen">Silaen</option>
                        <option value="Simanindo">Simanindo (Samosir)</option>
                        <option value="Pangururan">Pangururan</option>
                      </select>
                    </div>

                    <div className="form-group-admin">
                      <label>KATEGORI ENTITAS</label>
                      <select value={newForm.kategori} onChange={(e) => setNewForm({ ...newForm, kategori: e.target.value })}>
                        <option value="wisata">Wisata Utama</option>
                        <option value="umkm">UMKM Lokal</option>
                        <option value="kuliner">Kuliner Batak</option>
                        <option value="transportasi">Transportasi (Feri/Angkot)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>ALAMAT PRESISI / NAMA JALAN</label>
                    <input 
                      type="text" 
                      placeholder="Jl. Sisingamangaraja No. 45, Laguboti"
                      value={newForm.nama_jalan}
                      onChange={(e) => setNewForm({ ...newForm, nama_jalan: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group-admin">
                      <label>RATING AWAL</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={newForm.rating}
                        onChange={(e) => setNewForm({ ...newForm, rating: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="form-group-admin">
                      <label>JUMLAH ULASAN</label>
                      <input 
                        type="number" 
                        value={newForm.jumlah_ulasan}
                        onChange={(e) => setNewForm({ ...newForm, jumlah_ulasan: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>URL GAMBAR DESTINASI (UNSPLASH / HD URL)</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..."
                      value={newForm.gambar_url}
                      onChange={(e) => setNewForm({ ...newForm, gambar_url: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>DESKRIPSI SINGKAT</label>
                    <input 
                      type="text" 
                      placeholder="Deskripsi singkat yang tampil pada kartu..."
                      value={newForm.deskripsi_singkat}
                      onChange={(e) => setNewForm({ ...newForm, deskripsi_singkat: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>DESKRIPSI LENGKAP (Tampil saat tombol Detail ditekan)</label>
                    <textarea 
                      rows="3" 
                      placeholder="Informasi lengkap fasilitas, sejarah, dan keunikan tempat..."
                      value={newForm.deskripsi_lengkap}
                      onChange={(e) => setNewForm({ ...newForm, deskripsi_lengkap: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="modal-body-admin" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: '380px' }}>
                    <DestinationCard dest={{ id: 9999, ...newForm }} isUmkm={newForm.kategori === 'umkm'} />
                  </div>
                </div>
              )}

              <div className="modal-footer-admin">
                <button type="button" className="btn-admin-cancel" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-admin-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan & Sync Pinecone...' : 'Simpan Data & Sync Vektor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;
