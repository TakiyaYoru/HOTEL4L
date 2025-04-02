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
        <Link to="/" className="logo">HOTEL4L</Link>
        
        <div className="menu-toggle" onClick={() => setMobileMenuOpen(true)}>
          <FaBars />
        </div>
        
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="close-button" onClick={() => setMobileMenuOpen(false)}>
            <FaTimes />
          </div>
          
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/rooms" className={`nav-link ${location.pathname.includes('/rooms') ? 'active' : ''}`}>
            Rooms
          </Link>
          <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>
            Services
          </Link>
          
          {!isAdmin && (
            <>
              <Link to="/favorites" className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}>
                Favorites
              </Link> 
              
              <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                My Bookings
              </Link>
            </>
          )}
          
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <FaHotel className="nav-icon" /> Admin Dashboard
            </Link>
          )}
          
          {currentUser ? (
            <div className="user-menu">
              <div className="user-icon" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <FaUser />
                <span className="user-name">{currentUser?.name || 'User'}</span>
              </div>
              
              <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                <Link to="/profile" className="dropdown-item">
                  <FaUser className="dropdown-icon" /> My Profile
                </Link>
                
                {isAdmin ? (
                  <Link to="/admin" className="dropdown-item">
                    <FaHotel className="dropdown-icon" /> Hotel Management
                  </Link>
                ) : (
                  <Link to="/my-bookings" className="dropdown-item">
                    <FaBookmark className="dropdown-icon" /> My Bookings
                  </Link>
                )}
                
                <button className="logout-button" onClick={handleLogout}>
                  <FaTimes className="dropdown-icon" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">
                Login
              </Link>
              <Link to="/register" className="auth-button register">
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
