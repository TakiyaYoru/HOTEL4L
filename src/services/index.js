// Export API modules
export * from './api';

// Export utility functions
export * from './utils/api';
export * from './utils/format';
export * from './utils/validation';

// Export constants
export * from './constants';

// Import modules
import api from './api';
import * as apiUtils from './utils/api';
import * as formatUtils from './utils/format';
import * as validationUtils from './utils/validation';
import * as constants from './constants';

// Group all exports
export const services = {
  // API services
  api,
  
  // Utility functions
  utils: {
    api: apiUtils,
    format: formatUtils,
    validation: validationUtils
  },
  
  // Constants
  constants
};

/*
Example usage:

import { services } from '@/services';

// Using API services
const rooms = await services.api.room.fetchRooms();
const bookings = await services.api.booking.fetchUserBookings();

// Using utils
const formattedDate = services.utils.format.formatDateForDisplay(date);
const isValid = services.utils.validation.validateEmail(email);
const errorMessage = services.utils.api.handleApiError(error);

// Using constants
if (booking.status === services.constants.BOOKING_STATUS.CONFIRMED) {
  // do something
}

// Or import specific functions/constants directly:
import { 
  fetchRooms,
  formatDateForDisplay,
  validateEmail,
  BOOKING_STATUS 
} from '@/services';
*/

export default services;
