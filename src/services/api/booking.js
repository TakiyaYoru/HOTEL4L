// services/api/booking.js
import api from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS, BOOKING_STATUS } from '../constants'; // Đảm bảo import BOOKING_STATUS
import { formatDateForApi } from '../utils/format';

// Lấy danh sách đặt phòng của người dùng hiện tại
export const fetchUserBookings = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    const userIdentifier = currentUser.username;
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${userIdentifier}`);
    
    if (response.data && response.data.bookings) {
      return response.data.bookings;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một đặt phòng
export const fetchBookingById = async (bookingId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một BookingDetail dựa trên detailID
export const fetchBookingDetailById = async (detailID) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKING_DETAILS}/${detailID}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking detail with ID ${detailID}:`, error);
    throw error;
  }
};

// Tạo đặt phòng mới
export const createBooking = async (bookingData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    const employeeID = bookingData.employeeID || "emp000001";
    const bookingID = bookingData.bookingID || 'BOOK' + Date.now().toString().slice(-8);
    const paymentID = bookingData.paymentID;
    
    const bookingPayload = {
      bookingID: bookingID,
      bookingTime: new Date().toISOString(),
      totalAmount: bookingData.totalAmount || 0,
      bookingStatus: BOOKING_STATUS.PENDING, // Trạng thái ban đầu là PENDING
      paymentStatus: bookingData.paymentStatus || false,
      paymentID: paymentID,
      customerID: bookingData.customerID || currentUser.id || currentUser.username,
      employeeID: employeeID,
      checkInCode: null, // Thêm trường checkInCode, ban đầu là null
      payment: bookingData.paymentMethod !== 'cash' && paymentID ? {
        paymentID: paymentID,
        paymentTime: bookingData.payment?.paymentTime || new Date().toISOString(),
        method: getPaymentMethodName(bookingData.paymentMethod),
        details: bookingData.payment?.details || "Online payment",
        totalAmount: bookingData.payment?.totalAmount || bookingData.totalAmount || 0,
        pan: bookingData.payment?.pan || (bookingData.paymentMethod === 'creditCard' ? bookingData.cardNumber?.replace(/\s/g, '') : null) || null,
        bookingID: bookingID
      } : null,
      customer: bookingData.customer || {
        customerID: bookingData.customerID || currentUser.id || currentUser.username,
        cName: bookingData.customerName || `${bookingData.firstName} ${bookingData.lastName}` || currentUser.name || "Guest User",
        gender: bookingData.gender || "Unknown",
        email: bookingData.email || currentUser.email || "guest@example.com",
        dob: bookingData.dob ? new Date(bookingData.dob).toISOString() : "1990-01-01T00:00:00",
        phone: bookingData.phone || "000-000-0000",
        address: bookingData.address || "Unknown",
        idCard: bookingData.idCard || "000000000000",
        point: 0
      }
    };
    
    const response = await api.post(API_ENDPOINTS.BOOKINGS.BASE, bookingPayload);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Tạo chi tiết đặt phòng
export const createBookingDetail = async (bookingDetail) => {
  try {
    const detailID = bookingDetail.detailID || 'BD' + Date.now().toString().slice(-8);
    
    const bookingDetailPayload = {
      detailID: detailID,
      checkinDate: formatDateForApi(bookingDetail.checkinDate),
      checkoutDate: formatDateForApi(bookingDetail.checkoutDate),
      detailStatus: bookingDetail.detailStatus || "Booked",
      pricePerDay: bookingDetail.pricePerDay || 0,
      totalPrice: bookingDetail.totalPrice || 0,
      bookingID: bookingDetail.bookingID,
      roomID: bookingDetail.roomID,
      guest_BDetails: bookingDetail.guest_BDetails || [], // Sử dụng guest_BDetails từ bookingDetail
      eService_BDetails: bookingDetail.eService_BDetails || []
    };
    
    const response = await api.post(API_ENDPOINTS.BOOKINGS.DETAILS, bookingDetailPayload);
    return response.data;
  } catch (error) {
    console.error('Error creating booking detail:', error);
    throw error;
  }
};

// Hủy đặt phòng
export const cancelBooking = async (bookingId) => {
  try {
    const booking = await fetchBookingById(bookingId);
    const updatedBooking = {
      ...booking,
      bookingStatus: BOOKING_STATUS.CANCELLED // Cập nhật trạng thái thành CANCELLED
    };
    const response = await updateBooking(bookingId, updatedBooking);
    return response;
  } catch (error) {
    console.error(`Error cancelling booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Lấy chi tiết đặt phòng
export const fetchBookingDetails = async (bookingId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}/details`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking details for booking ${bookingId}:`, error);
    return [];
  }
};

// Cập nhật đặt phòng
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}`, bookingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Xác nhận đặt phòng (Employee)
export const confirmBooking = async (bookingId) => {
  try {
    const booking = await fetchBookingById(bookingId);
    
    const updatedBooking = {
      ...booking,
      bookingStatus: BOOKING_STATUS.CONFIRMED // Đảm bảo trạng thái là CONFIRMED
    };
    
    const response = await updateBooking(bookingId, updatedBooking);
    
    if (response && response.bookingDetails && response.bookingDetails.length > 0) {
      const roomId = response.bookingDetails[0].roomID;
      await api.put(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}`, {
        status: 'Booked'
      });
    }
    
    return response;
  } catch (error) {
    console.error(`Error confirming booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Check-in khách (Employee)
export const checkInBooking = async (bookingId, checkInCode) => {
  try {
    const booking = await fetchBookingById(bookingId);
    
    // Kiểm tra mã check-in
    if (!booking.checkInCode || booking.checkInCode !== checkInCode) {
      throw new Error('Invalid check-in code');
    }
    
    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new Error('Booking is not in Confirmed status');
    }
    
    const updatedBooking = {
      ...booking,
      bookingStatus: BOOKING_STATUS.CHECKED_IN // Cập nhật trạng thái thành CHECKED_IN
    };
    
    const response = await updateBooking(bookingId, updatedBooking);
    
    if (response && response.bookingDetails && response.bookingDetails.length > 0) {
      const roomId = response.bookingDetails[0].roomID;
      await api.put(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}`, {
        status: 'Occupied'
      });
    }
    
    return response;
  } catch (error) {
    console.error(`Error checking in booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Check-out khách (Employee)
export const checkOutBooking = async (bookingId) => {
  try {
    const booking = await fetchBookingById(bookingId);
    
    if (booking.bookingStatus !== BOOKING_STATUS.CHECKED_IN) {
      throw new Error('Booking is not in Checked-in status');
    }
    
    const updatedBooking = {
      ...booking,
      bookingStatus: BOOKING_STATUS.CHECKED_OUT // Cập nhật trạng thái thành CHECKED_OUT
    };
    
    const response = await updateBooking(bookingId, updatedBooking);
    
    if (response && response.bookingDetails && response.bookingDetails.length > 0) {
      const roomId = response.bookingDetails[0].roomID;
      await api.put(`${API_ENDPOINTS.ROOMS.BASE}/${roomId}`, {
        status: 'Free'
      });
    }
    
    return response;
  } catch (error) {
    console.error(`Error checking out booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Lấy danh sách đặt phòng theo trạng thái
export const fetchBookingsByStatus = async (status) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS.BASE}?status=${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bookings with status ${status}:`, error);
    throw error;
  }
};



// Lấy tất cả đặt phòng (dành cho Employee)
export const fetchAllBookings = async () => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS.BASE}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

// Xóa đặt phòng (dùng để rollback nếu có lỗi)
export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting booking with id ${bookingId}:`, error);
    throw error;
  }
};

// Tạo mã QR cho booking
export const generateBookingQRCode = async (bookingId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}/qrcode`);
    return response.data;
  } catch (error) {
    console.error(`Error generating QR code for booking ${bookingId}:`, error);
    return { qrCode: bookingId };
  }
};

// Cập nhật chi tiết đặt phòng
export const updateBookingDetail = async (detailId, bookingDetail) => {
  try {
    const response = await api.put(`${API_ENDPOINTS.BOOKINGS.DETAILS}/${detailId}`, bookingDetail);
    return response.data;
  } catch (error) {
    console.error(`Error updating booking detail with id ${detailId}:`, error);
    throw error;
  }
};

// Hàm hỗ trợ để lấy tên phương thức thanh toán
const getPaymentMethodName = (method) => {
  switch (method) {
    case 'creditCard':
      return 'Credit Card';
    case 'paypal':
      return 'PayPal';
    case 'bankTransfer':
      return 'Bank Transfer';
    case 'cash':
      return 'Cash';
    default:
      return 'Card';
  }
};