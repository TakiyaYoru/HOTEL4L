import React, { createContext, useState, useEffect, useContext } from 'react';
import { services } from '../services';
import { STORAGE_KEYS, USER_ROLES } from '../services/constants';

// Tạo Context
export const AuthContext = createContext();

// Hook tùy chỉnh để sử dụng AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Provider Component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState(null);

  useEffect(() => {
    // Kiểm tra nếu có token trong localStorage
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Đăng nhập
  const login = async (username, password) => {
    try {
      // Gọi API đăng nhập
      const response = await services.api.auth.loginUser({
        username,
        password,
        status: true
        // Không gửi roleName để API sử dụng role thực tế của tài khoản
      });
      
      console.log('Login successful, response:', response);
      
      // Lưu token vào localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      
      // Tạo đối tượng user từ response
      const user = {
        username: response.username,
        role: response.roleName,
        name: response.name || response.username, // Sử dụng name từ response nếu có, nếu không thì dùng username
        id: response.customerID || response.employeeID || response.username // Lưu ID của user để sử dụng trong API
      };
      
      console.log('User object created:', user);
      
      // Cập nhật state và localStorage
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(services.utils.api.handleApiError(error));
    }
  };

  // Đăng ký
  const register = async (userData) => {
    try {
      // Đảm bảo dữ liệu đăng ký đúng định dạng
      const registerData = {
        username: userData.username,
        password: userData.password,
        roleName: USER_ROLES.CUSTOMER, // Mặc định là customer
        name: userData.name || userData.username,
        dob: userData.dob || "2004-01-01", // Giá trị mặc định nếu không có
        phone: userData.phone || "012-0123-01234", // Giá trị mặc định nếu không có
        email: userData.email
      };
      
      console.log('Prepared register data:', registerData);
      
      // Gọi API đăng ký
      const authResponse = await services.api.auth.registerUser(registerData);
      console.log('Auth registration successful:', authResponse);
      
      // Đăng nhập sau khi đăng ký thành công
      const user = await login(registerData.username, registerData.password);
      
      // Tạo bản ghi khách hàng mới
      try {
        const customerData = {
          customerID: user.username, // Sử dụng username làm customerID
          username: user.username,
          name: registerData.name,
          gender: userData.gender || 'Unknown',
          email: registerData.email,
          dob: registerData.dob,
          phone: registerData.phone,
          address: userData.address || '',
          idCard: userData.idCard || ''
        };
        
        console.log('Creating customer record:', customerData);
        const customerResponse = await services.api.customer.createCustomer(customerData);
        console.log('Customer creation successful:', customerResponse);
      } catch (customerError) {
        // Nếu tạo khách hàng thất bại, vẫn cho phép đăng nhập nhưng ghi log lỗi
        console.error('Failed to create customer record:', customerError);
      }
      
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(services.utils.api.handleApiError(error));
    }
  };

  // Đăng xuất
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  };

  // Mở modal đăng nhập
  const openLoginModal = (redirectPath = null) => {
    setLoginModalOpen(true);
    if (redirectPath) {
      setLoginRedirectPath(redirectPath);
    }
  };

  // Đóng modal đăng nhập
  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setLoginRedirectPath(null);
  };

  // Kiểm tra vai trò người dùng
  const hasRole = (roles) => {
    if (!currentUser) return false;
    if (typeof roles === 'string') {
      return currentUser.role === roles;
    }
    return roles.includes(currentUser.role);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    loginModalOpen,
    loginRedirectPath,
    openLoginModal,
    closeLoginModal,
    hasRole,
    isAdmin: currentUser?.role === USER_ROLES.MANAGER,
    isEmployee: currentUser?.role === USER_ROLES.EMPLOYEE,
    isCustomer: currentUser?.role === USER_ROLES.CUSTOMER
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
