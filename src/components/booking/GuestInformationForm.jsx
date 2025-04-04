import React from 'react';
import PropTypes from 'prop-types';

function GuestInformationForm({ formData, handleInputChange }) {
  return (
    <div className="form-section">
      <h2>Primary Guest Information</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fullName">Full Name*</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email address"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone*</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="XXX-XXXX-XXXXX"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="idCard">ID Card/Passport*</label>
          <input
            type="text"
            id="idCard"
            name="idCard"
            value={formData.idCard}
            onChange={handleInputChange}
            required
            placeholder="Enter your ID card or passport number"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dob">Date of Birth*</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="gender">Gender*</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address*</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="Enter your full address"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="checkInTime">Check-in Time*</label>
          <select
            id="checkInTime"
            name="checkInTime"
            value={formData.checkInTime}
            onChange={handleInputChange}
            required
          >
            <option value="14:00">14:00 (2:00 PM)</option>
            <option value="15:00">15:00 (3:00 PM)</option>
            <option value="16:00">16:00 (4:00 PM)</option>
            <option value="17:00">17:00 (5:00 PM)</option>
            <option value="18:00">18:00 (6:00 PM)</option>
            <option value="19:00">19:00 (7:00 PM)</option>
            <option value="20:00">20:00 (8:00 PM)</option>
            <option value="21:00">21:00 (9:00 PM)</option>
            <option value="22:00">22:00 (10:00 PM)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="checkOutTime">Check-out Time*</label>
          <select
            id="checkOutTime"
            name="checkOutTime"
            value={formData.checkOutTime}
            onChange={handleInputChange}
            required
          >
            <option value="10:00">10:00 (10:00 AM)</option>
            <option value="11:00">11:00 (11:00 AM)</option>
            <option value="12:00">12:00 (12:00 PM)</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="specialRequests">Special Requests (Optional)</label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          rows="3"
          placeholder="Any special requests or preferences for your stay"
        ></textarea>
      </div>
    </div>
  );
}

GuestInformationForm.propTypes = {
  formData: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    idCard: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    checkInTime: PropTypes.string.isRequired,
    checkOutTime: PropTypes.string.isRequired,
    specialRequests: PropTypes.string.isRequired
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired
};

export default GuestInformationForm;
