import React, { useState } from 'react';
import { MapPin, MessageSquare, AlertTriangle, Download, Plus, MoreVertical, X, CheckCircle, RefreshCw } from 'lucide-react';
import './Admin.css';

const INITIAL_ACTIVITIES = [
  { id: 1, nama: 'Puncak 2000 Siosar', sub: 'Karo, Sumatera Utara', kategori: 'Wisata Alam', status: 'terverifikasi', waktu: '2 jam yang lalu' },
  { id: 2, nama: 'Kopi Lintong UMKM Center', sub: 'Humbang Hasundutan', kategori: 'Kuliner / UMKM', status: 'diperbarui', waktu: '5 jam yang lalu' },
  { id: 3, nama: 'Museum Batak Tomok', sub: 'Samosir', kategori: 'Wisata Budaya', status: 'terverifikasi', waktu: 'Kemarin, 14:20' },
  { id: 4, nama: 'Eco-Camp Toba', sub: 'Dairi', kategori: 'Penginapan', status: 'draft', waktu: 'Kemarin, 09:15' },
  { id: 5, nama: 'Pusat Tenun Ulos Balige', sub: 'Toba', kategori: 'UMKM / Kerajinan', status: 'terverifikasi', waktu: '12 Okt 2023' },
];

const AdminDashboard = () => {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Destination Form state
  const [newNama, setNewNama] = useState('');
  const [newKecamatan, setNewKecamatan] = useState('Balige');
  const [newKategori, setNewKategori] = useState('Wisata Alam');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const handleAddDestination = (e) => {
    e.preventDefault();
    if (!newNama) return;

    const newItem = {
      id: Date.now(),
      nama: newNama,
      sub: `${newKecamatan}, Toba`,
      kategori: newKategori,
      status: 'terverifikasi',
      waktu: 'Baru saja'
    };

    setActivities([newItem, ...activities]);
    setIsModalOpen(false);
    setNewNama('');
    setNewDeskripsi('');
  };

  return (
    <div className="fade-in">
      {/* Title Header */}
      <div className="dashboard-header-title">
        <h1>TobaRoute AI: Sistem Rekomendasi Destinasi dan Pendukung UMKM Berbasis Keadilan Data di Kawasan Lingkar Toba</h1>
        <p>Monitoring real-time aktivitas pariwisata dan integritas data di seluruh kawasan Danau Toba.</p>
      </div>

      {/* 3 KPI CARDS GRID */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">TOTAL DESTINASI TERDAFTAR</div>
            <div className="kpi-value">142 Destinasi</div>
            <div className="kpi-subtext">+5 bulan ini</div>
          </div>
          <div className="kpi-icon-box">
            <MapPin size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">TOTAL PERTANYAAN AI HARI INI</div>
            <div className="kpi-value">1.205 Query</div>
            <div className="kpi-subtext">98% response rate</div>
          </div>
          <div className="kpi-icon-box">
            <MessageSquare size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">PERTANYAAN GAGAL DIJAWAB AI</div>
            <div className="kpi-value danger">14 Masalah</div>
            <div className="kpi-subtext warning">Perlu peninjauan manual</div>
          </div>
          <div className="kpi-icon-box danger">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* MIDDLE ANALYTICS GRID */}
      <div className="middle-analytics-grid">
        {/* BAR CHART: Destinasi Paling Sering Ditanyakan */}
        <div className="chart-card">
          <div className="card-title-row">
            <h3>Destinasi Paling Sering Ditanyakan Wisatawan</h3>
            <select style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="bar-chart-list">
            <div className="bar-item">
              <span className="bar-label">Bukit Holbung</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: '85%' }}></div></div>
              <span className="bar-count">420</span>
            </div>

            <div className="bar-item">
              <span className="bar-label">Pusuk Buhit</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: '70%' }}></div></div>
              <span className="bar-count">350</span>
            </div>

            <div className="bar-item">
              <span className="bar-label">Air Terjun Sipiso-piso</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: '63%' }}></div></div>
              <span className="bar-count">315</span>
            </div>

            <div className="bar-item">
              <span className="bar-label">Huta Siallagan</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: '46%' }}></div></div>
              <span className="bar-count">230</span>
            </div>

            <div className="bar-item">
              <span className="bar-label">Pasir Putih Parbaba</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: '36%' }}></div></div>
              <span className="bar-count">180</span>
            </div>
          </div>
        </div>

        {/* INSIGHT KAWASAN CARD */}
        <div className="insight-card">
          <div>
            <h3>Insight Kawasan</h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
              Trend permintaan meningkat sebesar 12% pada kategori "Wisata Sejarah".
            </p>

            <div className="insight-box">
              <label>Popular Topic</label>
              <p>"Hotel ramah UMKM"</p>
            </div>

            <div className="insight-box">
              <label>Top Origin</label>
              <p>Medan & Jakarta</p>
            </div>
          </div>

          <button className="btn-download-report">
            <Download size={16} />
            <span>Unduh Laporan Analisis</span>
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY DATA TABLE */}
      <div className="table-card">
        <div className="table-header-bar">
          <h3>Recent Activity: Destinasi & UMKM</h3>
          <a href="#" style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}>Lihat Semua</a>
        </div>

        <table className="admin-data-table">
          <thead>
            <tr>
              <th>DESTINASI</th>
              <th>KATEGORI</th>
              <th>STATUS</th>
              <th>TERAKHIR DIUBAH</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="dest-name-cell">{item.nama}</span>
                  <span className="dest-sub-cell">{item.sub}</span>
                </td>
                <td>{item.kategori}</td>
                <td>
                  <span className={`badge-status ${item.status}`}>{item.status}</span>
                </td>
                <td>{item.waktu}</td>
                <td>
                  <button className="action-btn-icon" title="Opsi">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FLOATING ACTION BUTTON TO ADD DESTINATION */}
      <button className="floating-add-btn" onClick={() => setIsModalOpen(true)} title="Tambah Destinasi Baru">
        <Plus size={24} />
      </button>

      {/* ADD DESTINATION MODAL */}
      {isModalOpen && (
        <div className="modal-overlay-admin fade-in">
          <div className="modal-content-admin">
            <div className="modal-header-admin">
              <h3>Tambah Destinasi & UMKM Baru</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDestination}>
              <div className="modal-body-admin">
                <div className="form-group-admin">
                  <label>NAMA DESTINASI / UMKM</label>
                  <input 
                    type="text" 
                    placeholder="misal: Resto Kuliner Naniarsik Balige"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group-admin">
                    <label>KECAMATAN</label>
                    <select value={newKecamatan} onChange={(e) => setNewKecamatan(e.target.value)}>
                      <option value="Balige">Balige</option>
                      <option value="Porsea">Porsea</option>
                      <option value="Laguboti">Laguboti</option>
                      <option value="Muara">Muara</option>
                      <option value="Pangururan">Pangururan</option>
                    </select>
                  </div>

                  <div className="form-group-admin">
                    <label>KATEGORI</label>
                    <select value={newKategori} onChange={(e) => setNewKategori(e.target.value)}>
                      <option value="Wisata Alam">Wisata Alam</option>
                      <option value="Wisata Budaya">Wisata Budaya</option>
                      <option value="Kuliner / UMKM">Kuliner / UMKM</option>
                      <option value="Penginapan">Penginapan</option>
                      <option value="UMKM / Kerajinan">UMKM / Kerajinan</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-admin">
                  <label>DESKRIPSI SINGKAT</label>
                  <input 
                    type="text" 
                    placeholder="Deskripsi singkat mengenai lokasi..."
                    value={newDeskripsi}
                    onChange={(e) => setNewDeskripsi(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer-admin">
                <button type="button" className="btn-admin-cancel" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-admin-save">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
