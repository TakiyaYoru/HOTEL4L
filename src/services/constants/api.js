// API Status Codes
export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/authentications/login',
    REGISTER: '/authentications/register',
    CURRENT_USER: '/authentications/me'
  },
  ROOMS: {
    BASE: '/rooms',
    TYPES: '/roomtypes',
    AVAILABILITY: (roomId) => `/rooms/${roomId}/availability`
  },
  BOOKINGS: {
    BASE: '/bookings',
    DETAILS: '/bookingDetails',
    CANCEL: (bookingId) => `/bookings/${bookingId}/cancel`
  },
  CUSTOMERS: {
    BASE: '/customers',
    SEARCH: '/customers/search',
    VIP: '/customers/vip'
  },
  EMPLOYEES: {
    BASE: '/employees',
    SHIFTS: '/Shifts'
  },
  SERVICES: {
    BASE: '/Services',
    POPULAR: '/Services/popular',
    REVENUE: '/Services/revenue'
  },
  PAYMENTS: {
    BASE: '/payments',
    CARDS: '/paymentcards'
  }
};

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  SERVER_ERROR: 'Đã có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  LOGIN_REQUIRED: 'Vui lòng đăng nhập để tiếp tục.',
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng.',
  USER_EXISTS: 'Tên đăng nhập đã tồn tại.',
  BOOKING_FAILED: 'Không thể đặt phòng. Vui lòng thử lại sau.',
  PAYMENT_FAILED: 'Thanh toán không thành công. Vui lòng thử lại.',
  ROOM_UNAVAILABLE: 'Phòng không khả dụng trong thời gian đã chọn.'
};

// API Config
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_API_LOGGING,
  ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK_API
};
