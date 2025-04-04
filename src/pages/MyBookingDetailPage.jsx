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
        console.log('Fetching current customer data...');
        const customerData = await services.api.customer.fetchCurrentCustomer();
        console.log('Customer data received:', customerData);

        if (!customerData || !customerData.bookings || customerData.bookings.length === 0) {
          console.log('No bookings found for customer');
          setError('No bookings found for this customer.');
          setLoading(false);
          return;
        }

        // Kiểm tra xem bookingId có tồn tại trong danh sách bookings của khách hàng không
        const bookingExists = customerData.bookings.find(b => b && b.bookingID === bookingId);
        if (!bookingExists) {
          console.log(`Booking ${bookingId} not found for this customer`);
          setError('Booking not found.');
          setLoading(false);
          return;
        }

        // 2. Gọi API ../Bookings/{bookingID} để lấy thông tin chi tiết của booking
        let bookingData = null;
        try {
          console.log(`Fetching booking data for ${bookingId}...`);
          bookingData = await services.api.booking.fetchBookingById(bookingId);
          console.log(`Booking data for ${bookingId}:`, bookingData);
        } catch (bookingError) {
          console.error(`Error fetching booking data for ${bookingId}:`, bookingError);
          setError('Failed to fetch booking data.');
          setLoading(false);
          return;
        }

        if (!bookingData) {
          console.log(`No booking data found for ${bookingId}`);
          setError('Booking not found.');
          setLoading(false);
          return;
        }

        // 3. Lấy bookingDetails từ dữ liệu booking
        const bookingDetails = bookingData.bookingDetails || [];
        const detail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;

        if (!detail || !detail.detailID) {
          console.log(`No details or detailID found for booking ${bookingId}`);
          setError('Booking details not found.');
          setLoading(false);
          return;
        }

        // 4. Gọi API bookingDetails để lấy thông tin chi tiết
        let bookingDetailData = null;
        let roomId = detail.roomID || 'N/A';
        let roomTypeName = 'Standard Room';
        let roomTypeData = null;

        try {
          console.log(`Fetching booking detail data for detailID ${detail.detailID}...`);
          bookingDetailData = await services.api.booking.fetchBookingDetailById(detail.detailID);
          console.log(`Booking detail data for ${detail.detailID}:`, bookingDetailData);

          if (!bookingDetailData || !bookingDetailData.room) {
            console.log(`No detailed data or room found for detailID ${detail.detailID}, using fallback`);
            roomId = bookingDetailData?.roomID || detail.roomID || 'N/A';
          } else {
            roomId = bookingDetailData.roomID || 'N/A';
            const rTypeID = bookingDetailData.room.rTypeID;

            if (rTypeID) {
              const roomTypes = await getRoomTypes();
              const roomType = roomTypes.find(type => type.rTypeID === rTypeID);
              if (roomType && roomType.typeName) {
                roomTypeName = roomType.typeName.replace('_', ' ');
                roomTypeData = roomType;
              } else {
                console.log(`Room type not found for rTypeID ${rTypeID}, using fallback`);
              }
            }
          }
        } catch (detailError) {
          console.error(`Error fetching booking detail for ${detail.detailID}:`, detailError);
          if (roomId !== 'N/A') {
            const roomIdPrefix = roomId.substring(0, 3).toUpperCase();
            if (roomIdPrefix === 'STD') roomTypeName = 'Standard Room';
            else if (roomIdPrefix === 'DEL') roomTypeName = 'Deluxe Room';
            else if (roomIdPrefix === 'FAM') roomTypeName = 'Family Room';
            else if (roomIdPrefix === 'SUI') roomTypeName = 'Suite Room';
            else if (roomIdPrefix === 'EXE') roomTypeName = 'Executive Suite';
            else if (roomIdPrefix === 'PRE') roomTypeName = 'Presidential Suite';
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
          paymentMethod: bookingData.payment?.method || 'Credit Card',
          paymentStatus: bookingData.paymentStatus ? 'Paid' : 'Pending',
          bookingDate: bookingData.bookingTime,
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

  // Format trạng thái
  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
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
              </div>
              
              <div className="detail-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaHashtag className="booking-icon" />
                    <span className="booking-detail-label">Booking ID:</span>
                    <span>{booking.id}</span>
                  </div>
                  <div className="booking-detail">
                    <FaCalendarAlt className="booking-icon" />
                    <span className="booking-detail-label">Booking Date:</span>
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Payment Method:</span>
                    <span>{booking.paymentMethod}</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Payment Status:</span>
                    <span>{booking.paymentStatus}</span>
                  </div>
                  <div className="booking-detail">
                    <FaInfoCircle className="booking-icon" />
                    <span className="booking-detail-label">Status:</span>
                    <span>{formatStatus(booking.status)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin phòng */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Room Information</h2>
              </div>
              
              <div className="detail-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaBed className="booking-icon" />
                    <span className="booking-detail-label">Room Name:</span>
                    <span>{booking.roomName.toUpperCase()}</span>
                  </div>
                  <div className="booking-detail">
                    <FaBed className="booking-icon" />
                    <span className="booking-detail-label">Room ID:</span>
                    <span>{booking.roomId}</span>
                  </div>
                  <div className="booking-detail">
                    <FaUsers className="booking-icon" />
                    <span className="booking-detail-label">Guests:</span>
                    <span>{booking.guests}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin lịch trình */}
            <div className="detail-card">
              <div className="detail-header">
                <h2>Stay Information</h2>
              </div>
              
              <div className="detail-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaCalendarAlt className="booking-icon" />
                    <span className="booking-detail-label">Check-in:</span>
                    <span>{formatDate(booking.checkInDate)} at {booking.checkInTime}</span>
                  </div>
                  <div className="booking-detail">
                    <FaCalendarAlt className="booking-icon" />
                    <span className="booking-detail-label">Check-out:</span>
                    <span>{formatDate(booking.checkOutDate)} at {booking.checkOutTime}</span>
                  </div>
                  <div className="booking-detail">
                    <FaClock className="booking-icon" />
                    <span className="booking-detail-label">Duration:</span>
                    <span>{booking.nights} nights</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Price per night:</span>
                    <span>${booking.price}</span>
                  </div>
                  <div className="booking-detail">
                    <FaDollarSign className="booking-icon" />
                    <span className="booking-detail-label">Total Amount:</span>
                    <span>${booking.total}</span>
                  </div>
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
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaUser className="booking-icon" />
                    <span className="booking-detail-label">Full Name:</span>
                    <span>{booking.primaryGuest.fullName}</span>
                  </div>
                  <div className="booking-detail">
                    <FaEnvelope className="booking-icon" />
                    <span className="booking-detail-label">Email:</span>
                    <span>{booking.primaryGuest.email}</span>
                  </div>
                  <div className="booking-detail">
                    <FaPhone className="booking-icon" />
                    <span className="booking-detail-label">Phone:</span>
                    <span>{booking.primaryGuest.phone}</span>
                  </div>
                  <div className="booking-detail">
                    <FaIdCard className="booking-icon" />
                    <span className="booking-detail-label">ID Card:</span>
                    <span>{booking.primaryGuest.idCard}</span>
                  </div>
                  <div className="booking-detail">
                    <FaMapMarkerAlt className="booking-icon" />
                    <span className="booking-detail-label">Address:</span>
                    <span>{booking.primaryGuest.address}</span>
                  </div>
                </div>
                
                {booking.companions && booking.companions.length > 0 && (
                  <>
                    <h3>Accompanying Guests</h3>
                    {booking.companions.map((companion, index) => (
                      <div key={index} className="companion-info">
                        <div className="booking-details">
                          <div className="booking-detail">
                            <FaUser className="booking-icon" />
                            <span className="booking-detail-label">Full Name:</span>
                            <span>{companion.fullName}</span>
                          </div>
                          <div className="booking-detail">
                            <FaIdCard className="booking-icon" />
                            <span className="booking-detail-label">ID Card:</span>
                            <span>{companion.idCard}</span>
                          </div>
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
                  className="btn-primary"
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