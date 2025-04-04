import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { services } from '../services';
import {
  FaSearch,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaHashtag
} from 'react-icons/fa';
import '../styles/MyBookingsPage.css';

function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Cache cho roomTypes để giảm API calls
  let roomTypesCache = null;
  const getRoomTypes = async () => {
    if (roomTypesCache) return roomTypesCache;
    const roomTypes = await services.api.room.fetchRoomTypes();
    roomTypesCache = roomTypes;
    return roomTypes;
  };

  // Lấy dữ liệu đặt phòng từ API
  useEffect(() => {
    const fetchBookingsData = async () => {
      if (!currentUser) {
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
          setBookings([]);
          setFilteredBookings([]);
          setLoading(false);
          return;
        }

        // Lấy thông tin chi tiết cho mỗi booking
        const processedBookings = [];

        for (const booking of customerData.bookings) {
          // Bỏ qua các booking null
          if (!booking) {
            console.log('Skipping null booking');
            continue;
          }

          console.log(`Processing booking: ${booking.bookingID}`);

          // 2. Gọi API ../Bookings/{bookingID} để lấy thông tin chi tiết của booking
          let bookingData = null;
          try {
            console.log(`Fetching booking data for ${booking.bookingID}...`);
            bookingData = await services.api.booking.fetchBookingById(booking.bookingID);
            console.log(`Booking data for ${booking.bookingID}:`, bookingData);
          } catch (bookingError) {
            console.error(`Error fetching booking data for ${booking.bookingID}:`, bookingError);
            continue;
          }

          if (!bookingData) {
            console.log(`No booking data found for ${booking.bookingID}, skipping this booking`);
            continue;
          }

          // 3. Lấy bookingDetails từ dữ liệu booking
          const bookingDetails = bookingData.bookingDetails || [];
          const detail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;

          if (!detail || !detail.detailID) {
            console.log(`No details or detailID found for booking ${booking.bookingID}, skipping this booking`);
            continue;
          }

          // 4. Gọi API bookingDetails để lấy thông tin chi tiết
          let bookingDetailData = null;
          let roomId = detail.roomID || 'N/A';
          let roomTypeName = 'Standard Room'; // Giá trị mặc định

          try {
            console.log(`Fetching booking detail data for detailID ${detail.detailID}...`);
            bookingDetailData = await services.api.booking.fetchBookingDetailById(detail.detailID);
            console.log(`Booking detail data for ${detail.detailID}:`, bookingDetailData);

            if (!bookingDetailData || !bookingDetailData.room) {
              console.log(`No detailed data or room found for detailID ${detail.detailID}, using fallback`);
              // Sử dụng roomID từ bookingDetails nếu có
              roomId = bookingDetailData?.roomID || detail.roomID || 'N/A';
            } else {
              roomId = bookingDetailData.roomID || 'N/A';
              const rTypeID = bookingDetailData.room.rTypeID;

              if (rTypeID) {
                // 5. Lấy thông tin loại phòng
                const roomTypes = await getRoomTypes();
                const roomType = roomTypes.find(type => type.rTypeID === rTypeID);
                if (roomType && roomType.typeName) {
                  roomTypeName = roomType.typeName.replace('_', ' ');
                } else {
                  console.log(`Room type not found for rTypeID ${rTypeID}, using fallback`);
                }
              }
            }
          } catch (detailError) {
            console.error(`Error fetching booking detail for ${detail.detailID}:`, detailError);
            // Fallback dựa trên roomID prefix nếu có
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

          // Tạo đối tượng booking để hiển thị
          processedBookings.push({
            id: bookingData.bookingID,
            roomId: roomId,
            roomName: roomTypeName,
            checkInDate: detail.checkinDate || bookingData.bookingTime,
            checkOutDate: detail.checkoutDate || bookingData.bookingTime,
            total: bookingData.totalAmount || 0,
            status: status,
          });
        }

        console.log('Final processed bookings:', processedBookings);
        setBookings(processedBookings);
        setFilteredBookings(processedBookings);

      } catch (err) {
        console.error('Error fetching bookings data:', err);
        setError('Failed to load your bookings. Please try again later.');
        setBookings([]);
        setFilteredBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsData();
  }, [currentUser]);

  // Lọc đặt phòng dựa trên bộ lọc và tìm kiếm
  useEffect(() => {
    let result = [...bookings];

    // Lọc theo trạng thái
    if (activeFilter !== 'all') {
      result = result.filter(booking => booking.status === activeFilter);
    }

    // Lọc theo tìm kiếm
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(booking =>
        booking.roomName.toLowerCase().includes(search) ||
        booking.id.toLowerCase().includes(search) ||
        booking.roomId.toLowerCase().includes(search)
      );
    }

    setFilteredBookings(result);
    setCurrentPage(1); // Reset về trang đầu tiên khi lọc
  }, [bookings, activeFilter, searchTerm]);

  // Xử lý hủy đặt phòng
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setLoading(true);

      // Gọi API để hủy đặt phòng
      await services.api.booking.cancelBooking(bookingId);

      // Cập nhật trạng thái đặt phòng thành 'cancelled'
      const updatedBookings = bookings.map(booking => {
        if (booking.id === bookingId) {
          return { ...booking, status: 'cancelled' };
        }
        return booking;
      });

      setBookings(updatedBookings);
      setFilteredBookings(updatedBookings.filter(booking =>
        activeFilter === 'all' || booking.status === activeFilter
      ));

      setLoading(false);

      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
      setLoading(false);

      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Your Bookings</h1>
          <p>Manage and view all your bookings</p>
        </div>
      </div>

      <div className="container">
        <section className="booking-section">
          {/* Bộ lọc và tìm kiếm */}
          <div className="booking-filters">
            <div className="filter-group">
              <button
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-button ${activeFilter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={`filter-button ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-button ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed
              </button>
              <button
                className={`filter-button ${activeFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>

            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Hiển thị loading */}
          {loading && (
            <div className="loading-container">
              <FaSpinner className="loading-spinner" />
              <p>Loading your bookings...</p>
            </div>
          )}

          {/* Hiển thị lỗi */}
          {error && (
            <div className="error-container">
              <FaExclamationTriangle />
              <h3>Error loading bookings</h3>
              <p>{error}</p>
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Danh sách đặt phòng */}
          {!loading && !error && currentItems.length === 0 ? (
            <div className="empty-state">
              <h3>No bookings found</h3>
              <p>You don't have any bookings matching your criteria.</p>
              <Link to="/rooms" className="booking-button btn-outline">Browse Rooms</Link>
            </div>
          ) : !loading && !error && (
            <div className="rooms-grid">
              {currentItems.map((booking) => (
                <div className="room-card" key={booking.id}>
                  <div
                    className="related-room-image2"
                    style={{ backgroundImage: `url(${booking.roomImage})` }}
                  >
                    <div className={`booking-status-badge status-${booking.status || 'pending'}`}>
                      {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                    </div>
                  </div>

                  <div className="booking-info">
                    {/* Tên phòng */}
                    <h3 className="booking-name">
                      {booking.roomName}
                    </h3>

                    {/* Mã phòng */}
                    <div className="booking-detail">
                      <FaBed className="booking-icon" />
                      <span className="booking-detail-label">Room ID:</span>
                      <span>{booking.roomId}</span>
                    </div>

                    {/* Mã booking */}
                    <div className="booking-detail">
                      <FaHashtag className="booking-icon" />
                      <span className="booking-detail-label">Booking ID:</span>
                      <span>{booking.id}</span>
                    </div>

                    {/* Thời gian */}
                    <div className="booking-dates">
                      <div>
                        <FaCalendarAlt className="booking-icon" />
                        <span>Check-in: {formatDate(booking.checkInDate)}</span>
                      </div>
                      <div>
                        <FaCalendarAlt className="booking-icon" />
                        <span>Check-out: {formatDate(booking.checkOutDate)}</span>
                      </div>
                    </div>

                    {/* Số tiền */}
                    <div className="booking-detail">
                      <FaDollarSign className="booking-icon" />
                      <span className="booking-detail-label">Total Amount:</span>
                      <span>${booking.total}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <Link
                      to={`/my-bookings/${booking.id}`}
                      className="btn-outline"
                    >
                      <FaEye /> View Details
                    </Link>

                    {booking.status === 'completed' && (
                      <Link
                        to={`/rooms/${booking.roomId}`}
                        className="booking-button btn-secondary"
                      >
                        <FaCheck /> Book Again
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default MyBookingsPage;