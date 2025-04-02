import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthStyles.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const user = await login(username, password);
      
      // Chuyển hướng dựa trên vai trò người dùng
      if (user.role === 'manager') {
        navigate('/admin');
      } else if (user.role === 'employee') {
        navigate('/employee');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Hiển thị gợi ý tài khoản demo
  const demoAccounts = [
    { username: 'takiya2', password: '111111', role: 'Manager (Admin)' },
    { username: 'TakiyaYoru99', password: '123456', role: 'Employee' },
    { username: 'customer1', password: '111111', role: 'Customer' }
  ];

  const setDemoAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đăng nhập</h1>
          <p>Đăng nhập để truy cập tài khoản của bạn</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            <div className="icon"><FaUser /></div>
          </div>

          <div className="form-field">
            <label>Mật khẩu</label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-link">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <div className="auth-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>

        {/* Demo accounts */}
        <div className="demo-accounts">
          <h4>Tài khoản demo:</h4>
          <div className="demo-account-list">
            {demoAccounts.map((account, index) => (
              <div key={index} className="demo-account-item">
                <div>
                  <strong>{account.role}:</strong> {account.username} / {account.password}
                </div>
                <button 
                  onClick={() => setDemoAccount(account)}
                  className="demo-account-button"
                >
                  Sử dụng
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
