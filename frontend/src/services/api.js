import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFairRecommendation = async (query, kecamatan = '') => {
  try {
    const params = { query };
    if (kecamatan) {
      params.kecamatan = kecamatan;
    }
    const response = await apiClient.get('/route/fair-recommendation', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching fair recommendation:', error);
    throw error;
  }
};

export const getDestinations = async (kecamatan = '', limit = 10) => {
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

export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await apiClient.post('/chat', { message, history });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const addDestinasi = async (destinasiData) => {
  try {
    const response = await apiClient.post('/admin/destinasi', destinasiData);
    return response.data;
  } catch (error) {
    console.error('Error adding destination:', error);
    throw error;
  }
};

export const deleteDestinasi = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/destinasi/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
};

export const updateDestinasi = async (id, destinasiData) => {
  try {
    const response = await apiClient.put(`/admin/destinasi/${id}`, destinasiData);
    return response.data;
  } catch (error) {
    console.error('Error updating destination:', error);
    throw error;
  }
};

export const syncPineconeVectors = async () => {
  try {
    const response = await apiClient.post('/admin/sync-pinecone');
    return response.data;
  } catch (error) {
    console.error('Error syncing Pinecone vectors:', error);
    throw error;
  }
};

