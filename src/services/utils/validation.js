import { VALIDATION_RULES } from '../constants';

// Validate email
export const validateEmail = (email) => {
  if (!email) return false;
  return VALIDATION_RULES.EMAIL_PATTERN.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return false;
  return VALIDATION_RULES.PHONE_PATTERN.test(phone);
};

// Validate password
export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

// Validate ID card
export const validateIdCard = (idCard) => {
  if (!idCard) return false;
  return idCard.length === VALIDATION_RULES.ID_CARD_LENGTH;
};

// Validate dates
export const validateDates = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return false;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return checkOutDate > checkInDate;
};

// Validate booking data
export const validateBookingData = (bookingData) => {
  const errors = {};

  if (!bookingData.checkInDate || !bookingData.checkOutDate) {
    errors.dates = 'Vui lòng chọn ngày check-in và check-out';
  } else if (!validateDates(bookingData.checkInDate, bookingData.checkOutDate)) {
    errors.dates = 'Ngày check-out phải sau ngày check-in';
  }

  if (!bookingData.guests || bookingData.guests < 1) {
    errors.guests = 'Vui lòng chọn số lượng khách';
  }

  if (!bookingData.roomId) {
    errors.roomId = 'Vui lòng chọn phòng';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate payment data
export const validatePaymentData = (paymentData) => {
  const errors = {};

  if (!paymentData.paymentMethod) {
    errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
  }

  if (paymentData.paymentMethod === 'creditCard') {
    if (!paymentData.cardNumber) {
      errors.cardNumber = 'Vui lòng nhập số thẻ';
    }
    if (!paymentData.cardHolder) {
      errors.cardHolder = 'Vui lòng nhập tên chủ thẻ';
    }
    if (!paymentData.expiryDate) {
      errors.expiryDate = 'Vui lòng nhập ngày hết hạn';
    }
    if (!paymentData.cvv) {
      errors.cvv = 'Vui lòng nhập mã CVV';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate customer data
export const validateCustomerData = (customerData) => {
  const errors = {};

  if (!customerData.firstName) {
    errors.firstName = 'Vui lòng nhập họ';
  }
  if (!customerData.lastName) {
    errors.lastName = 'Vui lòng nhập tên';
  }
  if (!customerData.email || !validateEmail(customerData.email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (!customerData.phone || !validatePhone(customerData.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  if (!customerData.idCard || !validateIdCard(customerData.idCard)) {
    errors.idCard = 'Số CMND/CCCD không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate room capacity
export const validateRoomCapacity = (roomCapacity, guestsCount) => {
  return guestsCount <= roomCapacity;
};

// Validate price range
export const validatePriceRange = (price, minPrice, maxPrice) => {
  if (!price) return false;
  if (minPrice && price < minPrice) return false;
  if (maxPrice && price > maxPrice) return false;
  return true;
};

// Validate date range
export const validateDateRange = (startDate, endDate, maxDays = 30) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= maxDays;
};

// Validate file type
export const validateFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes) return false;
  return allowedTypes.includes(file.type);
};

// Validate file size
export const validateFileSize = (file, maxSizeInMB) => {
  if (!file || !maxSizeInMB) return false;
  const fileSizeInMB = file.size / (1024 * 1024);
  return fileSizeInMB <= maxSizeInMB;
};
