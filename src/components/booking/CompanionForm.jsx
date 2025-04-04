import React from 'react';
import PropTypes from 'prop-types';

function CompanionForm({ companion, index, handleCompanionChange }) {
  return (
    <div className="companion-form">
      <h3>Guest {index + 1}</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`companion-${index}-fullName`}>Full Name*</label>
          <input
            type="text"
            id={`companion-${index}-fullName`}
            value={companion.fullName}
            onChange={(e) => handleCompanionChange(index, 'fullName', e.target.value)}
            required
            placeholder="Enter full name"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`companion-${index}-idCard`}>ID Card/Passport*</label>
          <input
            type="text"
            id={`companion-${index}-idCard`}
            value={companion.idCard}
            onChange={(e) => handleCompanionChange(index, 'idCard', e.target.value)}
            required
            placeholder="Enter ID card or passport number"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`companion-${index}-dob`}>Date of Birth*</label>
          <input
            type="date"
            id={`companion-${index}-dob`}
            value={companion.dob}
            onChange={(e) => handleCompanionChange(index, 'dob', e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`companion-${index}-gender`}>Gender*</label>
          <select
            id={`companion-${index}-gender`}
            value={companion.gender}
            onChange={(e) => handleCompanionChange(index, 'gender', e.target.value)}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

CompanionForm.propTypes = {
  companion: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    idCard: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleCompanionChange: PropTypes.func.isRequired
};

export default CompanionForm;
