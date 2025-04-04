// Import all constants
import * as apiConstants from './api';
import * as commonConstants from './common';

// Export all constants
export * from './api';
export * from './common';

// Re-export specific constants for convenience
export {
  API_STATUS_CODES,
  API_ENDPOINTS,
  API_ERROR_MESSAGES,
  API_CONFIG
} from './api';

export {
  BOOKING_STATUS,
  PAYMENT_METHODS,
  ROOM_STATUS,
  ROOM_TYPES,
  USER_ROLES,
  STORAGE_KEYS,
  DATE_FORMATS,
  VALIDATION_RULES,
  DEFAULTS,
  FILE_UPLOAD,
  PAGINATION,
  TIME_INTERVALS,
  SERVICE_CATEGORIES,
  PAYMENT_STATUS,
  EMPLOYEE_SHIFTS,
  CUSTOMER_TYPES
} from './common';

// Group constants by domain
export const constants = {
  api: apiConstants,
  common: commonConstants
};

export default constants;
