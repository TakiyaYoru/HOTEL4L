import React from 'react';
import PropTypes from 'prop-types';
import { FaUserFriends } from 'react-icons/fa';
import CompanionForm from './CompanionForm';

function CompanionsInformationForm({ bookingData, formData, handleCompanionChange }) {
  return (
    <div className="form-section">
      <h2>Companion Information</h2>
      
      {bookingData.guests <= 1 ? (
        <div className="no-companions-message">
          <FaUserFriends className="icon" />
          <p>No additional guests for this booking.</p>
        </div>
      ) : (
        <>
          <p className="section-description">Please provide information for all guests staying with you.</p>
          
          {formData.companions.map((companion, index) => (
            <CompanionForm 
              key={index} 
              companion={companion} 
              index={index} 
              handleCompanionChange={handleCompanionChange} 
            />
          ))}
        </>
      )}
    </div>
  );
}

CompanionsInformationForm.propTypes = {
  bookingData: PropTypes.shape({
    guests: PropTypes.number.isRequired
  }).isRequired,
  formData: PropTypes.shape({
    companions: PropTypes.arrayOf(
      PropTypes.shape({
        fullName: PropTypes.string.isRequired,
        idCard: PropTypes.string.isRequired,
        dob: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  handleCompanionChange: PropTypes.func.isRequired
};

export default CompanionsInformationForm;
