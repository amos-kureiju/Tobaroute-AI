// ====================================================================================================
// FILE: frontend/src/pages/ItineraryPlanner.jsx
// TUJUAN: Halaman Studio Perencana Itinerary AI Interaktif (Dedicated AI Trip Planner Studio).
// ====================================================================================================

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, MapPin, Sun, Cloud, 
  Wind, Thermometer, Plus, Trash2, ArrowUp, ArrowDown, 
  Printer, CheckSquare, DollarSign, Navigation, 
  RotateCw, AlertCircle, CheckCircle, ShieldCheck
} from 'lucide-react';
import { getFairRecommendation } from '../services/api';

const ItineraryPlanner = () => {
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('Wisata alam kaldera, budaya Batak, dan kuliner khas naniarsik');
  const [kecamatan, setKecamatan] = useState('Balige');
  const [itineraryDays, setItineraryDays] = useState([]);

  const [packingList, setPackingList] = useState([
    { id: 1, text: 'Jaket hangat / windbreaker (suhu kaldera 19-23°C)', done: true },
    { id: 2, text: 'Sepatu jalan antiselip untuk bukit & geosite', done: true },
    { id: 3, text: 'Uang tunai kecil untuk retribusi & belanja UMKM tenun', done: false },
    { id: 4, text: 'Kacamata hitam & tabir surya di area danau', done: false },
    { id: 5, text: 'Powerbank & kamera untuk dokumentasi panorama', done: true },
    { id: 6, text: 'Pakaian ganti untuk wisata air / pantai pasir putih', done: false }
  ]);

  useEffect(() => {
    generateCustomItinerary(selectedDuration, kecamatan);
  }, [selectedDuration]);

  const generateCustomItinerary = async (daysCount, targetKec) => {
    setLoading(true);
    try {
      const data = await getFairRecommendation(query, targetKec, 0);
      const destUtama = data?.destinasi_utama || [];
      const umkmList = data?.rekomendasi_umkm_sekitar || [];

      const weatherSamples = [
        { temp: '22°C – 25°C', status: 'Cerah Berawan', humidity: '72%', wind: '11 km/jam', outfit: 'Pakaian kasual katun & jaket tipis' },
        { temp: '21°C – 24°C', status: 'Semilir Angin Kaldera', humidity: '76%', wind: '15 km/jam', outfit: 'Jaket angin & alas kaki nyaman' },
        { temp: '20°C – 23°C', status: 'Sejuk Menyegarkan', humidity: '80%', wind: '9 km/jam', outfit: 'Sepatu olahraga & pakaian santai' },
        { temp: '22°C – 26°C', status: 'Hangat Bersahabat', humidity: '70%', wind: '13 km/jam', outfit: 'Outfit foto warna cerah & kacamata' }
      ];

      const builtDays = [];
      for (let i = 0; i < daysCount; i++) {
        const d1 = destUtama[i % (destUtama.length || 1)] || { nama: 'Eksplorasi Kaldera Danau Toba', kategori: 'Wisata Alam', rating: 4.8, nama_jalan: 'Balige' };
        const u1 = umkmList[i % (umkmList.length || 1)] || { nama: 'Rumah Makan Tradisional Batak', kategori: 'Kuliner', rating: 4.7, nama_jalan: 'Jl. Tarutung' };
        const d2 = destUtama[(i + 1) % (destUtama.length || 1)] || { nama: 'Sentra Tenun Ulos & Budaya', kategori: 'UMKM & Budaya', rating: 4.9, nama_jalan: 'Desa Meat' };

        builtDays.push({
          dayNumber: i + 1,
          dateLabel: `Hari ${i + 1}`,
          title: i === 0 ? `Hari 1: Pusaka & Gastronomi ${targetKec || 'Balige'}` : i === 1 ? `Hari 2: Penyeberangan Samosir & Geosite` : `Hari ${i + 1}: Hidden Gems & Belanja Oleh-Oleh`,
          weather: weatherSamples[i % weatherSamples.length],
          budgetEst: {
            makan: 120000,
            tiket: 35000,
            transport: 65000,
            olehOleh: 150000
          },
          items: [
            {
              id: `${i}-1`,
              time: '08:00 – 09:30 WIB',
              title: 'Sarapan Mie Gomak Kuah Andaliman & Kopi Lintong',
              category: 'Kuliner Pagi',
              location: 'Kedai Kopi & Warung Sarapan Lokal',
              temp: '21°C',
              note: 'Memulai hari dengan kuah santan hangat rempah andaliman yang membangkitkan stamina.',
              cost: 'Rp 25.000 / porsi'
            },
            {
              id: `${i}-2`,
              time: '10:00 – 12:30 WIB',
              title: d1.nama,
              category: d1.kategori || 'Destinasi Utama',
              location: d1.nama_jalan || 'Kawasan Wisata Kaldera',
              temp: '24°C',
              note: 'Eksplorasi panorama alam dan spot foto terbaik dengan pencahayaan matahari pagi.',
              cost: 'Rp 10.000 (Tiket Masuk)'
            },
            {
              id: `${i}-3`,
              time: '13:00 – 14:30 WIB',
              title: u1.nama,
              category: 'Makan Siang & UMKM',
              location: u1.nama_jalan || 'Pusat Kuliner Lokal',
              temp: '25°C',
              note: 'Mencicipi Ikan Mas Naniarsik autentik dan mendukung pelaku UMKM kuliner warga setempat.',
              cost: 'Rp 45.000 / orang'
            },
            {
              id: `${i}-4`,
              time: '15:30 – 17:30 WIB',
              title: d2.nama,
              category: d2.kategori || 'Sentra Kerajinan',
              location: d2.nama_jalan || 'Sentra UMKM Lokal',
              temp: '23°C',
              note: 'Melihat langsung proses tenun Ulos tradisional dengan alat tenun bukan mesin (ATBM).',
              cost: 'Bebas Masuk'
            },
            {
              id: `${i}-5`,
              time: '19:00 – 21:00 WIB',
              title: 'Santap Malam Ikan Bakar Danau & Kopi Arabika',
              category: 'Santap Malam',
              location: 'Resto Tepi Danau Toba',
              temp: '20°C',
              note: 'Menikmati makan malam dengan pemandangan lampu tepi danau dan alunan musik lokal.',
              cost: 'Rp 50.000 / orang'
            }
          ]
        });
      }

      setItineraryDays(builtDays);
    } catch (e) {
      console.error("Error generating planner itinerary:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = (id) => {
    setPackingList(packingList.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const moveItem = (dayIdx, itemIdx, direction) => {
    const newDays = [...itineraryDays];
    const items = [...newDays[dayIdx].items];
    const targetIdx = itemIdx + direction;
    if (targetIdx >= 0 && targetIdx < items.length) {
      const temp = items[itemIdx];
      items[itemIdx] = items[targetIdx];
      items[targetIdx] = temp;
      newDays[dayIdx].items = items;
      setItineraryDays(newDays);
    }
  };

  const deleteItem = (dayIdx, itemIdx) => {
    const newDays = [...itineraryDays];
    newDays[dayIdx].items = newDays[dayIdx].items.filter((_, idx) => idx !== itemIdx);
    setItineraryDays(newDays);
  };

  const currentDay = itineraryDays[activeDayIndex] || itineraryDays[0];

  return (
    <div className="planner-page-container fade-in" style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header Studio Planner */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-blue" style={{ marginBottom: '0.85rem' }}>
            <Sparkles size={13} /> Studio Perencana AI
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0A0F1E', letterSpacing: '-0.025em', margin: '0 0 0.75rem 0' }}>
            Rancang Itinerary Sempurna Danau Toba
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.65 }}>
            Kustomisasi jadwal jam-ke-jam, sesuaikan perkiraan cuaca mikro, hitung estimasi anggaran, dan siapkan perlengkapan wisata Anda dalam satu studio terpadu.
          </p>
        </div>

        {/* Studio Control Toolbar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#ffffff', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
            
            {/* Durasi Hari */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                <Calendar size={13} color="#0071CE" /> Durasi Hari:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`btn-secondary${selectedDuration === num ? ' active' : ''}`}
                    onClick={() => { setSelectedDuration(num); setActiveDayIndex(0); }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      background: selectedDuration === num ? '#0071CE' : '#F8FAFC',
                      color: selectedDuration === num ? '#ffffff' : '#475569',
                      borderColor: selectedDuration === num ? '#0071CE' : '#E2E8F0'
                    }}
                  >
                    {num}H
                  </button>
                ))}
              </div>
            </div>

            {/* Target Wilayah */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.03em' }}>
                <MapPin size={13} color="#0071CE" /> Fokus Wilayah:
              </label>
              <select
                value={kecamatan}
                onChange={(e) => { setKecamatan(e.target.value); generateCustomItinerary(selectedDuration, e.target.value); }}
                style={{ height: '40px', fontWeight: 600 }}
              >
                <option value="Balige">Balige & Toba</option>
                <option value="Samosir">Pulau Samosir (Pangururan & Tomok)</option>
                <option value="Parapat">Parapat & Simalungun</option>
                <option value="Doloksanggul">Humbahas (Bakkara & Sipinsur)</option>
                <option value="Tarutung">Tapanuli Utara (Muara & Tarutung)</option>
                <option value="Berastagi">Karo (Tongging & Sipiso-piso)</option>
              </select>
            </div>

            {/* Tombol Regenerate & Print */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn-primary"
                onClick={() => generateCustomItinerary(selectedDuration, kecamatan)}
                disabled={loading}
                style={{ flex: 1, height: '40px' }}
              >
                <RotateCw size={14} className={loading ? 'spinner' : ''} />
                <span>{loading ? 'Menyusun...' : 'Buat Ulang Rute'}</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => window.print()}
                style={{ height: '40px', padding: '0 0.9rem' }}
                title="Cetak Rencana Perjalanan"
              >
                <Printer size={15} />
              </button>
            </div>

          </div>
        </div>

        {/* Main Grid Studio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: '2rem' }}>
          
          {/* Kolom Kiri: Day Tabs, Weather Card, & Timeline Items */}
          <div>
            
            {/* Day Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
              {itineraryDays.map((d, idx) => (
                <button
                  key={idx}
                  className={`day-tab-btn${activeDayIndex === idx ? ' active' : ''}`}
                  onClick={() => setActiveDayIndex(idx)}
                >
                  <Calendar size={13} />
                  <span>{d.dateLabel}</span>
                </button>
              ))}
            </div>

            {/* Weather Card for Active Day */}
            {currentDay && (
              <div className="daily-weather-bar">
                <div className="weather-forecast-badge">
                  <div className="weather-icon-dot"><Sun size={20} /></div>
                  <span className="weather-temp-num">{currentDay.weather?.temp}</span>
                  <div className="weather-detail-col">
                    <span className="weather-status-text">{currentDay.weather?.status}</span>
                    <span className="weather-sub-text">Kelembapan {currentDay.weather?.humidity} · Angin Danau {currentDay.weather?.wind}</span>
                  </div>
                </div>

                <div className="weather-outfit-tip">
                  <CheckCircle size={14} />
                  <span>{currentDay.weather?.outfit}</span>
                </div>
              </div>
            )}

            {/* Timeline Items */}
            {currentDay && (
              <div className="timeline-schedule-list" style={{ borderLeftColor: '#E2E8F0' }}>
                {currentDay.items.map((slot, sIdx) => (
                  <div key={slot.id} className="timeline-slot-item">
                    <div className="timeline-bullet" />
                    <div className="timeline-slot-card" style={{ marginBottom: '0.75rem' }}>
                      
                      <div className="slot-time-col">
                        <span className="slot-time-pill">
                          <Clock size={11} /> {slot.time}
                        </span>
                        <span className="slot-weather-chip">
                          <Thermometer size={11} /> {slot.temp}
                        </span>
                      </div>

                      <div className="slot-content-col">
                        <span className="slot-category-tag">{slot.category}</span>
                        <h4>{slot.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem' }}>
                          {slot.location} · <strong style={{ color: '#00875A' }}>{slot.cost}</strong>
                        </div>
                        <div className="slot-ai-reason">{slot.note}</div>
                      </div>

                      {/* Controls Move & Delete */}
                      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                        <button onClick={() => moveItem(activeDayIndex, sIdx, -1)} disabled={sIdx === 0} style={{ padding: '4px 6px', background: '#F1F5F9', borderRadius: '6px', opacity: sIdx === 0 ? 0.35 : 1 }} title="Geser ke Atas">
                          <ArrowUp size={13} color="#475569" />
                        </button>
                        <button onClick={() => moveItem(activeDayIndex, sIdx, 1)} disabled={sIdx === currentDay.items.length - 1} style={{ padding: '4px 6px', background: '#F1F5F9', borderRadius: '6px', opacity: sIdx === currentDay.items.length - 1 ? 0.35 : 1 }} title="Geser ke Bawah">
                          <ArrowDown size={13} color="#475569" />
                        </button>
                        <button onClick={() => deleteItem(activeDayIndex, sIdx)} style={{ padding: '4px 6px', background: '#FEF2F2', borderRadius: '6px' }} title="Hapus Spot">
                          <Trash2 size={13} color="#DC2626" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Kolom Kanan: Budget Widget & Packing Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Widget Estimasi Biaya */}
            <div className="card" style={{ padding: '1.35rem', background: '#ffffff', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A0F1E', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} color="#00875A" /> Estimasi Anggaran
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Kuliner & Santap:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {((currentDay?.budgetEst?.makan || 120000) * selectedDuration).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Tiket & Retribusi:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {((currentDay?.budgetEst?.tiket || 35000) * selectedDuration).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Bahan Bakar & Feri:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {((currentDay?.budgetEst?.transport || 65000) * selectedDuration).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#64748B' }}>Belanja UMKM:</span>
                  <span style={{ fontWeight: 700, color: '#0A0F1E' }}>Rp {(currentDay?.budgetEst?.olehOleh || 150000).toLocaleString('id-ID')}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.65rem', borderTop: '1.5px solid #0A0F1E', fontSize: '0.95rem', fontWeight: 800 }}>
                  <span>Total ({selectedDuration} Hari):</span>
                  <span style={{ color: '#0071CE' }}>
                    Rp {(
                      ((currentDay?.budgetEst?.makan || 120000) + (currentDay?.budgetEst?.tiket || 35000) + (currentDay?.budgetEst?.transport || 65000)) * selectedDuration + (currentDay?.budgetEst?.olehOleh || 150000)
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Perlengkapan Wisata */}
            <div className="card" style={{ padding: '1.35rem', background: '#ffffff', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A0F1E', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckSquare size={16} color="#0071CE" /> Checklist Perlengkapan
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.85rem 0' }}>
                Disesuaikan otomatis dengan suhu sejuk kaldera dan rute wisata danau.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {packingList.map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', color: item.done ? '#94A3B8' : '#334155', cursor: 'pointer', textDecoration: item.done ? 'line-through' : 'none' }}>
                    <input 
                      type="checkbox" 
                      checked={item.done} 
                      onChange={() => handleToggleCheck(item.id)}
                      style={{ width: '15px', height: '15px', accentColor: '#0071CE' }}
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ItineraryPlanner;
