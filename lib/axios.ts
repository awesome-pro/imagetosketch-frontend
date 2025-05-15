import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`

// Create axios instance with default config
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// Process the queue of failed requests
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(request.config);
    }
  });
  
  failedQueue = [];
};

// Handle token refresh
const refreshAuthToken = async () => {
  try {
    // Call the session refresh API endpoint
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    return data.isSignedIn;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then(config => api(config as AxiosRequestConfig))
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshed = await refreshAuthToken();
        
        if (refreshed) {
          processQueue(null);
          setTimeout(() => {
            return Promise.resolve()
          }, 1000);
        } else {
          processQueue(error);
          window.location.href = '/auth/sign-in';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(error);
        window.location.href = '/auth/sign-in';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error.response?.data);
  }
);

export default api;