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
          console.log(`Processing booking: ${booking.bookingID}`);
          
          try {
            // Lấy thông tin chi tiết booking
            const bookingDetails = await services.api.booking.fetchBookingDetails(booking.bookingID);
            console.log(`Booking details for ${booking.bookingID}:`, bookingDetails);
            
            // Lấy booking detail đầu tiên (nếu có)
            const detail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;
            
            if (!detail) {
              console.log(`No details found for booking ${booking.bookingID}, using fallback data`);
              // Fallback nếu không có chi tiết
              processedBookings.push({
                id: booking.bookingID,
                roomId: 'N/A',
                roomName: 'Unknown Room',
                checkInDate: booking.bookingTime,
                checkOutDate: booking.bookingTime,
                total: booking.totalAmount || 0,
                status: booking.bookingStatus?.toLowerCase() || 'pending',
                roomImage: '/images/Rooms/standard-room-1.jpg'
              });
              continue;
            }
            
            // Lấy thông tin phòng - thử nhiều cách khác nhau để đảm bảo lấy được dữ liệu
            console.log(`Fetching room data for room ${detail.roomID}...`);
            let roomData = null;
            let roomTypeName = 'Standard Room'; // Giá trị mặc định tốt hơn
            let roomTypeId = null;
            
            try {
              // Cách 1: Lấy trực tiếp từ API phòng
              roomData = await services.api.room.fetchRoomById(detail.roomID);
              console.log(`Room data for ${detail.roomID}:`, roomData);
              
              if (roomData) {
                roomTypeId = roomData.rTypeID;
                
                // Cách 2: Lấy thông tin loại phòng
                if (roomTypeId) {
                  const roomTypes = await services.api.room.fetchRoomTypes();
                  const roomType = roomTypes.find(type => type.rTypeID === roomTypeId);
                  if (roomType && roomType.typeName) {
                    roomTypeName = roomType.typeName.replace('_', ' ');
                  }
                }
              } else {
                // Cách 3: Thử lấy thông tin từ booking detail
                if (detail.roomType) {
                  roomTypeName = detail.roomType;
                } else if (booking.roomType) {
                  roomTypeName = booking.roomType;
                }
              }
            } catch (roomError) {
              console.error(`Error fetching room data for ${detail.roomID}:`, roomError);
              
              // Cách 4: Nếu tất cả đều thất bại, sử dụng dữ liệu cứng dựa trên roomID
              const roomIdPrefix = detail.roomID.substring(0, 3).toUpperCase();
              if (roomIdPrefix === 'STD') roomTypeName = 'Standard Room';
              else if (roomIdPrefix === 'DEL') roomTypeName = 'Deluxe Room';
              else if (roomIdPrefix === 'FAM') roomTypeName = 'Family Room';
              else if (roomIdPrefix === 'SUI') roomTypeName = 'Suite Room';
              else if (roomIdPrefix === 'EXE') roomTypeName = 'Executive Suite';
              else if (roomIdPrefix === 'PRE') roomTypeName = 'Presidential Suite';
            }
            
            // Xác định trạng thái booking
            let status = 'pending';
            if (booking.bookingStatus) {
              status = booking.bookingStatus.toLowerCase();
            }
            
            // Tạo đối tượng booking để hiển thị
            processedBookings.push({
              id: booking.bookingID,
              roomId: detail.roomID || 'N/A',
              roomName: roomTypeName,
              checkInDate: detail.checkinDate || booking.bookingTime,
              checkOutDate: detail.checkoutDate || booking.bookingTime,
              total: booking.totalAmount || 0,
              status: status,
              roomImage: `/images/Rooms/${roomTypeName.toLowerCase().replace(/\s+/g, '-')}-1.jpg`
            });
            
          } catch (bookingError) {
            console.error(`Error processing booking ${booking.bookingID}:`, bookingError);
            // Thêm booking với dữ liệu tối thiểu nếu xử lý thất bại
            processedBookings.push({
              id: booking.bookingID,
              roomId: 'N/A',
              roomName: 'Unknown Room',
              checkInDate: booking.bookingTime,
              checkOutDate: booking.bookingTime,
              total: booking.totalAmount || 0,
              status: booking.bookingStatus?.toLowerCase() || 'pending',
              roomImage: '/images/Rooms/standard-room-1.jpg'
            });
          }
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
              <Link to="/rooms" className="booking-button btn-primary">Browse Rooms</Link>
            </div>
          ) : !loading && !error && (
            <div className="rooms-grid">
              {currentItems.map((booking) => (
                <div className="room-card" key={booking.id}>
                  <div 
                    className="related-room-image" 
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
                      className="booking-button btn-primary"
                    >
                      <FaEye /> View Details
                    </Link>
                    
                    {booking.status === 'confirmed' && (
                      <button 
                        className="booking-button btn-danger"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}
                    
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
