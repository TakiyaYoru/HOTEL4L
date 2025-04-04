import React from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { services } from '../../services';

function BookingSummary({ bookingData }) {
  // Format ngày
  const formatDate = (dateString) => {
    return services.utils.format.formatDateForDisplay(dateString);
  };

  return (
    <div className="booking-summary">
      <div className="summary-card">
        <h2>Booking Summary</h2>
        
        <div className="summary-image" style={{ backgroundImage: `url(${bookingData.roomImage})` }}></div>
        
        <div className="summary-details">
          <h3>{bookingData.roomName}</h3>
          
          <div className="summary-item">
            <div className="summary-icon">
              <FaCalendarAlt />
            </div>
            <div className="summary-text">
              <span className="summary-label">Check-in</span>
              <span>{formatDate(bookingData.checkInDate)}</span>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-icon">
              <FaCalendarAlt />
            </div>
            <div className="summary-text">
              <span className="summary-label">Check-out</span>
              <span>{formatDate(bookingData.checkOutDate)}</span>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-icon">
              <FaUsers />
            </div>
            <div className="summary-text">
              <span className="summary-label">Guests</span>
              <span>{bookingData.guests}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-pricing">
          <div className="price-item">
            <span>Room Rate</span>
            <span>${services.utils.format.formatCurrency(bookingData.price)} x {bookingData.nights} nights</span>
          </div>
          
          <div className="price-item">
            <span>Room Total</span>
            <span>${services.utils.format.formatCurrency(bookingData.price * bookingData.nights)}</span>
          </div>
          
          <div className="price-item">
            <span>Tax (10%)</span>
            <span>${services.utils.format.formatCurrency(bookingData.price * bookingData.nights * 0.1)}</span>
          </div>
          
          <div className="price-total">
            <span>Total</span>
            <span>${services.utils.format.formatCurrency(bookingData.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

BookingSummary.propTypes = {
  bookingData: PropTypes.shape({
    roomName: PropTypes.string.isRequired,
    roomImage: PropTypes.string.isRequired,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    guests: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    nights: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  }).isRequired
};

export default BookingSummary;
