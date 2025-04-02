import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-column">
          <h2 className="footer-logo">4L Luxury Hotel</h2>
          <p>Experience unparalleled luxury and comfort at our premium hotel. We strive to provide exceptional service and unforgettable experiences.</p>
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
          <h3 className="footer-title">Quick Links</h3>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/rooms" className="footer-link">Rooms & Suites</Link>
          <Link to="/services" className="footer-link">Services</Link>
          <Link to="/booking" className="footer-link">Book Now</Link>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Our Services</h3>
          <Link to="/services" className="footer-link">Restaurant & Bar</Link>
          <Link to="/services" className="footer-link">Spa & Wellness</Link>
          <Link to="/services" className="footer-link">Conference Rooms</Link>
          <Link to="/services" className="footer-link">Swimming Pool</Link>
          <Link to="/services" className="footer-link">Fitness Center</Link>
        </div>
        
        <div className="footer-column">
          <h3 className="footer-title">Contact Us</h3>
          <div className="contact-item">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <div>123 Luxury Avenue, City Center, Country</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <FaPhone />
            </div>
            <div>+1 234 567 8900</div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <div>info@luxuryhotel.com</div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="copyright">
          &copy; {new Date().getFullYear()} Luxury Hotel. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
