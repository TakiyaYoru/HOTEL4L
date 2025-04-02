import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaEye, 
  FaTimes, 
  FaCheck, 
  FaExclamationTriangle, 
  FaHistory,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaCreditCard,
  FaReceipt,
  FaSpinner
} from 'react-icons/fa';
import { fetchUserBookings, fetchBookingById, fetchBookingDetails, cancelBooking } from '../services/api';
import '../styles/MyBookingsPage.css';

function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Gọi API để lấy danh sách đặt phòng của người dùng hiện tại
        const userBookings = await fetchUserBookings();
        console.log('API response:', userBookings);
        
        if (!userBookings || userBookings.length === 0) {
          // Nếu không có booking nào
          setBookings([]);
          setLoading(false);
          return;
        }
        
          // Lấy thông tin chi tiết của mỗi booking
          const bookingsWithDetails = [];
          for (const booking of userBookings) {
            try {
              // Gọi API để lấy thông tin chi tiết của booking
              console.log(`Fetching booking info for ${booking.bookingID}`);
              const bookingInfo = await fetchBookingById(booking.bookingID);
              console.log(`Booking info:`, bookingInfo);
              
              // Gọi API để lấy chi tiết booking (booking details)
              console.log(`Fetching details for booking ${booking.bookingID}`);
              const details = await fetchBookingDetails(booking.bookingID);
              console.log(`Booking details:`, details);
              
              // Kết hợp thông tin từ cả hai API
              bookingsWithDetails.push({
                ...booking,
                ...bookingInfo, // Thêm thông tin từ API /bookings
                bookingDetails: details, // Thêm thông tin từ API /bookingDetails
                payment: bookingInfo?.payment || null // Đảm bảo có thông tin payment
              });
            } catch (error) {
              console.error(`Error fetching details for booking ${booking.bookingID}:`, error);
              // Thêm booking vào danh sách ngay cả khi không lấy được chi tiết
              bookingsWithDetails.push({
                ...booking,
                bookingDetails: []
              });
            }
          }
          
          console.log('Bookings with details:', bookingsWithDetails);
          
          // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
          const formattedBookings = bookingsWithDetails.map(booking => {
            // Lấy thông tin phòng từ booking detail đầu tiên (nếu có)
            const bookingDetail = booking.bookingDetails && booking.bookingDetails.length > 0 
              ? booking.bookingDetails[0] 
              : null;
            
            // Lấy thông tin phòng một cách an toàn
            const room = bookingDetail?.room || {};
            const roomType = room?.roomType || {};
            const roomTypeName = roomType?.name || 'Standard Room';
          
            // Tạo timeline
            const timeline = [
              { 
                date: new Date(booking.bookingTime).toISOString().split('T')[0], 
                text: 'Booking created', 
                icon: 'FaCalendarAlt' 
              }
            ];
            
            // Thêm thông tin thanh toán vào timeline
            if (booking.paymentStatus) {
              timeline.push({
                date: booking.payment?.paymentTime 
                  ? new Date(booking.payment.paymentTime).toISOString().split('T')[0]
                  : new Date(booking.bookingTime).toISOString().split('T')[0],
                text: 'Payment confirmed',
                icon: 'FaCreditCard'
              });
            } else {
              timeline.push({
                date: new Date(booking.bookingTime).toISOString().split('T')[0],
                text: 'Payment pending',
                icon: 'FaCreditCard'
              });
            }
            
            // Thêm thông tin check-in/check-out vào timeline nếu có
            if (bookingDetail?.detailStatus === 'Checked_in') {
              timeline.push({
                date: new Date(bookingDetail.checkinDate).toISOString().split('T')[0],
                text: 'Check-in completed',
                icon: 'FaCheck'
              });
            }
            
            if (bookingDetail?.detailStatus === 'Checked_out') {
              timeline.push({
                date: new Date(bookingDetail.checkoutDate).toISOString().split('T')[0],
                text: 'Check-out completed',
                icon: 'FaCheck'
              });
            }
            
            // Thêm thông tin hủy đặt phòng vào timeline nếu có
            if (booking.bookingStatus === 'Cancelled') {
              timeline.push({
                date: new Date().toISOString().split('T')[0], // Không có thông tin thời gian hủy
                text: 'Booking cancelled',
                icon: 'FaTimes'
              });
            }
            
            // Chuyển đổi trạng thái booking từ API sang định dạng hiển thị
            let status = 'pending';
            switch (booking.bookingStatus) {
              case 'Confirmed':
                status = 'confirmed';
                break;
              case 'Completed':
                status = 'completed';
                break;
              case 'Cancelled':
                status = 'cancelled';
                break;
              default:
                status = 'pending';
            }
            
            // Lấy thông tin dịch vụ bổ sung
            const extraServices = bookingDetail?.eService_BDetails?.map(service => ({
              eServiceID: service.eServiceID,
              name: service.extraService?.name || service.eServiceID,
              quantity: service.quantity || 1,
              price: service.extraService?.price || 0
            })) || [];
            
            // Tạo đối tượng booking để hiển thị
            return {
              id: booking.bookingID,
              roomId: bookingDetail?.roomID || '',
              roomName: roomTypeName, // Sử dụng biến roomTypeName đã xử lý an toàn
              checkInDate: bookingDetail?.checkinDate || new Date().toISOString(),
              checkOutDate: bookingDetail?.checkoutDate || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
              guests: bookingDetail?.guest_BDetails?.length || 2, // Số lượng khách là số lượng guest_BDetails
              price: bookingDetail?.pricePerDay || 0,
              total: booking.totalAmount || 0,
              status: status,
              roomImage: `Images/Rooms/${roomTypeName.toLowerCase().replace(/\s+/g, '-')}-1.jpg` || 'Images/Rooms/standard-room-1.jpg',
              bookingDate: new Date(booking.bookingTime).toISOString().split('T')[0],
              paymentMethod: booking.payment?.method || 'Cash',
              specialRequests: bookingDetail?.specialRequests || '',
              extraServices: extraServices, // Thêm thông tin dịch vụ bổ sung
              timeline: timeline
            };
          });
        
        setBookings(formattedBookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
        setLoading(false);
        // Không sử dụng fallback, hiển thị lỗi
        setBookings([]);
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
    try {
      setLoading(true);
      
      // Gọi API để hủy đặt phòng
      await cancelBooking(bookingId);
      
      // Cập nhật trạng thái đặt phòng thành 'cancelled'
      const updatedBookings = bookings.map(booking => {
        if (booking.id === bookingId) {
          const updatedBooking = { 
            ...booking, 
            status: 'cancelled',
            timeline: [
              ...booking.timeline,
              { 
                date: new Date().toISOString().split('T')[0], 
                text: 'Booking cancelled', 
                icon: 'FaTimes' 
              }
            ]
          };
          return updatedBooking;
        }
        return booking;
      });
      
      // Chỉ cập nhật state, không lưu vào localStorage
      setBookings(updatedBookings);
      
      // Nếu đang xem chi tiết đặt phòng bị hủy, cập nhật thông tin
      if (selectedBooking && selectedBooking.id === bookingId) {
        const updatedBooking = updatedBookings.find(b => b.id === bookingId);
        setSelectedBooking(updatedBooking);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
      setLoading(false);
    }
  };

  // Xử lý xem chi tiết đặt phòng
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Lấy icon cho timeline
  const getTimelineIcon = (iconName) => {
    switch (iconName) {
      case 'FaCalendarAlt':
        return <FaCalendarAlt />;
      case 'FaCreditCard':
        return <FaCreditCard />;
      case 'FaCheck':
        return <FaCheck />;
      case 'FaTimes':
        return <FaTimes />;
      default:
        return <FaHistory />;
    }
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
                    
                    <div className="booking-dates">
                      <span>{formatDate(booking.checkInDate)}</span>
                      <span>to</span>
                      <span>{formatDate(booking.checkOutDate)}</span>
                    </div>
                    
                    <div className="booking-details">
                      <div className="booking-detail">
                        <span className="booking-detail-label">Guests</span>
                        <span>{booking.guests}</span>
                      </div>
                      
                      <div className="booking-detail">
                        <span className="booking-detail-label">Price per night</span>
                        <span>${booking.price}</span>
                      </div>
                      
                      <div className="booking-detail">
                        <span className="booking-detail-label">Total</span>
                        <span>${booking.total}</span>
                      </div>
                    </div>
                    
                    <div className="booking-actions">
                      <button 
                        className="booking-button btn-primary"
                        onClick={() => handleViewBooking(booking)}
                      >
                        View Details
                      </button>
                      
                      {booking.status && booking.status === 'confirmed' && (
                        <button 
                          className="booking-button btn-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                      
                      {booking.status && booking.status === 'completed' && (
                        <Link 
                          to={`/rooms/${booking.roomId}`} 
                          className="booking-button btn-secondary"
                        >
                          Book Again
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
      
      {/* Modal chi tiết đặt phòng */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <h2 className="modal-title">Booking Details</h2>
              <p className="modal-subtitle">Booking ID: {selectedBooking.id}</p>
            </div>
            
            <div className="modal-body">
              <div className="booking-summary">
                <div 
                  className="summary-image" 
                  style={{ backgroundImage: `url(${selectedBooking.roomImage})` }}
                />
                
                <div className="summary-details">
                  <h3>{selectedBooking.roomName}</h3>
                  
                  <div className="summary-item">
                    <span className="summary-label">Status</span>
                    <span className={`booking-status status-${selectedBooking.status || 'pending'}`}>
                      {selectedBooking.status ? selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Check-in</span>
                    <span>{formatDate(selectedBooking.checkInDate)}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Check-out</span>
                    <span>{formatDate(selectedBooking.checkOutDate)}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Guests</span>
                    <span>{selectedBooking.guests}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Price per night</span>
                    <span>${selectedBooking.price}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Total</span>
                    <span>${selectedBooking.total}</span>
                  </div>
                </div>
              </div>
              
              <div className="booking-details">
                <h3>Additional Information</h3>
                
                <div className="summary-item">
                  <span className="summary-label">Booking Date</span>
                  <span>{formatDate(selectedBooking.bookingDate)}</span>
                </div>
                
                <div className="summary-item">
                  <span className="summary-label">Payment Method</span>
                  <span>{selectedBooking.paymentMethod}</span>
                </div>
                
                {selectedBooking.extraServices && selectedBooking.extraServices.length > 0 && (
                  <div className="summary-item">
                    <span className="summary-label">Extra Services</span>
                    <div className="extra-services-list">
                      {selectedBooking.extraServices.map((service, index) => (
                        <div key={index} className="extra-service-item">
                          <span>{service.name || service.eServiceID}</span>
                          <span>x{service.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedBooking.specialRequests && (
                  <div className="summary-item">
                    <span className="summary-label">Special Requests</span>
                    <span>{selectedBooking.specialRequests}</span>
                  </div>
                )}
              </div>
              
              <div className="booking-timeline">
                <h3 className="timeline-title">Booking Timeline</h3>
                
                {selectedBooking.timeline.map((item, index) => (
                  <div className="timeline-item" key={index}>
                    <div className="timeline-icon">
                      {getTimelineIcon(item.icon)}
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-date">{formatDate(item.date)}</p>
                      <p className="timeline-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <Link 
                to={`/rooms/${selectedBooking.roomId}`} 
                className="booking-button btn-secondary"
              >
                View Room
              </Link>
              
              {selectedBooking.status && selectedBooking.status === 'confirmed' && (
                <button 
                  className="booking-button btn-danger"
                  onClick={() => {
                    handleCancelBooking(selectedBooking.id);
                    handleCloseModal();
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyBookingsPage;
