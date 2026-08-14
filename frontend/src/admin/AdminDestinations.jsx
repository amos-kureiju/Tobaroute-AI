// ====================================================================================================
// FILE: frontend/src/admin/AdminDestinations.jsx
// TUJUAN:
// Halaman Manajemen Data Destinasi & UMKM Administrator.
// Fitur Utama:
// 1. Operasi CRUD Lengkap: Tambah, Edit, dan Hapus entitas destinasi wisata & UMKM.
// 2. Pencarian & Filter Cepat (Berdasarkan Nama, Kecamatan, dan Kategori).
// 3. Sinkronisasi Pinecone: Tombol manual untuk menyelaraskan vektor 1024-dimensi ke Pinecone.
// 4. Live Card Preview & Pagination data.
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { getDestinations, deleteDestinasi, addDestinasi, updateDestinasi, syncPineconeVectors } from '../services/api';
import { Search, Plus, Edit, Trash2, MapPin, Star, Filter, CheckCircle2, AlertCircle, X, RefreshCw, Eye, Image as ImageIcon, Save, Map, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import './Admin.css';

const KECAMATAN_LIST = [
  'Balige', 'Tampahan', 'Laguboti', 'Sigumpar', 'Porsea', 'Silaen', 
  'Lumban Julu', 'Ajibata', 'Parapat', 'Girsang Sipangan Bolon',
  'Pangururan', 'Simanindo', 'Harian', 'Sianjur Mulamula', 'Onan Runggu',
  'Palipi', 'Ronggur Nihuta', 'Muara', 'Baktiraja', 'Pollung',
  'Doloksanggul', 'Berastagi', 'Sidikalang', 'Tarutung'
];

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState('form'); // 'form' | 'preview'
  const [newForm, setNewForm] = useState({
    nama: '',
    kecamatan: 'Balige',
    kategori: 'wisata',
    nama_jalan: 'Jl. Sisingamangaraja, Balige',
    deskripsi_singkat: '',
    deskripsi_lengkap: '',
    gambar_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    jumlah_ulasan: 25,
    latitude: 2.3328,
    longitude: 99.0638
  });

  // Edit Modal State
  const [editingDestinasi, setEditingDestinasi] = useState(null);
  const [editTab, setEditTab] = useState('form');
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
      latitude: item.latitude || 2.3328,
      longitude: item.longitude || 99.0638
    });
    setEditTab('form');
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus entitas "${nama}" dari database PostgreSQL & Pinecone?`)) return;

    try {
      await deleteDestinasi(id);
      setDestinations(destinations.filter(d => d.id !== id));
      setNoticeMessage({ type: 'success', text: `Destinasi "${nama}" berhasil dihapus dari database.` });
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
        nama_jalan: 'Jl. Sisingamangaraja, Balige',
        deskripsi_singkat: '',
        deskripsi_lengkap: '',
        gambar_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        jumlah_ulasan: 25,
        latitude: 2.3328,
        longitude: 99.0638
      });
      setNoticeMessage({ type: 'success', text: `Destinasi "${newForm.nama}" berhasil ditambahkan ke database & Pinecone!` });
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
      setNoticeMessage({ type: 'success', text: `Berhasil menyinkronkan ulang seluruh entitas (${res.synced_count || destinations.length}) ke Pinecone Vector Index!` });
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setNoticeMessage({ type: 'error', text: 'Gagal melakukan sinkronisasi vektor.' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter Data
  const filtered = destinations.filter(item => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = item.nama.toLowerCase().includes(s) || 
                          (item.kecamatan && item.kecamatan.toLowerCase().includes(s)) ||
                          (item.nama_jalan && item.nama_jalan.toLowerCase().includes(s));
    const matchesKecamatan = selectedKecamatan === '' || item.kecamatan === selectedKecamatan;
    const matchesKategori = selectedKategori === '' || (item.kategori || '').toLowerCase() === selectedKategori.toLowerCase();
    return matchesSearch && matchesKecamatan && matchesKategori;
  });

  // Pagination Slice
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="fade-in">
      {/* Title & Actions */}
      <div className="card-title-row" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0, fontWeight: 800 }}>
            Kelola Data Destinasi & UMKM
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Manajemen lengkap entitas pariwisata, kuliner, dan UMKM lokal di kawasan Lingkar Toba ({destinations.length} Data Real).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-admin-cancel" 
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Menyinkronkan Vektor...' : 'Sinkron Vektor Pinecone'}</span>
          </button>

          <button 
            className="btn-admin-save" 
            onClick={() => setIsAddModalOpen(true)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0284c7', color: 'white', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
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
      <div className="glass-panel" style={{ padding: '1rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Cari nama destinasi, kecamatan, atau nama jalan..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <select 
          value={selectedKecamatan} 
          onChange={(e) => { setSelectedKecamatan(e.target.value); setCurrentPage(1); }}
          style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: 'white', color: '#334155' }}
        >
          <option value="">Semua Kecamatan ({destinations.length})</option>
          {KECAMATAN_LIST.map(kec => (
            <option key={kec} value={kec}>{kec}</option>
          ))}
        </select>

        <select 
          value={selectedKategori} 
          onChange={(e) => { setSelectedKategori(e.target.value); setCurrentPage(1); }}
          style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: 'white', color: '#334155' }}
        >
          <option value="">Semua Kategori</option>
          <option value="wisata">Wisata Alam & Budaya</option>
          <option value="umkm">UMKM Kerajinan & Souvenir</option>
          <option value="kuliner">Kuliner Khas Batak</option>
          <option value="penginapan">Akomodasi & Homestay</option>
          <option value="transportasi">Transportasi & Dermaga</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
          <span>Per halaman:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          >
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            Menampilkan {filtered.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filtered.length)} dari {filtered.length} Entitas Terfilter
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem auto', color: '#0284c7' }} />
            <p style={{ margin: 0 }}>Memuat data destinasi dari database PostgreSQL...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>Tidak ada destinasi yang cocok dengan filter pencarian.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Coba ubah kata kunci pencarian atau reset filter kecamatan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>DESTINASI & DESKRIPSI</th>
                  <th>KECAMATAN & ALAMAT</th>
                  <th>KOORDINAT GPS</th>
                  <th>KATEGORI</th>
                  <th>RATING</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                      {startIndex + idx + 1}
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <span className="dest-name-cell" style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{item.nama}</span>
                      <span className="dest-sub-cell" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {item.deskripsi_singkat ? item.deskripsi_singkat.slice(0, 70) + '...' : 'Destinasi terverifikasi di Danau Toba.'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, display: 'block', color: '#0f172a' }}>{item.kecamatan}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.nama_jalan ? item.nama_jalan.slice(0, 35) : 'Kawasan Danau Toba'}</span>
                    </td>
                    <td>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.78rem', color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'monospace', fontWeight: 600 }}
                        title="Buka lokasi di Google Maps"
                      >
                        <MapPin size={12} /> {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)} <ExternalLink size={10} />
                      </a>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.55rem', 
                        borderRadius: '6px', 
                        background: (item.kategori || '').toLowerCase().includes('umkm') ? '#dcfce7' : (item.kategori || '').toLowerCase().includes('kuliner') ? '#fef3c7' : (item.kategori || '').toLowerCase().includes('penginapan') ? '#f3e8ff' : '#e0f2fe', 
                        color: (item.kategori || '').toLowerCase().includes('umkm') ? '#15803d' : (item.kategori || '').toLowerCase().includes('kuliner') ? '#b45309' : (item.kategori || '').toLowerCase().includes('penginapan') ? '#7e22ce' : '#0369a1', 
                        fontWeight: 700 
                      }}>
                        {(item.kategori || 'wisata').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#d97706', fontSize: '0.85rem' }}>
                        <Star size={13} fill="#fbbf24" color="#fbbf24" /> {item.rating}
                        <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>({item.jumlah_ulasan || 0})</span>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          className="action-btn-icon" 
                          title="Edit Data & Koordinat" 
                          onClick={() => handleOpenEdit(item)}
                          style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="action-btn-icon" 
                          title="Hapus Entitas" 
                          onClick={() => handleDelete(item.id, item.nama)} 
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === 1 ? '#f1f5f9' : 'white',
                color: currentPage === 1 ? '#94a3b8' : '#334155',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>

            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                Halaman {currentPage} dari {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentPage === totalPages ? '#f1f5f9' : 'white',
                color: currentPage === totalPages ? '#94a3b8' : '#334155',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingDestinasi && (
        <div className="modal-overlay-admin fade-in">
          <div className="modal-content-admin" style={{ maxWidth: '780px', width: '90%' }}>
            <div className="modal-header-admin" style={{ background: '#072a4a', color: 'white' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}>
                <Edit size={20} color="#38bdf8" /> Edit Entitas: {editingDestinasi.nama}
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
                        {KECAMATAN_LIST.map(kec => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group-admin">
                      <label>KATEGORI ENTITAS</label>
                      <select value={editForm.kategori || 'wisata'} onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}>
                        <option value="wisata">Wisata Alam & Budaya</option>
                        <option value="umkm">UMKM Kerajinan & Souvenir</option>
                        <option value="kuliner">Kuliner Khas Batak</option>
                        <option value="penginapan">Akomodasi & Homestay</option>
                        <option value="transportasi">Transportasi & Dermaga</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-admin">
                    <label>ALAMAT PRESISI / NAMA JALAN</label>
                    <input 
                      type="text" 
                      placeholder="Jl. Sisingamangaraja No. 12, Balige"
                      value={editForm.nama_jalan || ''}
                      onChange={(e) => setEditForm({ ...editForm, nama_jalan: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group-admin">
                      <label>LATITUDE KOORDINAT (GOOGLE MAPS)</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={editForm.latitude || 2.3328}
                        onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="form-group-admin">
                      <label>LONGITUDE KOORDINAT (GOOGLE MAPS)</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        value={editForm.longitude || 99.0638}
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

      {/* ADD NEW DESTINATION MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay-admin fade-in">
          <div className="modal-content-admin" style={{ maxWidth: '780px', width: '90%' }}>
            <div className="modal-header-admin" style={{ background: '#072a4a', color: 'white' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}>
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
                        {KECAMATAN_LIST.map(kec => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group-admin">
                      <label>KATEGORI ENTITAS</label>
                      <select value={newForm.kategori} onChange={(e) => setNewForm({ ...newForm, kategori: e.target.value })}>
                        <option value="wisata">Wisata Alam & Budaya</option>
                        <option value="umkm">UMKM Kerajinan & Souvenir</option>
                        <option value="kuliner">Kuliner Khas Batak</option>
                        <option value="penginapan">Akomodasi & Homestay</option>
                        <option value="transportasi">Transportasi & Dermaga</option>
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
