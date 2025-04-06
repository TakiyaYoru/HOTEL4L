import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaBars, FaTimes, FaHotel, FaBookmark, FaCog } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };
  
  return (
    <header className={`header-container ${isHomePage && !scrolled ? 'header-transparent' : 'header-solid'} ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <Link to="/" className="logo">HOTEL 4L</Link>
        
        <div className="menu-toggle" onClick={() => setMobileMenuOpen(true)}>
          <FaBars />
        </div>
        
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="close-button" onClick={() => setMobileMenuOpen(false)}>
            <FaTimes />
          </div>
          
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Trang Chủ
          </Link>
          <Link to="/rooms" className={`nav-link ${location.pathname.includes('/rooms') ? 'active' : ''}`}>
            Phòng
          </Link>
          <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>
            Dịch Vụ
          </Link>
          
          {!isAdmin && (
            <>
              <Link to="/favorites" className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}>
                Yêu Thích
              </Link> 
              
              <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                Đặt Phòng Của Tôi
              </Link>
            </>
          )}
          
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <FaHotel className="nav-icon" /> Bảng Điều Khiển Quản Trị
            </Link>
          )}
          
          {currentUser ? (
            <div className="user-menu">
              <div className="user-icon" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <FaUser />
                <span className="user-name">{currentUser?.name || 'Người Dùng'}</span>
              </div>
              
              <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                <Link to="/profile" className="dropdown-item">
                  <FaUser className="dropdown-icon" /> Hồ Sơ Của Tôi
                </Link>
                
                {isAdmin ? (
                  <Link to="/admin" className="dropdown-item">
                    <FaHotel className="dropdown-icon" /> Quản Lý Khách Sạn
                  </Link>
                ) : (
                  <Link to="/my-bookings" className="dropdown-item">
                    <FaBookmark className="dropdown-icon" /> Đặt Phòng Của Tôi
                  </Link>
                )}
                
                <button className="logout-button" onClick={handleLogout}>
                  <FaTimes className="dropdown-icon" /> Đăng Xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">
                Đăng Nhập
              </Link>
              <Link to="/register" className="auth-button register">
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;