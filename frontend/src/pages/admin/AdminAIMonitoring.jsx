import React from 'react';
import { Activity, Cpu, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import './Admin.css';

const AI_LOGS = [
  { id: 1, time: '14:20:05', query: 'Rekomendasi penginapan dekat Pasir Putih?', response: 'Terdapat Eco-Camp Toba dan Homestay Pangururan yang populer...', status: 'success', latency: '1.1s' },
  { id: 2, time: '14:18:12', query: 'Di mana tempat makan naniarsik yang enak dan halal?', response: 'Rumah Makan Muslim Balige dan Resto Kuliner khas Naniarsik...', status: 'success', latency: '1.4s' },
  { id: 3, time: '13:58:30', query: 'Bagaimana cara sewa sepeda listrik di Balerong Balige?', response: 'Mohon maaf, saat ini data penyewaan sepeda listrik belum tersedia.', status: 'gap', latency: '0.9s' },
  { id: 4, time: '13:45:10', query: 'Berapa harga tiket masuk Museum TB Silalahi?', response: 'Tarif masuk Museum Batak TB Silalahi Center berkisar Rp 10.000 - Rp 20.000.', status: 'success', latency: '1.2s' },
];

const AdminAIMonitoring = () => {
  return (
    <div className="fade-in">
      <div className="card-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--admin-sidebar-bg)', margin: 0 }}>AI Monitoring & Analytics</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Monitoring performa LLM Gemini, RAG retrieval precision, dan latency respons AI secara real-time.</p>
        </div>
        <button className="btn-admin-save" style={{ background: 'white', color: '#334155', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* KPI Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>TOTAL QUERIES HARI INI</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>1,284</div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>RAG RETRIEVAL ACCURACY</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>98.2%</div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>KNOWLEDGE GAP BOX</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>14</div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>AVERAGE LATENCY</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>1.2s</div>
        </div>
      </div>

      {/* Log Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <h3>Real-time Log Table (RAG Engine)</h3>
        </div>

        <table className="admin-data-table">
          <thead>
            <tr>
              <th>WAKTU</th>
              <th>PERTANYAAN PENGGUNAKAN</th>
              <th>RESPONS AI (GEMINI)</th>
              <th>LATENCY</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {AI_LOGS.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{log.time}</td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>"{log.query}"</td>
                <td style={{ fontSize: '0.85rem', color: '#475569' }}>{log.response}</td>
                <td style={{ fontWeight: 600 }}>{log.latency}</td>
                <td>
                  {log.status === 'success' ? (
                    <span className="badge-status terverifikasi">SUCCESS</span>
                  ) : (
                    <span className="badge-status draft" style={{ background: '#fef2f2', color: '#b91c1c' }}>KNOWLEDGE GAP</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAIMonitoring;
