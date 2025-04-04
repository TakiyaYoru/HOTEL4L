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
  FaUsers
} from 'react-icons/fa';
import '../styles/BookingDetailPage.css'; // CSS riêng cho trang chi tiết đặt phòng

function MyBookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

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

        // 1. Lấy thông tin booking cơ bản
        console.log(`Fetching booking data for ID: ${bookingId}`);
        const bookingData = await services.api.booking.fetchBookingById(bookingId);
        console.log('Booking data received:', bookingData);

        if (!bookingData) {
          setError('Booking not found');
          setLoading(false);
          return;
        }

        // 2. Lấy chi tiết booking
        console.log(`Fetching booking details for ID: ${bookingId}`);
        const bookingDetails = await services.api.booking.fetchBookingDetails(bookingId);
        console.log('Booking details received:', bookingDetails);

        // Lấy booking detail đầu tiên (nếu có)
        const detail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;

        if (!detail) {
          setError('Booking details not found');
          setLoading(false);
          return;
        }

        // 3. Lấy thông tin phòng - thử nhiều cách khác nhau để đảm bảo lấy được dữ liệu
        console.log(`Fetching room data for ID: ${detail.roomID}`);
        let roomData = null;
        let roomTypeName = 'Standard Room'; // Giá trị mặc định tốt hơn
        let roomTypeData = null;
        
        try {
          // Cách 1: Lấy trực tiếp từ API phòng
          roomData = await services.api.room.fetchRoomById(detail.roomID);
          console.log('Room data received:', roomData);
          
          if (roomData) {
            // Cách 2: Lấy thông tin loại phòng từ roomData
            if (roomData.rTypeID) {
              console.log(`Fetching room type data for ID: ${roomData.rTypeID}`);
              const roomTypes = await services.api.room.fetchRoomTypes();
              roomTypeData = roomTypes.find(type => type.rTypeID === roomData.rTypeID);
              if (roomTypeData && roomTypeData.typeName) {
                roomTypeName = roomTypeData.typeName.replace('_', ' ');
              }
            }
          } else {
            // Cách 3: Thử lấy thông tin từ booking detail
            if (detail.roomType) {
              roomTypeName = detail.roomType;
            } else if (bookingData.roomType) {
              roomTypeName = bookingData.roomType;
            }
          }
        } catch (roomError) {
          console.error(`Error fetching room data:`, roomError);
          
          // Cách 4: Nếu tất cả đều thất bại, sử dụng dữ liệu cứng dựa trên roomID
          const roomIdPrefix = detail.roomID.substring(0, 3).toUpperCase();
          if (roomIdPrefix === 'STD') roomTypeName = 'Standard Room';
          else if (roomIdPrefix === 'DEL') roomTypeName = 'Deluxe Room';
          else if (roomIdPrefix === 'FAM') roomTypeName = 'Family Room';
          else if (roomIdPrefix === 'SUI') roomTypeName = 'Suite Room';
          else if (roomIdPrefix === 'EXE') roomTypeName = 'Executive Suite';
          else if (roomIdPrefix === 'PRE') roomTypeName = 'Presidential Suite';
        }

        // 5. Lấy thông tin khách hàng
        console.log('Fetching customer data');
        const customerData = await services.api.customer.fetchCurrentCustomer();
        console.log('Customer data received:', customerData);

        // Tính số đêm
        const checkInDate = new Date(detail.checkinDate);
        const checkOutDate = new Date(detail.checkoutDate);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // Tạo timeline
        const timeline = [
          {
            date: bookingData.bookingTime || new Date().toISOString(),
            text: 'Booking created',
            icon: 'FaCalendarAlt'
          }
        ];

        if (bookingData.paymentStatus) {
          timeline.push({
            date: bookingData.bookingTime || new Date().toISOString(),
            text: 'Payment confirmed',
            icon: 'FaDollarSign'
          });
        }

        // Tạo đối tượng booking để hiển thị
        const processedBooking = {
          id: bookingData.bookingID,
          roomId: detail.roomID || 'N/A',
          roomName: roomTypeName,
          roomType: roomTypeData?.typeName || roomTypeName,
          checkInDate: detail.checkinDate,
          checkInTime: '14:00', // Mặc định
          checkOutDate: detail.checkoutDate,
          checkOutTime: '12:00', // Mặc định
          guests: roomData?.maxGuests || 2,
          price: detail.pricePerDay || bookingData.totalAmount / nights || 0,
          nights: nights || 1,
          total: bookingData.totalAmount || 0,
          status: bookingData.bookingStatus?.toLowerCase() || 'pending',
          paymentMethod: bookingData.payment?.method || 'Credit Card',
          paymentStatus: bookingData.paymentStatus ? 'Paid' : 'Pending',
          bookingDate: bookingData.bookingTime,
          roomImage: `/images/Rooms/${roomTypeName.toLowerCase().replace(/\s+/g, '-')}-1.jpg`,
          primaryGuest: {
            fullName: customerData?.cName || 'Guest',
            email: customerData?.email || 'guest@example.com',
            phone: customerData?.phone || 'N/A',
            address: customerData?.address || 'N/A',
            idCard: customerData?.idCard || 'N/A',
            dob: customerData?.dob || new Date().toISOString(),
            gender: customerData?.gender || 'N/A'
          },
          companions: detail.guest_BDetails?.filter(g => g.guestID !== customerData?.customerID).map(g => ({
            fullName: g.guestInfo?.firstName + ' ' + g.guestInfo?.lastName || 'Guest',
            idCard: g.guestInfo?.idCard || 'N/A',
            dob: g.guestInfo?.dob || new Date().toISOString(),
            gender: g.guestInfo?.gender || 'N/A'
          })) || [],
          specialRequests: detail.specialRequests || '',
          timeline: timeline
        };

        console.log('Processed booking:', processedBooking);
        setBooking(processedBooking);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking detail:', err);
        setError('Failed to load booking details. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId, currentUser]);

  // Xử lý hủy đặt phòng
  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
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
            text: 'Booking cancelled',
            icon: 'FaTimesCircle'
          }
        ]
      }));

      setCancelSuccess(true);
      setCancelLoading(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
      setCancelLoading(false);
    }
  };

  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Hiển thị trạng thái đặt phòng
  const renderBookingStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge status-confirmed">Confirmed</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge status-pending">Pending</span>;
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
              <FaArrowLeft /> Back to My Bookings
            </button>
            <h1>Booking Details</h1>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Loading booking details...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FaExclamationTriangle />
            <h3>Error loading booking details</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : booking ? (
          <div className="booking-detail-content">
            {/* Thông báo hủy thành công */}
            {cancelSuccess && (
              <div className="success-message">
                <FaCheckCircle />
                <p>Booking cancelled successfully!</p>
              </div>
            )}

            {/* Thông tin cơ bản */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Booking Information</h2>
                {renderBookingStatus(booking.status)}
              </div>
              
              <div className="detail-body">
                <div className="detail-row">
                  <div className="detail-label">
                    <FaCalendarAlt className="detail-icon" />
                    <span>Booking ID:</span>
                  </div>
                  <div className="detail-value">{booking.id}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaCalendarAlt className="detail-icon" />
                    <span>Booking Date:</span>
                  </div>
                  <div className="detail-value">{formatDate(booking.bookingDate)}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaDollarSign className="detail-icon" />
                    <span>Payment Method:</span>
                  </div>
                  <div className="detail-value">{booking.paymentMethod}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaDollarSign className="detail-icon" />
                    <span>Payment Status:</span>
                  </div>
                  <div className="detail-value">{booking.paymentStatus}</div>
                </div>
              </div>
            </div>

            {/* Thông tin phòng */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Room Information</h2>
              </div>
              
              <div className="detail-body">
                <div className="room-image-container">
                  <img 
                    src={booking.roomImage} 
                    alt={booking.roomName} 
                    className="room-detail-image" 
                  />
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaBed className="detail-icon" />
                    <span>Room Name:</span>
                  </div>
                  <div className="detail-value">{booking.roomName}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaBed className="detail-icon" />
                    <span>Room ID:</span>
                  </div>
                  <div className="detail-value">{booking.roomId}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaBed className="detail-icon" />
                    <span>Room Type:</span>
                  </div>
                  <div className="detail-value">{booking.roomType}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaUsers className="detail-icon" />
                    <span>Guests:</span>
                  </div>
                  <div className="detail-value">{booking.guests}</div>
                </div>
              </div>
            </div>

            {/* Thông tin lịch trình */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Stay Information</h2>
              </div>
              
              <div className="detail-body">
                <div className="detail-row">
                  <div className="detail-label">
                    <FaCalendarAlt className="detail-icon" />
                    <span>Check-in:</span>
                  </div>
                  <div className="detail-value">
                    {formatDate(booking.checkInDate)} at {booking.checkInTime}
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaCalendarAlt className="detail-icon" />
                    <span>Check-out:</span>
                  </div>
                  <div className="detail-value">
                    {formatDate(booking.checkOutDate)} at {booking.checkOutTime}
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaClock className="detail-icon" />
                    <span>Duration:</span>
                  </div>
                  <div className="detail-value">{booking.nights} nights</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaDollarSign className="detail-icon" />
                    <span>Price per night:</span>
                  </div>
                  <div className="detail-value">${booking.price}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaDollarSign className="detail-icon" />
                    <span>Total Amount:</span>
                  </div>
                  <div className="detail-value">${booking.total}</div>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Guest Information</h2>
              </div>
              
              <div className="detail-body">
                <h3>Primary Guest</h3>
                <div className="detail-row">
                  <div className="detail-label">
                    <FaUser className="detail-icon" />
                    <span>Full Name:</span>
                  </div>
                  <div className="detail-value">{booking.primaryGuest.fullName}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaEnvelope className="detail-icon" />
                    <span>Email:</span>
                  </div>
                  <div className="detail-value">{booking.primaryGuest.email}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaPhone className="detail-icon" />
                    <span>Phone:</span>
                  </div>
                  <div className="detail-value">{booking.primaryGuest.phone}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaIdCard className="detail-icon" />
                    <span>ID Card:</span>
                  </div>
                  <div className="detail-value">{booking.primaryGuest.idCard}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>Address:</span>
                  </div>
                  <div className="detail-value">{booking.primaryGuest.address}</div>
                </div>
                
                {booking.companions && booking.companions.length > 0 && (
                  <>
                    <h3>Accompanying Guests</h3>
                    {booking.companions.map((companion, index) => (
                      <div key={index} className="companion-info">
                        <div className="detail-row">
                          <div className="detail-label">
                            <FaUser className="detail-icon" />
                            <span>Full Name:</span>
                          </div>
                          <div className="detail-value">{companion.fullName}</div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-label">
                            <FaIdCard className="detail-icon" />
                            <span>ID Card:</span>
                          </div>
                          <div className="detail-value">{companion.idCard}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {booking.specialRequests && (
                  <>
                    <h3>Special Requests</h3>
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
                <h2>Booking Timeline</h2>
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
                        <div className="timeline-text">Booking cancelled</div>
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
                View Room
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
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Booking'
                  )}
                </button>
              )}
              
              {booking.status === 'completed' && (
                <Link 
                  to={`/rooms/${booking.roomId}`} 
                  className="btn-secondary"
                >
                  Book Again
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="error-container">
            <FaExclamationTriangle />
            <h3>Booking not found</h3>
            <p>The booking you are looking for does not exist or has been removed.</p>
            <Link to="/my-bookings" className="btn-primary">
              Back to My Bookings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingDetailPage;
