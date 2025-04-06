import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { services } from '../services';
import {
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaBed,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaUsers,
  FaHashtag,
  FaInfoCircle
} from 'react-icons/fa';
import '../styles/BookingDetailPage.css';

function MyBookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Cache cho roomTypes để giảm API calls
  let roomTypesCache = null;
  const getRoomTypes = async () => {
    if (roomTypesCache) return roomTypesCache;
    const roomTypes = await services.api.room.fetchRoomTypes();
    roomTypesCache = roomTypes;
    return roomTypes;
  };

  // Lấy thông tin chi tiết đặt phòng từ API
  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!currentUser || !bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Lấy thông tin khách hàng hiện tại (bao gồm bookings)
        console.log('Đang lấy dữ liệu khách hàng hiện tại...');
        const customerData = await services.api.customer.fetchCurrentCustomer();
        console.log('Dữ liệu khách hàng nhận được:', customerData);

        if (!customerData || !customerData.bookings || customerData.bookings.length === 0) {
          console.log('Không tìm thấy đặt phòng nào cho khách hàng');
          setError('Không tìm thấy đặt phòng nào cho khách hàng này.');
          setLoading(false);
          return;
        }

        // Kiểm tra xem bookingId có tồn tại trong danh sách bookings của khách hàng không
        const bookingExists = customerData.bookings.find(b => b && b.bookingID === bookingId);
        if (!bookingExists) {
          console.log(`Không tìm thấy đặt phòng ${bookingId} cho khách hàng này`);
          setError('Không tìm thấy đặt phòng.');
          setLoading(false);
          return;
        }

        // 2. Gọi API ../Bookings/{bookingID} để lấy thông tin chi tiết của booking
        let bookingData = null;
        try {
          console.log(`Đang lấy dữ liệu đặt phòng cho ${bookingId}...`);
          bookingData = await services.api.booking.fetchBookingById(bookingId);
          console.log(`Dữ liệu đặt phòng cho ${bookingId}:`, bookingData);
        } catch (bookingError) {
          console.error(`Lỗi khi lấy dữ liệu đặt phòng cho ${bookingId}:`, bookingError);
          setError('Không thể lấy dữ liệu đặt phòng.');
          setLoading(false);
          return;
        }

        if (!bookingData) {
          console.log(`Không tìm thấy dữ liệu đặt phòng cho ${bookingId}`);
          setError('Không tìm thấy đặt phòng.');
          setLoading(false);
          return;
        }

        // 3. Lấy bookingDetails từ dữ liệu booking
        const bookingDetails = bookingData.bookingDetails || [];
        const detail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;

        if (!detail || !detail.detailID) {
          console.log(`Không tìm thấy chi tiết hoặc detailID cho đặt phòng ${bookingId}`);
          setError('Không tìm thấy chi tiết đặt phòng.');
          setLoading(false);
          return;
        }

        // 4. Gọi API bookingDetails để lấy thông tin chi tiết
        let bookingDetailData = null;
        let roomId = detail.roomID || 'N/A';
        let roomTypeName = 'Phòng Tiêu Chuẩn';
        let roomTypeData = null;

        try {
          console.log(`Đang lấy dữ liệu chi tiết đặt phòng cho detailID ${detail.detailID}...`);
          bookingDetailData = await services.api.booking.fetchBookingDetailById(detail.detailID);
          console.log(`Dữ liệu chi tiết đặt phòng cho ${detail.detailID}:`, bookingDetailData);

          if (!bookingDetailData || !bookingDetailData.room) {
            console.log(`Không tìm thấy dữ liệu chi tiết hoặc phòng cho detailID ${detail.detailID}, sử dụng giá trị dự phòng`);
            roomId = bookingDetailData?.roomID || detail.roomID || 'N/A';
          } else {
            roomId = bookingDetailData.roomID || 'N/A';
            const rTypeID = bookingDetailData.room.rTypeID;

            if (rTypeID) {
              const roomTypes = await getRoomTypes();
              const roomType = roomTypes.find(type => type.rTypeID === rTypeID);
              if (roomType && roomType.typeName) {
                roomTypeName = roomType.typeName.replace('_', ' ');
                // Dịch tên loại phòng sang tiếng Việt
                roomTypeName = roomTypeName === 'Standard Room' ? 'Phòng Tiêu Chuẩn' :
                               roomTypeName === 'Deluxe Room' ? 'Phòng Cao Cấp' :
                               roomTypeName === 'Family Room' ? 'Phòng Gia Đình' :
                               roomTypeName === 'Suite Room' ? 'Phòng Suite' :
                               roomTypeName === 'Executive Suite' ? 'Căn Hộ Hạng Sang' :
                               roomTypeName === 'Presidential Suite' ? 'Căn Hộ Tổng Thống' : roomTypeName;
                roomTypeData = roomType;
              } else {
                console.log(`Không tìm thấy loại phòng cho rTypeID ${rTypeID}, sử dụng giá trị dự phòng`);
              }
            }
          }
        } catch (detailError) {
          console.error(`Lỗi khi lấy chi tiết đặt phòng cho ${detail.detailID}:`, detailError);
          if (roomId !== 'N/A') {
            const roomIdPrefix = roomId.substring(0, 3).toUpperCase();
            if (roomIdPrefix === 'STD') roomTypeName = 'Phòng Tiêu Chuẩn';
            else if (roomIdPrefix === 'DEL') roomTypeName = 'Phòng Cao Cấp';
            else if (roomIdPrefix === 'FAM') roomTypeName = 'Phòng Gia Đình';
            else if (roomIdPrefix === 'SUI') roomTypeName = 'Phòng Suite';
            else if (roomIdPrefix === 'EXE') roomTypeName = 'Căn Hộ Hạng Sang';
            else if (roomIdPrefix === 'PRE') roomTypeName = 'Căn Hộ Tổng Thống';
          }
        }

        // Xác định trạng thái booking
        let status = 'pending';
        if (bookingData.bookingStatus) {
          status = bookingData.bookingStatus.toLowerCase();
        }

        // Tính số đêm
        const checkInDate = new Date(detail.checkinDate);
        const checkOutDate = new Date(detail.checkoutDate);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // Tạo timeline
        const timeline = [
          {
            date: bookingData.bookingTime || new Date().toISOString(),
            text: 'Đặt phòng đã được tạo',
            icon: 'FaCalendarAlt'
          }
        ];

        if (bookingData.paymentStatus) {
          timeline.push({
            date: bookingData.bookingTime || new Date().toISOString(),
            text: 'Thanh toán đã được xác nhận',
            icon: 'FaDollarSign'
          });
        }

        // Tạo đối tượng booking để hiển thị
        const processedBooking = {
          id: bookingData.bookingID,
          roomId: roomId,
          roomName: roomTypeName,
          roomType: roomTypeData?.typeName || roomTypeName,
          checkInDate: detail.checkinDate,
          checkInTime: '14:00', // Mặc định
          checkOutDate: detail.checkoutDate,
          checkOutTime: '12:00', // Mặc định
          guests: roomTypeData?.maxGuests || 2,
          price: detail.pricePerDay || bookingData.totalAmount / nights || 0,
          nights: nights || 1,
          total: bookingData.totalAmount || 0,
          status: status,
          paymentMethod: bookingData.payment?.method || 'Thẻ Tín Dụng',
          paymentStatus: bookingData.paymentStatus ? 'Đã Thanh Toán' : 'Đang Chờ',
          bookingDate: bookingData.bookingTime,
          primaryGuest: {
            fullName: customerData?.cName || 'Khách',
            email: customerData?.email || 'guest@example.com',
            phone: customerData?.phone || 'N/A',
            address: customerData?.address || 'N/A',
            idCard: customerData?.idCard || 'N/A',
            dob: customerData?.dob || new Date().toISOString(),
            gender: customerData?.gender || 'N/A'
          },
          companions: detail.guest_BDetails?.filter(g => g.guestID !== customerData?.customerID).map(g => ({
            fullName: g.guestInfo?.firstName + ' ' + g.guestInfo?.lastName || 'Khách',
            idCard: g.guestInfo?.idCard || 'N/A',
            dob: g.guestInfo?.dob || new Date().toISOString(),
            gender: g.guestInfo?.gender || 'N/A'
          })) || [],
          specialRequests: detail.specialRequests || '',
          timeline: timeline
        };

        console.log('Đặt phòng đã xử lý:', processedBooking);
        setBooking(processedBooking);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết đặt phòng:', err);
        setError('Không thể tải chi tiết đặt phòng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, currentUser]);

  // Xử lý hủy đặt phòng
  const handleCancelBooking = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      return;
    }

    try {
      setCancelLoading(true);

      // Gọi API để hủy đặt phòng
      await services.api.booking.cancelBooking(bookingId);

      // Cập nhật trạng thái đặt phòng
      setBooking(prev => ({
        ...prev,
        status: 'cancelled',
        timeline: [
          ...prev.timeline,
          {
            date: new Date().toISOString(),
            text: 'Đặt phòng đã bị hủy',
            icon: 'FaTimesCircle'
          }
        ]
      }));

      setCancelSuccess(true);
      setCancelLoading(false);
    } catch (err) {
      console.error('Lỗi khi hủy đặt phòng:', err);
      setError('Không thể hủy đặt phòng. Vui lòng thử lại.');
      setCancelLoading(false);
    }
  };

  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Format trạng thái
  const formatStatus = (status) => {
    return status === 'confirmed' ? 'Đã Xác Nhận' :
           status === 'pending' ? 'Đang Chờ' :
           status === 'completed' ? 'Đã Hoàn Thành' :
           status === 'cancelled' ? 'Đã Hủy' : 'Đang Chờ';
  };

  // Hiển thị icon cho timeline
  const getTimelineIcon = (iconName) => {
    switch (iconName) {
      case 'FaCalendarAlt':
        return <FaCalendarAlt />;
      case 'FaDollarSign':
        return <FaDollarSign />;
      case 'FaCheckCircle':
        return <FaCheckCircle />;
      case 'FaTimesCircle':
        return <FaTimesCircle />;
      default:
        return <FaCalendarAlt />;
    }
  };

  return (
    <div className="container">
      <div className="booking-detail-page">
        <div className="page-header">
          <div className="header-content">
            <button 
              className="back-button" 
              onClick={() => navigate('/my-bookings')}
            >
              <FaArrowLeft /> Quay Lại Đặt Phòng Của Tôi
            </button>
            <h1>Chi Tiết Đặt Phòng</h1>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Đang tải chi tiết đặt phòng...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FaExclamationTriangle />
            <h3>Lỗi khi tải chi tiết đặt phòng</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Thử Lại
            </button>
          </div>
        ) : booking ? (
          <div className="booking-detail-content">
            {/* Thông báo hủy thành công */}
            {cancelSuccess && (
              <div className="success-message">
                <FaCheckCircle />
                <p>Hủy đặt phòng thành công!</p>
              </div>
            )}

            {/* Thông tin cơ bản */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Thông Tin Đặt Phòng</h2>
              </div>
              
              <div className="detail-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaHashtag className="booking-icon" />
                    <span className="booking-detail-label">Mã Đặt Phòng:</span>
                    <span>{booking.id}</span>
                  </div>
                  <div className="booking-detail">
                    <FaCalendarAlt className="booking-icon" />
                    <span className="booking-detail-label">Ngày Đặt Phòng:</span>
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Phương Thức Thanh Toán:</span>
                    <span>{booking.paymentMethod}</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Trạng Thái Thanh Toán:</span>
                    <span>{booking.paymentStatus}</span>
                  </div>
                  <div className="booking-detail">
                    <FaInfoCircle className="booking-icon" />
                    <span className="booking-detail-label">Trạng Thái:</span>
                    <span>{formatStatus(booking.status)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin phòng */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Thông Tin Phòng</h2>
              </div>
              
              <div className="detail-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaBed className="booking-icon" />
                    <span className="booking-detail-label">Tên Phòng:</span>
                    <span>{booking.roomName.toUpperCase()}</span>
                  </div>
                  <div className="booking-detail">
                    <FaBed className="booking-icon" />
                    <span className="booking-detail-label">Mã Phòng:</span>
                    <span>{booking.roomId}</span>
                  </div>
                  <div className="booking-detail">
                    <FaUsers className="booking-icon" />
                    <span className="booking-detail-label">Số Khách:</span>
                    <span>{booking.guests}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin lịch trình */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Thông Tin Lưu Trú</h2>
              </div>
              
              <div className="detail-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaCalendarAlt className="booking-icon" />
                    <span className="booking-detail-label">Nhận Phòng:</span>
                    <span>{formatDate(booking.checkInDate)} lúc {booking.checkInTime}</span>
                  </div>
                  <div className="booking-detail">
                    <FaCalendarAlt className="booking-icon" />
                    <span className="booking-detail-label">Trả Phòng:</span>
                    <span>{formatDate(booking.checkOutDate)} lúc {booking.checkOutTime}</span>
                  </div>
                  <div className="booking-detail">
                    <FaClock className="booking-icon" />
                    <span className="booking-detail-label">Thời Gian Lưu Trú:</span>
                    <span>{booking.nights} đêm</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Giá Mỗi Đêm:</span>
                    <span>{services.utils.format.formatCurrency(booking.price)}</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Tổng Số Tiền:</span>
                    <span>{services.utils.format.formatCurrency(booking.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Thông Tin Khách Hàng</h2>
              </div>
              
              <div className="detail-body">
                <h3>Khách Chính</h3>
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaUser className="booking-icon" />
                    <span className="booking-detail-label">Họ và Tên:</span>
                    <span>{booking.primaryGuest.fullName}</span>
                  </div>
                  <div className="booking-detail">
                    <FaEnvelope className="booking-icon" />
                    <span className="booking-detail-label">Email:</span>
                    <span>{booking.primaryGuest.email}</span>
                  </div>
                  <div className="booking-detail">
                    <FaPhone className="booking-icon" />
                    <span className="booking-detail-label">Số Điện Thoại:</span>
                    <span>{booking.primaryGuest.phone}</span>
                  </div>
                  <div className="booking-detail">
                    <FaIdCard className="booking-icon" />
                    <span className="booking-detail-label">CMND/CCCD:</span>
                    <span>{booking.primaryGuest.idCard}</span>
                  </div>
                  <div className="booking-detail">
                    <FaMapMarkerAlt className="booking-icon" />
                    <span className="booking-detail-label">Địa Chỉ:</span>
                    <span>{booking.primaryGuest.address}</span>
                  </div>
                </div>
                
                {booking.companions && booking.companions.length > 0 && (
                  <>
                    <h3>Khách Đi Cùng</h3>
                    {booking.companions.map((companion, index) => (
                      <div key={index} className="companion-info">
                        <div className="booking-details">
                          <div className="booking-detail">
                            <FaUser className="booking-icon" />
                            <span className="booking-detail-label">Họ và Tên:</span>
                            <span>{companion.fullName}</span>
                          </div>
                          <div className="booking-detail">
                            <FaIdCard className="booking-icon" />
                            <span className="booking-detail-label">CMND/CCCD:</span>
                            <span>{companion.idCard}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {booking.specialRequests && (
                  <>
                    <h3>Yêu Cầu Đặc Biệt</h3>
                    <div className="special-requests">
                      <p>{booking.specialRequests}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Lịch Sử Đặt Phòng</h2>
              </div>
              
              <div className="detail-body">
                <div className="timeline">
                  {booking.timeline.map((event, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-icon">
                        {getTimelineIcon(event.icon)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-date">{formatDate(event.date)}</div>
                        <div className="timeline-text">{event.text}</div>
                      </div>
                    </div>
                  ))}
                  
                  {booking.status === 'cancelled' && !booking.timeline.some(event => event.text === 'Booking cancelled') && (
                    <div className="timeline-item">
                      <div className="timeline-icon">
                        <FaTimesCircle />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-date">{formatDate(new Date())}</div>
                        <div className="timeline-text">Đặt phòng đã bị hủy</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="booking-actions">
              <Link 
                to={`/rooms/${booking.roomId}`} 
                className="btn-primary"
              >
                Xem Phòng
              </Link>
              
              {booking.status === 'confirmed' && !cancelSuccess && (
                <button 
                  className="btn-danger"
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <FaSpinner className="loading-spinner" />
                      Đang hủy...
                    </>
                  ) : (
                    'Hủy Đặt Phòng'
                  )}
                </button>
              )}
              
              {booking.status === 'completed' && (
                <Link 
                  to={`/rooms/${booking.roomId}`} 
                  className="btn-primary"
                >
                  Đặt Lại
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="error-container">
            <FaExclamationTriangle />
            <h3>Không tìm thấy đặt phòng</h3>
            <p>Đặt phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/my-bookings" className="btn-primary">
              Quay Lại Đặt Phòng Của Tôi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingDetailPage;