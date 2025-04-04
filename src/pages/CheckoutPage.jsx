import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaPrint, FaHome, FaList, FaCalendarAlt, FaUsers, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CheckoutPage.css';

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [booking, setBooking] = useState(() => {
    const stateData = location.state?.booking;
    return stateData || null;
  });

  useEffect(() => {
    if (!booking) {
      navigate('/rooms');
    }
  }, [booking, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!booking) {
    return <div className="container">Loading...</div>;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container">
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="success-header">
            <div className="success-icon">
              <FaCheck />
            </div>
            <h1 className="success-title">Booking Confirmed!</h1>
            <p className="success-message">
              Your booking has been successfully {booking.status === 'pending' ? 'created' : 'confirmed'}. A confirmation email has been sent to your email address.
            </p>
            <div className="booking-id">
              Booking ID: {booking.id}
            </div>
            <div className="booking-status">
              Status: <span className={`status-${booking.status}`}>{booking.status.toUpperCase()}</span>
            </div>
            {booking.checkInCode && booking.status === 'confirmed' && (
              <div className="checkin-code">
                <FaQrcode style={{ marginRight: '8px' }} />
                Check-in Code: <strong>{booking.checkInCode}</strong>
                <p>Please present this code at the reception when you check in.</p>
              </div>
            )}
          </div>

          <div className="confirmation-card">
            <div className="confirmation-header">
              <h2>Booking Details</h2>
            </div>

            <div className="confirmation-body">
              <div className="confirmation-section">
                <h3>Room Information</h3>
                <div className="room-details">
                  <div
                    className="room-image"
                    style={{ backgroundImage: `url(${booking.roomImage})` }}
                  />
                  <div className="room-info">
                    <h4>{booking.roomName}</h4>
                    <p>
                      {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                      <br />
                      {calculateNights()} nights, {booking.guests} guests
                    </p>
                  </div>
                </div>

                <div className="price-details">
                  <div className="price-item">
                    <span>Room Rate</span>
                    <span>${booking.price} x {calculateNights()} nights</span>
                  </div>
                  <div className="price-item">
                    <span>Room Total</span>
                    <span>${(booking.price * calculateNights()).toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Tax (10%)</span>
                    <span>${(booking.price * calculateNights() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="price-total">
                    <span>Total</span>
                    <span>${booking.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>Guest Information</h3>
                <div className="confirmation-grid">
                  <div className="confirmation-item">
                    <span className="confirmation-label">Name</span>
                    <span className="confirmation-value">{booking.primaryGuest.fullName}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Email</span>
                    <span className="confirmation-value">{booking.primaryGuest.email}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Phone</span>
                    <span className="confirmation-value">{booking.primaryGuest.phone}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Payment Method</span>
                    <span className="confirmation-value">{booking.paymentMethod}</span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="confirmation-item">
                    <span className="confirmation-label">Special Requests</span>
                    <span className="confirmation-value">{booking.specialRequests}</span>
                  </div>
                )}

                {booking.companions && booking.companions.length > 0 && (
                  <div className="confirmation-item">
                    <span className="confirmation-label">Companions</span>
                    <ul className="companions-list">
                      {booking.companions.map((companion, index) => (
                        <li key={index}>
                          {companion.fullName} (ID: {companion.idCard})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="confirmation-section">
                <h3>Check-in Information</h3>
                <div className="confirmation-grid">
                  <div className="confirmation-item">
                    <span className="confirmation-label">Check-in Date</span>
                    <span className="confirmation-value">{formatDate(booking.checkInDate)}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Check-in Time</span>
                    <span className="confirmation-value">After {booking.checkInTime}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Check-out Date</span>
                    <span className="confirmation-value">{formatDate(booking.checkOutDate)}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Check-out Time</span>
                    <span className="confirmation-value">Before {booking.checkOutTime}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>Booking Timeline</h3>
                <ul className="timeline">
                  {booking.timeline.map((event, index) => (
                    <li key={index} className="timeline-item">
                      <span className="timeline-icon">
                        {event.icon === 'FaCalendarAlt' ? <FaCalendarAlt /> : <FaCreditCard />}
                      </span>
                      <span className="timeline-date">{formatDate(event.date)}</span>
                      <span className="timeline-text">{event.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/" className="btn btn-secondary">
              <FaHome style={{ marginRight: '8px' }} />
              Return to Home
            </Link>
            <Link to="/my-bookings" className="btn btn-primary">
              <FaList style={{ marginRight: '8px' }} />
              View My Bookings
            </Link>
            <button className="btn btn-secondary print-button" onClick={handlePrint}>
              <FaPrint />
              Print Confirmation
            </button>
          </div>

          <div className="contact-info">
            <p>If you have any questions about your booking, please contact us:</p>
            <p><strong>Email:</strong> support@luxuryhotel.com</p>
            <p><strong>Phone:</strong> +1 (234) 567-8900</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;