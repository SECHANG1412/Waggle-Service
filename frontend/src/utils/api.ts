import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { AUTH_MESSAGES } from '../constants/messages';
import type { UserRead } from '../types';
import { showLoginRequiredAlert } from './alertUtils';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    suppressAuthAlert?: boolean;
    _retry?: boolean;
  }
}

type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  suppressAuthAlert?: boolean;
  _retry?: boolean;
};

type RefreshQueueItem = {
  resolve: (value: boolean | null) => void;
  reject: (reason?: unknown) => void;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

let isRefreshing = false;
let refreshQueue: RefreshQueueItem[] = [];

const processQueue = (error: unknown, tokenRefreshed: boolean | null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(tokenRefreshed);
    }
  });
  refreshQueue = [];
};

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set('X-CSRF-Token', csrfToken);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AuthRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes('/users/refresh');
    const shouldSkipAuthRefresh = originalRequest?.skipAuthRefresh;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isRefreshRequest &&
      !shouldSkipAuthRefresh &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post<UserRead>('/users/refresh');
        processQueue(null, true);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (!originalRequest?.suppressAuthAlert) {
          await showLoginRequiredAlert(AUTH_MESSAGES.sessionExpired);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
