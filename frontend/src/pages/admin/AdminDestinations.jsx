import React, { useState, useEffect } from 'react';
import { getDestinations } from '../../services/api';
import { Search, Plus, Edit, Trash2, MapPin, Star, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import './Admin.css';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('');

  useEffect(() => {
    const fetchDest = async () => {
      try {
        setLoading(true);
        const data = await getDestinations('', 100);
        setDestinations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDest();
  }, []);

  const filtered = destinations.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.kecamatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKecamatan = selectedKecamatan === '' || item.kecamatan === selectedKecamatan;
    return matchesSearch && matchesKecamatan;
  });

  return (
    <div className="fade-in">
      <div className="card-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0 }}>Kelola Data Destinasi & UMKM</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Kelola daftar entitas pariwisata dan UMKM di kawasan Lingkar Toba.</p>
        </div>
        <button className="btn-admin-save" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Tambah Destinasi Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Cari nama destinasi atau lokasi..."
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
          <option value="Balige">Balige</option>
          <option value="Porsea">Porsea</option>
          <option value="Laguboti">Laguboti</option>
          <option value="Muara">Muara</option>
          <option value="Silaen">Silaen</option>
        </select>
      </div>

      {/* Table List */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Memuat data destinasi...</div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>DESTINASI</th>
                <th>KECAMATAN</th>
                <th>KATEGORI</th>
                <th>RATING</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="dest-name-cell">{item.nama}</span>
                    <span className="dest-sub-cell">{item.deskripsi_singkat ? item.deskripsi_singkat.slice(0, 60) + '...' : ''}</span>
                  </td>
                  <td>{item.kecamatan}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.kategori?.toLowerCase() === 'umkm' ? '#dcfce7' : '#e0f2fe', color: item.kategori?.toLowerCase() === 'umkm' ? '#15803d' : '#0369a1', fontWeight: 600 }}>
                      {item.kategori}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" /> {item.rating} ({item.jumlah_ulasan})
                    </span>
                  </td>
                  <td>
                    <span className="badge-status terverifikasi">Aktif</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="action-btn-icon" title="Edit"><Edit size={16} /></button>
                      <button className="action-btn-icon" title="Hapus" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDestinations;
