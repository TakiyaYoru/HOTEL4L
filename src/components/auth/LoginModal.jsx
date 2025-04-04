import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaTimes, FaEnvelope, FaEye, FaEyeSlash, FaPhone, FaIdCard, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { services } from '../../services';
import './LoginModal.css';

function LoginModal() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Unknown');
  const [address, setAddress] = useState('');
  const [idCard, setIdCard] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true); // true: hiển thị đăng nhập, false: hiển thị đăng ký
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1: Thông tin cơ bản, 2: Thông tin chi tiết

  const { login, register, closeLoginModal, loginRedirectPath } = useAuth();
  const navigate = useNavigate();

  const validateLoginForm = () => {
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return false;
    }

    if (!services.utils.validation.validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    return true;
  };

  const validateRegisterStep1 = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return false;
    }

    if (!services.utils.validation.validateEmail(email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!services.utils.validation.validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return false;
    }

    return true;
  };

  const validateRegisterStep2 = () => {
    if (!name) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    if (phone && !services.utils.validation.validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ (định dạng: XXX-XXXX-XXXXX)');
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

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

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateRegisterStep1()) {
      setError('');
      setRegisterStep(2);
    }
  };

  const handlePrevStep = () => {
    setRegisterStep(1);
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterStep2()) return;
    
    try {
      setError('');
      setLoading(true);
      
      // Chuẩn bị dữ liệu đăng ký
      const userData = {
        username,
        email,
        password,
        name,
        phone: phone || '012-0123-01234', // Giá trị mặc định nếu không có
        dob: dob || '2004-01-01', // Giá trị mặc định nếu không có
        gender,
        address,
        idCard
      };
      
      await register(userData);
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
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setDob('');
    setGender('Unknown');
    setAddress('');
    setIdCard('');
    setRegisterStep(1);
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
          <p>{showLogin ? 'Đăng nhập để tiếp tục' : `Tạo tài khoản mới ${registerStep === 1 ? '(Bước 1/2)' : '(Bước 2/2)'}`}</p>
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
          registerStep === 1 ? (
            <form className="auth-form" onSubmit={handleNextStep}>
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

              <button type="submit" className="auth-button">
                Tiếp tục
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-field">
                <label>Họ tên</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
                <div className="icon"><FaUser /></div>
              </div>
              
              <div className="form-field">
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="XXX-XXXX-XXXXX"
                />
                <div className="icon"><FaPhone /></div>
              </div>

              <div className="form-field">
                <label>Ngày sinh</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                />
                <div className="icon"><FaCalendarAlt /></div>
              </div>

              <div className="form-field">
                <label>Giới tính</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Unknown">Không xác định</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
                <div className="icon"><FaVenusMars /></div>
              </div>

              <div className="form-field">
                <label>Địa chỉ</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
                <div className="icon"><FaMapMarkerAlt /></div>
              </div>

              <div className="form-field">
                <label>CMND/CCCD</label>
                <input 
                  type="text" 
                  value={idCard} 
                  onChange={(e) => setIdCard(e.target.value)} 
                />
                <div className="icon"><FaIdCard /></div>
              </div>

              <div className="form-buttons">
                <button type="button" className="auth-button secondary" onClick={handlePrevStep}>
                  Quay lại
                </button>
                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
              </div>
            </form>
          )
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
