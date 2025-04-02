import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaTimes, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './LoginModal.css';

function LoginModal() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true); // true: hiển thị đăng nhập, false: hiển thị đăng ký
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register, closeLoginModal, loginRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await login(username, password);
      closeLoginModal();
      if (loginRedirectPath) {
        navigate(loginRedirectPath);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register({ email, password, username });
      closeLoginModal();
      if (loginRedirectPath) {
        navigate(loginRedirectPath);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setError('');
  };

  // Hàm xử lý khi click vào overlay
  const handleOverlayClick = (e) => {
    // Chỉ đóng modal khi click trực tiếp vào overlay, không phải vào nội dung bên trong
    if (e.target === e.currentTarget) {
      closeLoginModal();
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <button className="close-button" onClick={closeLoginModal}>
          <FaTimes />
        </button>

        <div className="auth-header">
          <h1>{showLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>
          <p>{showLogin ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
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
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
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
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <div className="icon"><FaEnvelope /></div>
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

            <div className="form-field">
              <label>Xác nhận mật khẩu</label>
              <div className="password-input-container">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
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
        )}

        <div className="auth-link">
          {showLogin ? (
            <p>Chưa có tài khoản? <button onClick={toggleForm}>Đăng ký</button></p>
          ) : (
            <p>Đã có tài khoản? <button onClick={toggleForm}>Đăng nhập</button></p>
          )}
        </div>

        <div className="auth-link">
          <Link to="/login" onClick={closeLoginModal}>
            {showLogin ? 'Quên mật khẩu?' : 'Đăng nhập với tài khoản khác'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
