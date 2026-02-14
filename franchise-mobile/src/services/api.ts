import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: attach auth token ────────────────────
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ── Response Interceptor: handle common errors ────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored session
      await AsyncStorage.multiRemove(['user', 'token']);
      // The AuthContext will pick this up and redirect to login
    }
    return Promise.reject(error);
  },
);

// ── Auth Service ──────────────────────────────────────────────
export const authService = {
  signup: (data: any) => api.post('/auth/franchise/signup', data),
  login: (idToken: string) => api.post('/auth/franchise/login', {idToken}),
};

// ── Franchise Service ─────────────────────────────────────────
export const franchiseService = {
  getDashboard: () => api.get('/franchise/dashboard'),
  getLeads: () => api.get('/franchise/leads'),
  getLead: (id: string) => api.get(`/franchise/leads/${id}`),
  createLead: (data: any) => api.post('/franchise/leads', data),
  getCommissions: () => api.get('/franchise/commissions'),
};

export default api;
