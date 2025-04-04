import { DATE_FORMATS, DEFAULTS } from '../constants';

// Format date cho API requests
export const formatDateForApi = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
};

// Format date cho hiển thị
export const formatDateForDisplay = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(DEFAULTS.LANGUAGE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format currency
export const formatCurrency = (amount, currency = DEFAULTS.CURRENCY) => {
  return new Intl.NumberFormat(DEFAULTS.LANGUAGE, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Format: XXX-XXXX-XXXXX
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{5})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

// Format room number
export const formatRoomNumber = (roomId) => {
  if (!roomId) return '';
  // Format: Floor + Room Number (e.g., 301A -> Floor 3, Room 01A)
  const match = roomId.match(/^(\d)(\d{2})([A-Z])$/);
  if (match) {
    return `Floor ${match[1]}, Room ${match[2]}${match[3]}`;
  }
  return roomId;
};

// Format booking ID
export const formatBookingId = (bookingId) => {
  if (!bookingId) return '';
  // Format: BK.XXXXXXXX
  if (bookingId.startsWith('BK.')) {
    return bookingId;
  }
  return `BK.${bookingId}`;
};

// Format payment amount
export const formatPaymentAmount = (amount) => {
  if (!amount) return '0';
  return amount.toLocaleString(DEFAULTS.LANGUAGE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format percentage
export const formatPercentage = (value) => {
  if (!value) return '0%';
  return `${(value * 100).toFixed(1)}%`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Format duration
export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

// Format name
export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  return [firstName, lastName].filter(Boolean).join(' ');
};
