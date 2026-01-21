import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('franchiseToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('franchiseToken');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  franchiseSignup: (data: any): Promise<AxiosResponse<any>> =>
    api.post('/auth/franchise/signup', data),
  franchiseLogin: (idToken: string): Promise<AxiosResponse<any>> =>
    api.post('/auth/franchise/login', { idToken }),
};

export const notificationAPI = {
  registerDeviceToken: (deviceToken: string, deviceName: string): Promise<AxiosResponse<any>> =>
    api.post('/notifications/franchise/device-token', { deviceToken, deviceName }),
};

export const franchiseAPI = {
  createLead: (data: any): Promise<AxiosResponse<any>> => api.post('/franchise/leads', data),
  getLeads: (params?: any): Promise<AxiosResponse<any>> =>
    api.get('/franchise/leads', { params }),
  getLead: (leadId: string): Promise<AxiosResponse<any>> =>
    api.get(`/franchise/leads/${leadId}`),
  getDashboard: (): Promise<AxiosResponse<any>> => api.get('/franchise/dashboard'),
  getCommissions: (): Promise<AxiosResponse<any>> => api.get('/franchise/commissions'),
};

export default api;
