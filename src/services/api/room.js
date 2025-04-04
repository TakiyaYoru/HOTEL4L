import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import { formatDateForApi } from '../utils/format';

// Lấy danh sách phòng
export const fetchRooms = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ROOMS.BASE);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một phòng
export const fetchRoomById = async (roomId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching room with id ${roomId}:`, error);
    throw error;
  }
};

// Lấy danh sách loại phòng
export const fetchRoomTypes = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ROOMS.TYPES);
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

// Kiểm tra phòng có sẵn không
export const checkRoomAvailability = async (roomId, checkInDate, checkOutDate) => {
  try {
    const response = await api.get(API_ENDPOINTS.ROOMS.AVAILABILITY(roomId), {
      params: {
        checkInDate: formatDateForApi(checkInDate),
        checkOutDate: formatDateForApi(checkOutDate)
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error checking room availability for room ${roomId}:`, error);
    // Nếu API trả về lỗi 404, giả định phòng có sẵn
    if (error.response && error.response.status === 404) {
      console.log(`Room availability API not found, assuming room ${roomId} is available`);
      return { isAvailable: true };
    }
    // Trả về kết quả mặc định thay vì throw error
    return { isAvailable: true };
  }
};

// Tạo phòng mới
export const createRoom = async (roomData) => {
  try {
    const response = await api.post(API_ENDPOINTS.ROOMS.BASE, roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Cập nhật phòng
export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}`, roomData);
    return response.data;
  } catch (error) {
    console.error(`Error updating room with id ${roomId}:`, error);
    throw error;
  }
};

// Xóa phòng
export const deleteRoom = async (roomId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting room with id ${roomId}:`, error);
    throw error;
  }
};

// Tạo loại phòng mới
export const createRoomType = async (roomTypeData) => {
  try {
    const response = await api.post(API_ENDPOINTS.ROOMS.TYPES, roomTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating room type:', error);
    throw error;
  }
};

// Cập nhật loại phòng
export const updateRoomType = async (roomTypeId, roomTypeData) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.ROOMS.TYPES}/${roomTypeId}`, roomTypeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating room type with id ${roomTypeId}:`, error);
    throw error;
  }
};

// Xóa loại phòng
export const deleteRoomType = async (roomTypeId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.ROOMS.TYPES}/${roomTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting room type with id ${roomTypeId}:`, error);
    throw error;
  }
};

// Lấy dịch vụ của loại phòng
export const fetchRoomServices = async (roomTypeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.SERVICES.BASE}?rTypeID=${roomTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for room type ${roomTypeId}:`, error);
    throw error;
  }
};

// Lấy tiện nghi của loại phòng
export const fetchRoomAmenities = async (roomTypeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.TYPES}/${roomTypeId}/amenities`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching amenities for room type ${roomTypeId}:`, error);
    // Trả về mảng rỗng nếu API chưa được triển khai
    return [];
  }
};

// Lọc phòng theo tiêu chí
export const filterRooms = async (filters) => {
  try {
    const response = await api.get(API_ENDPOINTS.ROOMS.BASE, {
      params: {
        type: filters.type,
        maxGuests: filters.capacity,
        minPrice: filters.priceRange?.split('-')[0],
        maxPrice: filters.priceRange?.split('-')[1],
        status: filters.status
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error filtering rooms:', error);
    throw error;
  }
};

// Tìm kiếm phòng
export const searchRooms = async (searchTerm) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/search`, {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching rooms:', error);
    throw error;
  }
};

// Lấy lịch sử giá của phòng
export const fetchRoomPriceHistory = async (roomId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}/price-history`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching price history for room ${roomId}:`, error);
    // Trả về mảng rỗng nếu API chưa được triển khai
    return [];
  }
};

// Lấy thống kê đặt phòng
export const fetchRoomBookingStats = async (roomId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}/booking-stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking stats for room ${roomId}:`, error);
    // Trả về đối tượng rỗng nếu API chưa được triển khai
    return {
      totalBookings: 0,
      averageStay: 0,
      occupancyRate: 0
    };
  }
};

// Lấy phòng tương tự
export const fetchSimilarRooms = async (roomId, limit = 3) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}/similar`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar rooms for room ${roomId}:`, error);
    return [];
  }
};

// Lấy đánh giá của phòng
export const fetchRoomReviews = async (roomId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}/reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for room ${roomId}:`, error);
    return [];
  }
};
