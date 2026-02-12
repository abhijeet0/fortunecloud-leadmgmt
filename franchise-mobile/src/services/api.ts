import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5001/api'; // Use your local IP for physical device

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  signup: (data: any) => api.post('/auth/franchise/signup', data),
  login: (idToken: string) => api.post('/auth/franchise/login', { idToken }),
};

export const franchiseService = {
  getDashboard: () => api.get('/franchise/dashboard'),
  getLeads: () => api.get('/franchise/leads'),
  getLead: (id: string) => api.get(`/franchise/leads/${id}`),
  createLead: (data: any) => api.post('/franchise/leads', data),
  getCommissions: () => api.get('/franchise/commissions'),
};

export default api;
