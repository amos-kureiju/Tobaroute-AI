// ====================================================================================================
// FILE: frontend/src/services/api.js
// TUJUAN:
// Modul sentral HTTP Client berbasis Axios untuk berkomunikasi dengan server backend FastAPI.
// Menyediakan fungsi siap pakai untuk mengambil rekomendasi rute adil (RAG), daftar destinasi,
// obrolan chatbot AI, manajemen CRUD admin, sinkronisasi vektor Pinecone, dan metrik sistem.
// ====================================================================================================

import axios from 'axios';

// URL dasar API backend FastAPI (Mendukung port 8080 dan 8000 secara dinamis)
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Inisialisasi instance Axios dengan timeout 90 detik (agar RAG + Gemini punya waktu pemrosesan yang cukup)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Fallback Cerdas: Jika koneksi ke port 8080 gagal (Network Error murni), otomatis coba port 8000 (atau sebaliknya)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Jangan retry jika timeout (ECONNABORTED) agar tidak memicu delay ganda
    if (config && !config.__isRetry && error.code === 'ERR_NETWORK') {
      config.__isRetry = true;
      const currentUrl = config.baseURL || API_BASE_URL;
      const altUrl = currentUrl.includes('8080')
        ? currentUrl.replace('8080', '8000')
        : currentUrl.replace('8000', '8080');
      
      config.baseURL = altUrl;
      try {
        return await axios(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    return Promise.reject(error);
  }
);

// ====================================================================================================
// FUNGSI: getFairRecommendation
// TUJUAN:
// Memanggil endpoint RAG backend `/api/route/fair-recommendation` untuk mendapatkan:
// 1. Destinasi Utama yang paling sesuai dengan query wisatawan.
// 2. Rekomendasi UMKM/Kuliner lokal di sekitarnya (Fairness exposure).
// 3. Narasi kurasi perjalanan dari model Gemini AI.
// ====================================================================================================
export const getFairRecommendation = async (query, kecamatan = '', offset = 0, userLat = null, userLon = null) => {
  try {
    const params = { query, offset };
    if (kecamatan) {
      params.kecamatan = kecamatan;
    }
    if (userLat !== null && userLon !== null) {
      params.user_lat = userLat;
      params.user_lon = userLon;
    }
    const response = await apiClient.get('/route/fair-recommendation', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching fair recommendation:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI: getDestinations
// TUJUAN: Mengambil daftar seluruh POI destinasi wisata & UMKM dari database.
// ====================================================================================================
export const getDestinations = async (kecamatan = '', limit = 1000) => {
  try {
    const params = { limit };
    if (kecamatan) {
      params.kecamatan = kecamatan;
    }
    const response = await apiClient.get('/destinasi', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI: sendChatMessage
// TUJUAN: Mengirim pesan pengguna ke chatbot AI pemandu wisata dan menerima respons Markdown.
// ====================================================================================================
export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await apiClient.post('/chat', { message, history });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI ADMIN: addDestinasi
// TUJUAN: Menambahkan destinasi/UMKM baru ke database melalui portal admin.
// ====================================================================================================
export const addDestinasi = async (destinasiData) => {
  try {
    const response = await apiClient.post('/admin/destinasi', destinasiData);
    return response.data;
  } catch (error) {
    console.error('Error adding destination:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI ADMIN: deleteDestinasi
// TUJUAN: Menghapus data destinasi dari database dan index vektor Pinecone.
// ====================================================================================================
export const deleteDestinasi = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/destinasi/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI ADMIN: updateDestinasi
// TUJUAN: Memperbarui data destinasi yang sudah ada di database.
// ====================================================================================================
export const updateDestinasi = async (id, destinasiData) => {
  try {
    const response = await apiClient.put(`/admin/destinasi/${id}`, destinasiData);
    return response.data;
  } catch (error) {
    console.error('Error updating destination:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI ADMIN: syncPineconeVectors
// TUJUAN: Memicu sinkronisasi manual seluruh data dari PostgreSQL ke database vektor Pinecone.
// ====================================================================================================
export const syncPineconeVectors = async () => {
  try {
    const response = await apiClient.post('/admin/sync-pinecone');
    return response.data;
  } catch (error) {
    console.error('Error syncing Pinecone vectors:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI: getDestinationAIInsight
// TUJUAN: Mengambil wawasan budaya, tips wisatawan, dan keunikan produk secara real-time dari Gemini AI.
// ====================================================================================================
export const getDestinationAIInsight = async (destinasiId) => {
  try {
    const response = await apiClient.get(`/destinasi/${destinasiId}/ai-insights`);
    return response.data;
  } catch (error) {
    console.error('Error fetching destination AI insight:', error);
    throw error;
  }
};

// ====================================================================================================
// FUNGSI ADMIN: getSystemMetrics
// TUJUAN: Mengambil data statistik komprehensif untuk ditampilkan di widget dashboard admin.
// ====================================================================================================
export const getSystemMetrics = async () => {
  try {
    const response = await apiClient.get('/admin/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};
