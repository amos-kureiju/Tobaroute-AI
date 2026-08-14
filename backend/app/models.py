# ====================================================================================================
# FILE: backend/app/models.py
# TUJUAN:
# Mendefinisikan struktur tabel database relasional PostgreSQL menggunakan SQLAlchemy ORM.
# Tabel `destinasi` menyimpan seluruh data entitas pariwisata, kuliner lokal, dan UMKM di Danau Toba.
# ====================================================================================================

from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base

class Destinasi(Base):
    """
    Model Tabel Destinasi & UMKM di PostgreSQL:
    - id: Primary Key unik tiap entitas
    - nama: Nama tempat / UMKM (misal: 'Pantai Lumban Bulbul', 'Batikta & Sentra Tenun Ulos')
    - kategori: Klasifikasi ('wisata', 'kuliner', 'umkm', 'penginapan', 'transportasi')
    - kecamatan: Wilayah administrasi di kawasan Danau Toba (misal: 'Balige', 'Laguboti')
    - gambar_url: URL foto resolusi tinggi untuk kartu antarmuka
    - deskripsi_singkat: Ringkasan daya tarik utama tempat
    - deskripsi_lengkap: Rincian fasilitas, jam operasional, harga tiket, ulasan, atau wawasan budaya
    - nama_jalan: Alamat jalan presisi hasil kalibrasi Google Maps
    - latitude & longitude: Titik koordinat GPS darat akurat
    - rating: Nilai ulasan (skala 1.0 - 5.0)
    - jumlah_ulasan: Total review untuk mendeteksi hidden gems dan keadilan UMKM
    """
    __tablename__ = "destinasi"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True, nullable=False)
    kategori = Column(String, index=True, nullable=False)
    kecamatan = Column(String, index=True, nullable=False)
    gambar_url = Column(String, nullable=True)
    deskripsi_singkat = Column(Text, nullable=False)
    deskripsi_lengkap = Column(Text, nullable=True)
    nama_jalan = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, default=0.0)
    jumlah_ulasan = Column(Integer, default=0)