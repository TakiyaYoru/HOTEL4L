import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';

// Đăng nhập
export const loginUser = async (credentials) => {
  try {
    console.log('Login credentials:', credentials);
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      username: credentials.username,
      password: credentials.password,
      status: true
    });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Đăng ký
export const registerUser = async (userData) => {
  try {
    // Đảm bảo dữ liệu đúng định dạng
    const registerData = {
      username: userData.username,
      password: userData.password,
      roleName: "customer",
      name: userData.name || userData.username,
      dob: userData.dob || "2004-01-01",
      phone: userData.phone || "012-0123-01234",
      email: userData.email || `${userData.username}@example.com`
    };
    
    console.log('Register data:', registerData);
    
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, registerData);
    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTH.CURRENT_USER);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Đăng xuất
export const logoutUser = () => {
  localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
  localStorage.removeItem(import.meta.env.VITE_USER_DATA_KEY);
};

// Quên mật khẩu
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Thay đổi mật khẩu
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Xác thực token
export const verifyToken = async (token) => {
  try {
    const response = await api.post('/auth/verify-token', { token });
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

// Làm mới token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
