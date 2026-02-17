import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { authEventEmitter } from './authEvents';
import type {
  LoginResponse,
  SignupResponse,
  LeadsListResponse,
  LeadDetailResponse,
  DashboardResponse,
  CommissionsResponse,
  NotificationsResponse,
  LeadCreatePayload,
  LeadsQueryParams,
} from '../types';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── In-memory token cache ─────────────────────────────────────
// Avoids race condition where AsyncStorage read is async and may
// miss a freshly-stored token on the very first request after login.
let cachedToken: string | null = null;

export function setAuthToken(token: string | null) {
  cachedToken = token;
}

// ── Request Interceptor: attach auth token ────────────────────
api.interceptors.request.use(
  async config => {
    // Prefer in-memory cache (instant), fall back to AsyncStorage
    const token = cachedToken || (await AsyncStorage.getItem('token'));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ── Response Interceptor: handle 401 ──────────────────────────
let isLoggingOut = false;
api.interceptors.response.use(
  response => response,
  async error => {
    const url = error.config?.url || '';
    // Don't trigger logout for auth endpoints (login/signup/otp)
    const isAuthEndpoint = url.includes('/auth/');

    if (error.response?.status === 401 && !isLoggingOut && !isAuthEndpoint) {
      isLoggingOut = true;
      cachedToken = null;
      await AsyncStorage.multiRemove(['user', 'token']);
      authEventEmitter.emit('unauthorized');
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
    }
    return Promise.reject(error);
  },
);

// ── Auth Service ──────────────────────────────────────────────
export const authService = {
  // Firebase auth (production)
  signup: (data: {
    franchiseName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    password?: string;
    idToken?: string;
  }) => api.post<SignupResponse>('/auth/franchise/signup', data),

  login: (idToken: string) =>
    api.post<LoginResponse>('/auth/franchise/login', { idToken }),
};

// ── Franchise Service ─────────────────────────────────────────
export const franchiseService = {
  getDashboard: () => api.get<DashboardResponse>('/franchise/dashboard'),

  getLeads: (params?: LeadsQueryParams) =>
    api.get<LeadsListResponse>('/franchise/leads', { params }),

  getLead: (id: string) =>
    api.get<LeadDetailResponse>(`/franchise/leads/${id}`),

  createLead: (data: LeadCreatePayload) => api.post('/franchise/leads', data),

  getCommissions: () => api.get<CommissionsResponse>('/franchise/commissions'),

  getNotifications: (params?: {page?: number; limit?: number}) =>
    api.get<NotificationsResponse>('/franchise/notifications', {params}),

  markNotificationRead: (notificationId: string) =>
    api.put(`/franchise/notifications/${notificationId}/read`),

  markAllNotificationsRead: () => api.put('/franchise/notifications/read-all'),
};

// ── Notification Service ──────────────────────────────────────
export const notificationService = {
  registerDeviceToken: (deviceToken: string, deviceName: string) =>
    api.post('/notifications/franchise/device-token', {
      deviceToken,
      deviceName,
    }),
};

export default api;
