// Booking Status
// services/constants/common.js (giả định)
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash'
};

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: 'Available', // Phòng trống và có thể đặt
  BOOKED: 'Booked',       // Phòng đã được đặt nhưng chưa check-in
  OCCUPIED: 'Occupied',   // Phòng đang có khách ở (đã check-in)
  MAINTAINING: 'Maintaining', // Phòng đang bảo trì
  FREE: 'Free'            // Phòng trống sau khi check-out
};

// Room Types
export const ROOM_TYPES = {
  SINGLE: 'SGL',
  DOUBLE: 'DBL',
  TWIN: 'TWN',
  KING: 'KIN',
  FAMILY: 'FAM'
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  MANAGER: 'manager'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: import.meta.env.VITE_AUTH_TOKEN_KEY,
  USER_DATA: import.meta.env.VITE_USER_DATA_KEY
};

// Date Formats
export const DATE_FORMATS = {
  DEFAULT: import.meta.env.VITE_DEFAULT_DATE_FORMAT,
  API: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm'
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_PATTERN: /^[0-9]{3}-[0-9]{4}-[0-9]{5}$/,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  ID_CARD_LENGTH: 12
};

// Default Values
export const DEFAULTS = {
  ITEMS_PER_PAGE: 10,
  CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY,
  LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE,
  CHECK_IN_TIME: '14:00',
  CHECK_OUT_TIME: '12:00'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5, // MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILES: 5
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Time Intervals
export const TIME_INTERVALS = {
  AUTO_SAVE: 30000, // 30 seconds
  SESSION_TIMEOUT: 3600000, // 1 hour
  REFRESH_INTERVAL: 300000 // 5 minutes
};

// Service Categories
export const SERVICE_CATEGORIES = {
  ROOM_SERVICE: 'room_service',
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  FITNESS: 'fitness',
  LAUNDRY: 'laundry'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Employee Shifts
export const EMPLOYEE_SHIFTS = {
  MORNING: 1,
  AFTERNOON: 2,
  NIGHT: 3
};

// Customer Types
export const CUSTOMER_TYPES = {
  REGULAR: 'regular',
  VIP: 'vip',
  CORPORATE: 'corporate'
};
