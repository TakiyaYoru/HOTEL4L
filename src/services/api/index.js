// services/api/index.js
import * as auth from './auth';
import * as room from './room';
import * as booking from './booking';
import * as payment from './payment';
import * as customer from './customer';
import * as employee from './employee';
import * as service from './service';


// Export individual API modules
export * as authApi from './auth';
export * as roomApi from './room';
export * as bookingApi from './booking';
export * as paymentApi from './payment';
export * as customerApi from './customer';
export * as employeeApi from './employee';
export * as serviceApi from './service';

// Export all functions from each module
export * from './auth';
export * from './room';
export * from './booking';
export * from './payment';
export * from './customer';
export * from './employee';
export * from './service';

// Group all APIs
const api = {
  auth,
  room,
  booking,
  payment,
  customer,
  employee,
  service,
};

export default api;