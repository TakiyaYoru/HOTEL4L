import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';

// Lấy danh sách dịch vụ
export const fetchServices = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.SERVICES.BASE);
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Lấy dịch vụ theo loại phòng
export const fetchServicesByRoomType = async (roomTypeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.SERVICES.BASE}?rTypeID=${roomTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for room type ${roomTypeId}:`, error);
    throw error;
  }
};

// Tạo dịch vụ mới
export const createService = async (serviceData) => {
  try {
    const servicePayload = {
      rTypeID: serviceData.roomTypeId,
      serviceName: serviceData.name,
      serviceType: serviceData.type,
      unit: serviceData.unit,
      pricePerUnit: serviceData.price,
      description: serviceData.description
    };

    const response = await api.post(API_ENDPOINTS.SERVICES.BASE, servicePayload);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Cập nhật dịch vụ
export const updateService = async (serviceId, serviceData) => {
  try {
    const servicePayload = {
      serviceName: serviceData.name,
      serviceType: serviceData.type,
      unit: serviceData.unit,
      pricePerUnit: serviceData.price,
      description: serviceData.description
    };

    const response = await api.put(`${API_ENDPOINTS.SERVICES.BASE}/${serviceId}`, servicePayload);
    return response.data;
  } catch (error) {
    console.error(`Error updating service with id ${serviceId}:`, error);
    throw error;
  }
};

// Xóa dịch vụ
export const deleteService = async (serviceId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.SERVICES.BASE}/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting service with id ${serviceId}:`, error);
    throw error;
  }
};

// Lấy danh sách tiện nghi
export const fetchAmenities = async () => {
  try {
    const response = await api.get('/amenities');
    return response.data;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    // Trả về mảng rỗng nếu API chưa được triển khai
    return [];
  }
};

// Lấy tiện nghi theo loại phòng
export const fetchAmenitiesByRoomType = async (roomTypeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.TYPES}/${roomTypeId}/amenities`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching amenities for room type ${roomTypeId}:`, error);
    // Trả về mảng rỗng nếu API chưa được triển khai
    return [];
  }
};

// Thêm tiện nghi cho loại phòng
export const addAmenityToRoomType = async (roomTypeId, amenityData) => {
  try {
    const response = await api.post(`${API_ENDPOINTS.ROOMS.TYPES}/${roomTypeId}/amenities`, amenityData);
    return response.data;
  } catch (error) {
    console.error(`Error adding amenity to room type ${roomTypeId}:`, error);
    throw error;
  }
};

// Xóa tiện nghi khỏi loại phòng
export const removeAmenityFromRoomType = async (roomTypeId, amenityId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.ROOMS.TYPES}/${roomTypeId}/amenities/${amenityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing amenity ${amenityId} from room type ${roomTypeId}:`, error);
    throw error;
  }
};

// Lấy thống kê sử dụng dịch vụ
export const fetchServiceUsageStatistics = async (serviceId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.SERVICES.BASE}/${serviceId}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for service ${serviceId}:`, error);
    // Trả về đối tượng rỗng nếu API chưa được triển khai
    return {
      totalUsage: 0,
      totalRevenue: 0,
      averageUsagePerBooking: 0
    };
  }
};

// Lấy dịch vụ phổ biến
export const fetchPopularServices = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.SERVICES.POPULAR);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular services:', error);
    // Trả về mảng rỗng nếu API chưa được triển khai
    return [];
  }
};

// Lấy doanh thu dịch vụ theo thời gian
export const fetchServiceRevenue = async (startDate, endDate) => {
  try {
    const response = await api.get(API_ENDPOINTS.SERVICES.REVENUE, {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service revenue:', error);
    // Trả về đối tượng rỗng nếu API chưa được triển khai
    return {
      totalRevenue: 0,
      revenueByService: []
    };
  }
};
