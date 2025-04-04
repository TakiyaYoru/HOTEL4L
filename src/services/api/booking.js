import api from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';
import { formatDateForApi } from '../utils/format';

// Lấy danh sách đặt phòng của người dùng hiện tại
export const fetchUserBookings = async () => {
  try {
    // Lấy thông tin người dùng hiện tại từ localStorage
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    // Sử dụng username hoặc id tùy thuộc vào cái nào có sẵn
    const userIdentifier = currentUser.username;
    
    // Gọi API để lấy thông tin customer bao gồm bookings
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${userIdentifier}`);
    
    // Trả về danh sách bookings từ response
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
    // Lấy thông tin người dùng hiện tại từ localStorage
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    // Đảm bảo có employeeID (API yêu cầu)
    const employeeID = bookingData.employeeID || "emp000001";
    const bookingID = bookingData.bookingID || 'BOOK' + Date.now().toString().slice(-8);
    
    // Sử dụng paymentID từ bookingData, không tạo mới
    const paymentID = bookingData.paymentID;
    
    // Chuẩn bị dữ liệu booking theo cấu trúc API
    const bookingPayload = {
      bookingID: bookingID,
      bookingTime: new Date().toISOString(),
      totalAmount: bookingData.totalAmount || 0,
      bookingStatus: bookingData.bookingStatus || "Confirmed",
      paymentStatus: bookingData.paymentStatus || false,
      paymentID: paymentID,
      customerID: bookingData.customerID || currentUser.id || currentUser.username,
      employeeID: employeeID,
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
    // Đảm bảo có detailID (API yêu cầu)
    const detailID = bookingDetail.detailID || 'BD' + Date.now().toString().slice(-8);
    
    // Chuẩn bị dữ liệu booking detail theo cấu trúc API
    const bookingDetailPayload = {
      detailID: detailID,
      checkinDate: formatDateForApi(bookingDetail.checkinDate),
      checkoutDate: formatDateForApi(bookingDetail.checkoutDate),
      detailStatus: bookingDetail.detailStatus || "Booked",
      pricePerDay: bookingDetail.pricePerDay || 0,
      totalPrice: bookingDetail.totalPrice || 0,
      bookingID: bookingDetail.bookingID,
      roomID: bookingDetail.roomID,
      guest_BDetails: bookingDetail.guests?.map((guest, index) => ({
        detailID: detailID,
        guestID: `GUEST${Date.now().toString().slice(-4)}_${index}`,
        guestInfo: index === 0 ? {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          address: guest.address,
          idCard: guest.idCard,
          dob: guest.dob,
          gender: guest.gender
        } : null
      })) || [],
      eService_BDetails: bookingDetail.services?.map(service => ({
        detailID: detailID,
        eServiceID: service.id,
        quantity: service.quantity || 1
      })) || []
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
    const response = await api.put(API_ENDPOINTS.BOOKINGS.CANCEL(bookingId));
    return response.data;
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
    
    // Cập nhật trạng thái booking
    const updatedBooking = {
      ...booking,
      bookingStatus: 'Confirmed'
    };
    
    const response = await updateBooking(bookingId, updatedBooking);
    
    // Cập nhật trạng thái phòng
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
export const checkInBooking = async (bookingId, bookingCode) => {
  try {
    // Xác thực mã booking
    if (bookingCode) {
      // Kiểm tra mã booking có khớp không
      const booking = await fetchBookingById(bookingId);
      if (booking.bookingID !== bookingCode) {
        throw new Error('Invalid booking code');
      }
    }
    
    const booking = await fetchBookingById(bookingId);
    
    // Cập nhật trạng thái booking
    const updatedBooking = {
      ...booking,
      bookingStatus: 'Checked In'
    };
    
    const response = await updateBooking(bookingId, updatedBooking);
    
    // Cập nhật trạng thái phòng
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
    
    // Cập nhật trạng thái booking
    const updatedBooking = {
      ...booking,
      bookingStatus: 'Completed'
    };
    
    const response = await updateBooking(bookingId, updatedBooking);
    
    // Cập nhật trạng thái phòng
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

// Tạo mã QR cho booking
export const generateBookingQRCode = async (bookingId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS.BASE}/${bookingId}/qrcode`);
    return response.data;
  } catch (error) {
    console.error(`Error generating QR code for booking ${bookingId}:`, error);
    // Nếu API không tồn tại, trả về bookingId làm mã QR
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
