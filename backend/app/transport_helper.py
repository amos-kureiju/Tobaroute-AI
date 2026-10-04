# ====================================================================================================
# FILE: backend/app/transport_helper.py
# TUJUAN:
# Modul sentral pengetahuan dan kalkulasi akses transportasi kawasan Danau Toba.
# Menyediakan informasi rute darat, angkutan umum (angkot/bus), kapal feri penyeberangan,
# akses dari Bandara Internasional Silangit (DTB), estimasi biaya/tarif, dan tips praktis bagi wisatawan.
# ====================================================================================================

import math
from typing import Dict, Any, Optional

# ====================================================================================================
# TITIK-TITIK HUB TRANSPORTASI UTAMA KAWASAN DANAU TOBA (GEO-COORDINATES)
# ====================================================================================================
HUBS = {
    "bandara_silangit": {
        "nama": "Bandara Internasional Raja Sisingamangaraja XII (Silangit / DTB)",
        "lat": 2.2590,
        "lon": 98.9950,
        "tipe": "bandara"
    },
    "pelabuhan_balige": {
        "nama": "Pelabuhan Mulia Raja Napitupulu (Balige)",
        "lat": 2.3387,
        "lon": 99.0625,
        "tipe": "pelabuhan"
    },
    "pelabuhan_ajibata": {
        "nama": "Pelabuhan Ajibata (Parapat / Toba)",
        "lat": 2.6710,
        "lon": 98.9320,
        "tipe": "pelabuhan"
    },
    "pelabuhan_tomok": {
        "nama": "Pelabuhan Tomok (Samosir)",
        "lat": 2.6515,
        "lon": 98.8680,
        "tipe": "pelabuhan"
    },
    "pelabuhan_ambarita": {
        "nama": "Pelabuhan Ambarita (Samosir)",
        "lat": 2.6860,
        "lon": 98.8410,
        "tipe": "pelabuhan"
    },
    "pelabuhan_tigaras": {
        "nama": "Pelabuhan Tigaras (Simalungun)",
        "lat": 2.7980,
        "lon": 98.7890,
        "tipe": "pelabuhan"
    },
    "pelabuhan_simanindo": {
        "nama": "Pelabuhan Simanindo (Samosir)",
        "lat": 2.7660,
        "lon": 98.7610,
        "tipe": "pelabuhan"
    },
    "pelabuhan_muara": {
        "nama": "Pelabuhan Muara (Tapanuli Utara)",
        "lat": 2.3390,
        "lon": 98.9180,
        "tipe": "pelabuhan"
    },
    "pelabuhan_onan_runggu": {
        "nama": "Pelabuhan Onan Runggu (Samosir)",
        "lat": 2.4510,
        "lon": 98.9830,
        "tipe": "pelabuhan"
    },
    "terminal_balige": {
        "nama": "Terminal Angkutan Balige",
        "lat": 2.3330,
        "lon": 99.0640,
        "tipe": "terminal"
    },
    "jembatan_tano_ponggol": {
        "nama": "Jembatan Tano Ponggol (Akses Darat Samosir - Pangururan)",
        "lat": 2.6070,
        "lon": 98.7080,
        "tipe": "akses_darat"
    }
}

# ====================================================================================================
# FUNGSI BANTU: HAVERSINE FORMULA
# ====================================================================================================
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Menghitung jarak lengkung bumi (lingkaran besar) dalam kilometer."""
    try:
        r = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(r * c, 1)
    except Exception:
        return 0.0

def estimate_drive_duration_minutes(road_km: float, speed_kmh: float = 40.0) -> int:
    """Mengestimasi durasi berkendara di jalan perbukitan Danau Toba."""
    if road_km <= 0:
        return 5
    actual_road_distance = road_km * 1.35
    minutes = (actual_road_distance / speed_kmh) * 60
    return max(5, int(round(minutes)))

# ====================================================================================================
# FUNGSI UTAMA: get_transport_guide
# ====================================================================================================
def get_transport_guide(
    nama: str, 
    kecamatan: str, 
    kategori: str, 
    latitude: float, 
    longitude: float,
    nama_jalan: str = ""
) -> Dict[str, Any]:
    """
    Menghasilkan panduan akses transportasi lengkap, akurat, dan ramah wisatawan.
    """
    lat = float(latitude) if latitude else 2.3387
    lon = float(longitude) if longitude else 99.0625
    kec = (kecamatan or "").strip().title()
    kec_lower = kec.lower()

    # 1. Hitung Jarak & Durasi ke Bandara Silangit
    silangit = HUBS["bandara_silangit"]
    dist_silangit_geo = haversine_km(lat, lon, silangit["lat"], silangit["lon"])
    est_road_km_silangit = round(dist_silangit_geo * 1.35, 1)
    est_dur_silangit_min = estimate_drive_duration_minutes(dist_silangit_geo, speed_kmh=42.0)

    # Format durasi yang mudah dibaca
    if est_dur_silangit_min >= 60:
        jam = est_dur_silangit_min // 60
        sisa_min = est_dur_silangit_min % 60
        dur_silangit_str = f"sekitar {jam} jam {sisa_min} menit" if sisa_min > 0 else f"sekitar {jam} jam"
    else:
        dur_silangit_str = f"sekitar {est_dur_silangit_min} menit"

    # 2. Tentukan Hub Feri / Pelabuhan Terdekat
    is_samosir_island = kec_lower in [
        "samosir", "pangururan", "simanindo", "onan runggu", 
        "palipi", "ronggur nihuta", "sianjur mulamula", "harian", "tuktuk", "tomok", "ambarita"
    ]
    
    closest_ferry_hub = None
    min_ferry_dist = 9999.0
    for hub_id, hub_data in HUBS.items():
        if hub_data["tipe"] == "pelabuhan":
            d = haversine_km(lat, lon, hub_data["lat"], hub_data["lon"])
            if d < min_ferry_dist:
                min_ferry_dist = d
                closest_ferry_hub = hub_data

    # 3. Klasifikasi Trayek Angkutan Umum Berdasarkan Kecamatan
    if kec_lower in ["balige", "tampahan"]:
        public_transit = {
            "nama_moda": "Angkot Balige (Rajawali / Koperasi Balige) & Becak Motor (Bentor)",
            "trayek": "Terminal Balige - Pusat Kota - Pantai Lumban Bulbul / Pantai Meat / TB Silalahi",
            "titik_turun": f"Turun di simpang masuk {nama} atau langsung di depan lokasi",
            "estimasi_tarif": "Rp 5.000 - Rp 10.000 (Angkot) | Rp 15.000 - Rp 25.000 (Bentor)",
            "frekuensi": "Tersedia setiap 10-15 menit (06.00 - 18.00 WIB)"
        }
        kondisi_jalan = "Jalan aspal mulus perkotaan, mudah dijangkau mobil roda empat dan bus pariwisata."
        parkir_info = "Tersedia area parkir kendaraan roda 2 dan roda 4 luas di lokasi."
    elif kec_lower in ["laguboti", "sigumpar", "silaen", "porsea", "lumban julu"]:
        public_transit = {
            "nama_moda": "Angkot Antar-Kecamatan & Bus Travel Lintas Sumatera (KBT / Sampri)",
            "trayek": f"Rute Lintas Porsea - Laguboti - Balige (Turun di pusat {kec})",
            "titik_turun": f"Simpang utama {kec}, dilanjutkan ojek lokal menuju {nama}",
            "estimasi_tarif": "Rp 8.000 - Rp 15.000 (Angkot/Bus) | Rp 10.000 - Rp 20.000 (Ojek)",
            "frekuensi": "Tersedia sepanjang hari di jalan lintas (06.00 - 19.00 WIB)"
        }
        kondisi_jalan = "Jalan Lintas Sumatera aspal hotmix lebar dengan penerangan jalan memadai."
        parkir_info = "Tersedia area parkir kendaraan mobil dan motor."
    elif kec_lower in ["parapat", "girsang sipangan bolon", "ajibata"]:
        public_transit = {
            "nama_moda": "Bus Antar-Kota (Sejahtera / Intra / KBT) & Angkot Parapat",
            "trayek": "Terminal Sosor Saba Parapat - Pelabuhan Ajibata - Tugu Parapat",
            "titik_turun": "Tepi Jalan Lintas Parapat / Dermaga Ajibata",
            "estimasi_tarif": "Rp 5.000 - Rp 10.000 (Angkot) | Rp 15.000 - Rp 30.000 (Bentor Wisata)",
            "frekuensi": "Sangat sering, beroperasi hingga malam hari (06.00 - 21.00 WIB)"
        }
        kondisi_jalan = "Jalan beraspal mulus dengan jalur perbukitan dan pemandangan danau kaldera."
        parkir_info = "Tersedia parkir di hotel/restoran atau kantong parkir pelabuhan."
    elif is_samosir_island:
        public_transit = {
            "nama_moda": "Angkutan Pedesaan Samosir, Ojek Wisata, & Sewa Motor Lokal",
            "trayek": "Tomok - Tuktuk Siadong - Ambarita - Pangururan (Lingkar Samosir)",
            "titik_turun": f"Pemberhentian jalan lingkar Samosir terdekat dari {nama}",
            "estimasi_tarif": "Rp 10.000 - Rp 25.000 (Angkot) | Sewa motor Rp 80.000/hari",
            "frekuensi": "Tersedia berkala di sepanjang jalan lingkar pulau Samosir"
        }
        kondisi_jalan = "Jalan Lingkar Samosir beraspal baru dan mulus dengan pemandangan danau spektakuler."
        parkir_info = "Parkir nyaman di lokasi destinasi atau pinggir jalan wisata aman."
    elif kec_lower in ["muara", "baktiraja", "doloksanggul", "lintong nihuta"]:
        public_transit = {
            "nama_moda": "Angkot Pedesaan Siborong-borong / Muara & Ojek Lokal",
            "trayek": f"Simpang Siborong-borong - Muara - Huta Ginjang / Baktiraja",
            "titik_turun": f"Simpang masuk kawasan wisata {nama}",
            "estimasi_tarif": "Rp 15.000 - Rp 25.000 (Angkot/Ojek)",
            "frekuensi": "Beroperasi terutama pagi hingga sore (07.00 - 17.00 WIB)"
        }
        kondisi_jalan = "Jalan aspal berliku di ketinggian bukit dengan panorama lembah Danau Toba."
        parkir_info = "Tersedia kantong parkir wisata di lokasi."
    else:
        public_transit = {
            "nama_moda": "Angkutan Umum Kecamatan & Ojek Motor Lokal",
            "trayek": f"Pusat Kecamatan {kec} - Destinasi {nama}",
            "titik_turun": f"Titik akses terdekat {nama}",
            "estimasi_tarif": "Rp 10.000 - Rp 20.000",
            "frekuensi": "Tersedia pada jam aktivitas warga (07.00 - 17.30 WIB)"
        }
        kondisi_jalan = "Jalan aspal reguler kawasan Toba dengan kontur perbukitan alami."
        parkir_info = "Area parkir memadai untuk kendaraan roda 2 dan roda 4."

    # 4. Panduan Kapal Feri / Penyeberangan Danau
    ferry_info = None
    if is_samosir_island:
        ferry_info = {
            "rekomendasi_jalur": "Penyeberangan Feri RORO (Mobil & Penumpang) atau Kapal Tradisional",
            "dermaga_pilihan": [
                {
                    "rute": "Pelabuhan Ajibata (Parapat) - Pelabuhan Tomok / Ambarita (Samosir)",
                    "kapal": "KMP Ihan Batak & KMP Pora-Pora (RORO) / KMP Tao Toba",
                    "durasi": "sekitar 45 menit penyeberangan",
                    "tarif_orang": "Rp 15.000 - Rp 20.000 / orang",
                    "tarif_mobil": "Rp 135.000 - Rp 170.000 / mobil",
                    "jadwal": "Setiap 1-2 jam mulai pukul 07.00 - 20.00 WIB"
                },
                {
                    "rute": "Pelabuhan Balige - Pelabuhan Onan Runggu (Samosir Selatan)",
                    "kapal": "KMP Kaldera Toba (Jalur alternatif dari Toba)",
                    "durasi": "sekitar 60 menit penyeberangan",
                    "tarif_orang": "Rp 20.000 / orang",
                    "tarif_mobil": "Rp 150.000 / mobil",
                    "jadwal": "Jadwal harian terjadwal pagi & siang"
                }
            ],
            "opsi_jalur_darat": "Bisa juga lewat jalur darat via Jembatan Tano Ponggol (Pangururan) tanpa naik kapal."
        }
    elif kec_lower in ["balige", "ajibata", "parapat", "muara"]:
        ferry_info = {
            "rekomendasi_jalur": f"Dekat dengan {closest_ferry_hub['nama'] if closest_ferry_hub else 'Pelabuhan Danau'}",
            "dermaga_pilihan": [
                {
                    "rute": f"{closest_ferry_hub['nama'] if closest_ferry_hub else 'Dermaga Lokal'} - Pulau Samosir",
                    "kapal": "Kapal Feri KMP & Speedboat Wisata Danau Toba",
                    "durasi": "sekitar 30 - 50 menit penyeberangan",
                    "tarif_orang": "Rp 15.000 - Rp 25.000 / orang",
                    "jadwal": "Berangkat reguler setiap jam pagi s/d sore"
                }
            ],
            "opsi_jalur_darat": "Akses darat langsung via Jalan Lintas Sumatera."
        }

    # 5. Opsi Kendaraan Pribadi & Rental
    private_rental = {
        "sewa_motor": {
            "tersedia": True,
            "estimasi_tarif": "Rp 70.000 - Rp 100.000 / 24 jam",
            "rekomendasi": "Sangat ideal untuk pelancong solo/pasangan yang ingin fleksibel menjelajah spot tersembunyi."
        },
        "sewa_mobil": {
            "tersedia": True,
            "estimasi_tarif": "Rp 450.000 - Rp 650.000 / hari (Mobil + Sopir lokal)",
            "rekomendasi": "Pilihan ternyaman untuk keluarga atau rombongan dari Bandara Silangit / Medan."
        },
        "kondisi_akses": kondisi_jalan,
        "fasilitas_parkir": parkir_info
    }

    # 6. Akses Bandara Silangit Terstruktur
    airport_access = {
        "bandara": "Bandara Internasional Raja Sisingamangaraja XII (Silangit / DTB)",
        "jarak_km": est_road_km_silangit,
        "estimasi_durasi": dur_silangit_str,
        "rute_utama": f"Via Jl. Lintas Sumatera / Jl. Balige - Tarutung menuju {kec}",
        "pilihan_moda": [
            "Taksi Resmi Bandara Silangit (Tarif argo / flat ke Balige/Parapat)",
            "Shuttle Bus DAMRI Bandara (Rute Silangit - Balige - Parapat)",
            "Rental Mobil Bandara (Langsung pick-up di gerbang kedatangan)"
        ]
    }

    # 7. Ringkasan Tips Navigasi
    driver_tips = [
        f"Gunakan Google Maps dengan titik tujuan '{nama}, {kec}' untuk rute GPS presisi.",
        "Kondisi sinyal seluler 4G/5G Telkomsel dan Indosat stabil di sepanjang jalur utama.",
        "Bila berkendara di malam hari, perhatikan rambu tikungan jalan perbukitan dan kabut tipis kaldera."
    ]

    return {
        "jarak_bandara_km": est_road_km_silangit,
        "durasi_bandara": dur_silangit_str,
        "bandara_access": airport_access,
        "angkutan_umum": public_transit,
        "kapal_feri": ferry_info,
        "kendaraan_pribadi": private_rental,
        "tips_navigasi": driver_tips,
        "quick_summary": f"{dur_silangit_str} dari Bandara Silangit ({est_road_km_silangit} km) - {public_transit['nama_moda'].split('&')[0].strip()}"
    }
