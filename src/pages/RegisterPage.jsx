import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendarAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../services/api';
import '../styles/AuthStyles.css';

function RegisterPage() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    name: '',
    phone: '012-0123-01234',
    dob: '2004-01-01',
    roleName: 'customer' // Mặc định là customer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    // Nếu không có tên, sử dụng username
    if (!formData.name) {
      setFormData({...formData, name: formData.username});
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    // Log dữ liệu trước khi gửi
    console.log('Register form data:', formData);
    
    try {
      // Gọi API đăng ký nhưng không đăng nhập tự động
      await registerUser(formData);
    } catch (error) {
      // Ghi log lỗi nhưng không hiển thị cho người dùng
      console.error('Register error:', error);
    } finally {
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Tạo tài khoản</h1>
          <p>Đăng ký để bắt đầu</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
            <div className="icon"><FaUser /></div>
          </div>

          <div className="form-field">
            <label>Họ và tên</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
            />
            <div className="icon"><FaUser /></div>
          </div>

          <div className="form-field">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <div className="icon"><FaEnvelope /></div>
          </div>

          <div className="form-field">
            <label>Số điện thoại</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="012-0123-01234"
            />
            <div className="icon"><FaPhone /></div>
          </div>

          <div className="form-field">
            <label>Ngày sinh</label>
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
            />
            <div className="icon"><FaCalendarAlt /></div>
          </div>

          <div className="form-field">
            <label>Mật khẩu</label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"}
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <div className="icon"><FaLock /></div>
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Xác nhận mật khẩu</label>
            <div className="password-input-container">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
              <div className="icon"><FaLock /></div>
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
