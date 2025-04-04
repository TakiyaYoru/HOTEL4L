import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { services } from '../services';
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaEye, 
  FaTimes, 
  FaCheck, 
  FaExclamationTriangle, 
  FaSpinner,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import '../styles/MyBookingsPage.css';

function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Lấy dữ liệu đặt phòng từ API
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) {
        setLoading(false);
        return; // Không gọi API nếu chưa đăng nhập
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Lấy thông tin khách hàng hiện tại (bao gồm bookings)
        const customerData = await services.api.customer.fetchCurrentCustomer();
        console.log('Customer data:', customerData);
        
        if (!customerData || !customerData.bookings || customerData.bookings.length === 0) {
          // Nếu không có booking nào
          setBookings([]);
          setFilteredBookings([]);
          setLoading(false);
          return;
        }
        
        // Xử lý dữ liệu bookings
        const bookingsWithDetails = await Promise.all(
          customerData.bookings.map(async (booking) => {
            try {
              // Lấy chi tiết booking
              const bookingDetails = await services.api.booking.fetchBookingDetails(booking.bookingID);
              console.log(`Booking details for ${booking.bookingID}:`, bookingDetails);
              
              // Lấy thông tin phòng từ booking detail đầu tiên (nếu có)
              const bookingDetail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;
              
              if (!bookingDetail) {
                return {
                  id: booking.bookingID,
                  roomId: '',
                  roomName: 'Unknown Room',
                  roomType: 'Standard Room',
                  checkInDate: booking.bookingTime,
                  checkOutDate: booking.bookingTime,
                  guests: 0,
                  price: 0,
                  total: booking.totalAmount || 0,
                  status: booking.bookingStatus?.toLowerCase() || 'pending',
                  roomImage: '/images/Rooms/standard-room-1.jpg',
                  bookingDate: booking.bookingTime
                };
              }
              
              // Lấy thông tin phòng
              let roomData = null;
              let roomTypeData = null;
              
              try {
                roomData = await services.api.room.fetchRoomById(bookingDetail.roomID);
                console.log(`Room data for ${bookingDetail.roomID}:`, roomData);
                
                if (roomData && roomData.rTypeID) {
                  roomTypeData = await services.api.room.fetchRoomTypes()
                    .then(types => types.find(type => type.rTypeID === roomData.rTypeID));
                  console.log(`Room type data for ${roomData.rTypeID}:`, roomTypeData);
                }
              } catch (err) {
                console.error('Error fetching room data:', err);
              }
              
              // Xác định tên loại phòng
              const roomTypeName = roomTypeData?.typeName || 'Standard Room';
              
              // Xác định trạng thái booking
              let status = 'pending';
              switch (booking.bookingStatus?.toLowerCase()) {
                case 'confirmed':
                  status = 'confirmed';
                  break;
                case 'completed':
                  status = 'completed';
                  break;
                case 'cancelled':
                  status = 'cancelled';
                  break;
                default:
                  status = 'pending';
              }
              
              // Tạo đối tượng booking để hiển thị
              return {
                id: booking.bookingID,
                roomId: bookingDetail.roomID || '',
                roomName: roomTypeName,
                roomType: roomTypeData?.typeName || 'Standard Room',
                checkInDate: bookingDetail.checkinDate || booking.bookingTime,
                checkOutDate: bookingDetail.checkoutDate || booking.bookingTime,
                guests: bookingDetail.guest_BDetails?.length || 2,
                price: bookingDetail.pricePerDay || 0,
                total: booking.totalAmount || 0,
                status: status,
                roomImage: `/images/Rooms/${roomTypeName.toLowerCase().replace(/\s+/g, '-')}-1.jpg`,
                bookingDate: booking.bookingTime
              };
            } catch (err) {
              console.error(`Error processing booking ${booking.bookingID}:`, err);
              return {
                id: booking.bookingID,
                roomId: '',
                roomName: 'Unknown Room',
                roomType: 'Standard Room',
                checkInDate: booking.bookingTime,
                checkOutDate: booking.bookingTime,
                guests: 0,
                price: 0,
                total: booking.totalAmount || 0,
                status: booking.bookingStatus?.toLowerCase() || 'pending',
                roomImage: '/images/Rooms/standard-room-1.jpg',
                bookingDate: booking.bookingTime
              };
            }
          })
        );
        
        console.log('Processed bookings:', bookingsWithDetails);
        setBookings(bookingsWithDetails);
        setFilteredBookings(bookingsWithDetails);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
        setLoading(false);
        setBookings([]);
        setFilteredBookings([]);
      }
    };
    
    fetchBookings();
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
        booking.id.toLowerCase().includes(search)
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
                    <h3 className="booking-name">{booking.roomName}</h3>
                    <p className="booking-room-id">Room ID: {booking.roomId}</p>
                    
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
                    
                    <div className="booking-details">
                      <div className="booking-detail">
                        <FaUsers className="booking-icon" />
                        <span className="booking-detail-label">Guests:</span>
                        <span>{booking.guests}</span>
                      </div>
                      
                      <div className="booking-detail">
                        <FaDollarSign className="booking-icon" />
                        <span className="booking-detail-label">Price per night:</span>
                        <span>${booking.price}</span>
                      </div>
                      
                      <div className="booking-detail">
                        <FaDollarSign className="booking-icon" />
                        <span className="booking-detail-label">Total:</span>
                        <span>${booking.total}</span>
                      </div>
                    </div>
                    
                    <div className="booking-actions">
                      <Link 
                        to={`/rooms/${booking.roomId}`} 
                        className="booking-button btn-primary"
                      >
                        <FaEye /> View Room
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
