import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

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
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Đăng nhập
  const login = async (username, password) => {
    try {
      // Gọi API đăng nhập
      const response = await loginUser({
        username,
        password,
        status: true
        // Không gửi roleName để API sử dụng role thực tế của tài khoản
      });
      
      console.log('Login successful, response:', response);
      
      // Lưu token vào localStorage
      localStorage.setItem('authToken', response.token);
      
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
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  // Đăng ký
  const register = async (userData) => {
    try {
      // Đảm bảo dữ liệu đăng ký đúng định dạng
      const registerData = {
        username: userData.username,
        password: userData.password,
        roleName: "customer", // Mặc định là customer
        name: userData.name || userData.username,
        dob: userData.dob || "2004-01-01", // Giá trị mặc định nếu không có
        phone: userData.phone || "012-0123-01234", // Giá trị mặc định nếu không có
        email: userData.email
      };
      
      console.log('Prepared register data:', registerData);
      
      // Gọi API đăng ký
      await registerUser(registerData);
      
      // Đăng nhập sau khi đăng ký thành công
      return await login(registerData.username, registerData.password);
    } catch (error) {
      console.error('Register error:', error);
      if (error.response && error.response.status === 409) {
        throw new Error('Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.');
      } else if (error.response && error.response.data) {
        throw new Error(`Đăng ký không thành công: ${error.response.data}`);
      } else {
        throw new Error('Đăng ký không thành công. Vui lòng thử lại.');
      }
    }
  };

  // Đăng xuất
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
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
    isAdmin: currentUser?.role === 'manager', // manager là admin
    isEmployee: currentUser?.role === 'employee',
    isCustomer: currentUser?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
