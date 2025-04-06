import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-column">
          <h2 className="footer-logo">HOTEL 4L</h2>
          <p>Trải nghiệm sự sang trọng và thoải mái tuyệt đối tại khách sạn cao cấp của chúng tôi. Chúng tôi luôn nỗ lực mang đến dịch vụ xuất sắc và những trải nghiệm không thể quên.</p>
          <div className="social-links">
            <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Liên Kết Nhanh</h3>
          <Link to="/" className="footer-link">Trang Chủ</Link>
          <Link to="/rooms" className="footer-link">Phòng & Dịch Vụ</Link>
          <Link to="/services" className="footer-link">Dịch Vụ</Link>
          <Link to="/booking" className="footer-link">Đặt Phòng Ngay</Link>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Dịch Vụ Của Chúng Tôi</h3>
          <Link to="/services" className="footer-link">Nhà Hàng & Quầy Bar</Link>
          <Link to="/services" className="footer-link">Spa & Sức Khỏe</Link>
          <Link to="/services" className="footer-link">Phòng Hội Nghị</Link>
          <Link to="/services" className="footer-link">Hồ Bơi</Link>
          <Link to="/services" className="footer-link">Trung Tâm Thể Dục</Link>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Liên Hệ Với Chúng Tôi</h3>
          <div className="contact-item">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <div>123 Đại Lộ Sang Trọng, Trung Tâm Thành Phố, Việt Nam</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <FaPhone />
            </div>
            <div>+84 123 456 789</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <div>info@khachsanluxury.com</div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="copyright">
          © {new Date().getFullYear()} Khách Sạn Luxury. Mọi Quyền Được Bảo Lưu.
        </div>
      </div>
    </footer>
  );
}

export default Footer;