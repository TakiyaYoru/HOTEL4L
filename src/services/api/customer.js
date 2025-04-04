import api from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

// Lấy thông tin khách hàng theo username
export const fetchCustomerByUsername = async (username) => {
  try {
    console.log(`Fetching customer data for ${username}`);
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${username}`);
    console.log('Customer data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer with username ${username}:`, error);
    throw error;
  }
};

// Cập nhật thông tin khách hàng
export const updateCustomer = async (customerId, customerData) => {
  try {
    console.log(`Updating customer ${customerId} with data:`, JSON.stringify(customerData, null, 2));
    const response = await api.put(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}`, customerData);
    console.log('Customer updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer with id ${customerId}:`, error);
    throw error;
  }
};

// Lấy danh sách khách hàng
export const fetchCustomers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.BASE);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Tạo khách hàng mới
export const createCustomer = async (customerData) => {
  try {
    const customerPayload = {
      customerID: customerData.customerID || customerData.username,
      cName: customerData.name,
      gender: customerData.gender,
      email: customerData.email,
      dob: customerData.dob,
      phone: customerData.phone,
      address: customerData.address || '',
      idCard: customerData.idCard || '',
      point: 0
    };

    const response = await api.post(API_ENDPOINTS.CUSTOMERS.BASE, customerPayload);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Xóa khách hàng
export const deleteCustomer = async (customerId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting customer with id ${customerId}:`, error);
    throw error;
  }
};

// Tìm kiếm khách hàng
export const searchCustomers = async (searchTerm) => {
  try {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.SEARCH, {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

// Lấy lịch sử đặt phòng của khách hàng
export const fetchCustomerBookingHistory = async (customerId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/bookings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking history for customer ${customerId}:`, error);
    throw error;
  }
};

// Lấy điểm tích lũy của khách hàng
export const fetchCustomerPoints = async (customerId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/points`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching points for customer ${customerId}:`, error);
    throw error;
  }
};

// Cập nhật điểm tích lũy của khách hàng
export const updateCustomerPoints = async (customerId, points) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/points`, { points });
    return response.data;
  } catch (error) {
    console.error(`Error updating points for customer ${customerId}:`, error);
    throw error;
  }
};

// Lấy thống kê khách hàng
export const fetchCustomerStatistics = async (customerId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${customerId}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for customer ${customerId}:`, error);
    throw error;
  }
};

// Lấy danh sách khách hàng VIP
export const fetchVIPCustomers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.VIP);
    return response.data;
  } catch (error) {
    console.error('Error fetching VIP customers:', error);
    throw error;
  }
};

// Lấy thông tin khách hàng hiện tại
export const fetchCurrentCustomer = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    return await fetchCustomerByUsername(currentUser.username);
  } catch (error) {
    console.error('Error fetching current customer:', error);
    throw error;
  }
};

// Cập nhật thông tin khách hàng hiện tại
export const updateCurrentCustomer = async (customerData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    return await updateCustomer(currentUser.username, customerData);
  } catch (error) {
    console.error('Error updating current customer:', error);
    throw error;
  }
};
