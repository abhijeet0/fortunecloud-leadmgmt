import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  adminLogin: (idToken: string): Promise<AxiosResponse<any>> =>
    api.post('/auth/admin/login', { idToken }),
};

export const adminAPI = {
  getLeads: (params: any): Promise<AxiosResponse<any>> => api.get('/admin/leads', { params }),
  getLeadDetails: (leadId: string): Promise<AxiosResponse<any>> =>
    api.get(`/admin/leads/${leadId}`),
  updateLeadStatus: (leadId: string, data: any): Promise<AxiosResponse<any>> =>
    api.put(`/admin/leads/${leadId}/status`, data),
  createEnrollment: (data: any): Promise<AxiosResponse<any>> =>
    api.post('/admin/enrollments', data),
  getDashboard: (): Promise<AxiosResponse<any>> => api.get('/admin/dashboard'),
  getReports: {
    leadsByStatus: (): Promise<AxiosResponse<any>> =>
      api.get('/admin/reports/leads-by-status'),
    leadsByFranchise: (): Promise<AxiosResponse<any>> =>
      api.get('/admin/reports/leads-by-franchise'),
    commissionSummary: (): Promise<AxiosResponse<any>> =>
      api.get('/admin/reports/commission-summary'),
  },
};

export const commissionAPI = {
  getCommissions: (params: any): Promise<AxiosResponse<any>> =>
    api.get('/commission', { params }),
  updateStatus: (commissionId: string, data: any): Promise<AxiosResponse<any>> =>
    api.put(`/commission/${commissionId}/status`, data),
  getSummary: (): Promise<AxiosResponse<any>> => api.get('/commission/summary'),
  getByFranchise: (franchiseId: string, params: any): Promise<AxiosResponse<any>> =>
    api.get(`/commission/franchise/${franchiseId}`, { params }),
};

export default api;
