import axios from 'axios';
import { API_STATUS_CODES, API_ERROR_MESSAGES, STORAGE_KEYS } from '../constants';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: '/api',  // Sử dụng proxy path thay vì URL đầy đủ
  timeout: import.meta.env.VITE_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Log API response nếu feature flag được bật
    if (import.meta.env.VITE_ENABLE_API_LOGGING) {
      console.log(`API Response [${response.config.method}] ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Log error nếu feature flag được bật
      if (import.meta.env.VITE_ENABLE_API_LOGGING) {
        console.error(`API Error [${error.config.method}] ${error.config.url}:`, error.response.data);
      }

      // Xử lý các mã lỗi HTTP cụ thể
      switch (error.response.status) {
        case API_STATUS_CODES.UNAUTHORIZED:
          // Unauthorized - Token hết hạn hoặc không hợp lệ
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          window.location.href = '/login';
          break;
        case API_STATUS_CODES.FORBIDDEN:
          console.error(API_ERROR_MESSAGES.FORBIDDEN);
          break;
        case API_STATUS_CODES.NOT_FOUND:
          console.error(API_ERROR_MESSAGES.NOT_FOUND);
          break;
        case API_STATUS_CODES.INTERNAL_SERVER_ERROR:
          console.error(API_ERROR_MESSAGES.SERVER_ERROR);
          break;
        default:
          console.error(API_ERROR_MESSAGES.NETWORK_ERROR);
      }
    } else if (error.request) {
      // Không nhận được response
      console.error('No response received:', error.request);
    } else {
      // Lỗi khi setup request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Utility function để xử lý API errors
export const handleApiError = (error) => {
  let errorMessage = API_ERROR_MESSAGES.SERVER_ERROR;

  if (error.response && error.response.data) {
    errorMessage = error.response.data.message || errorMessage;
  }

  return errorMessage;
};

export default axiosInstance;
