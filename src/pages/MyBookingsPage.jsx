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
        console.log('Đang lấy dữ liệu khách hàng hiện tại...');
        const customerData = await services.api.customer.fetchCurrentCustomer();
        console.log('Dữ liệu khách hàng nhận được:', customerData);

        if (!customerData || !customerData.bookings || customerData.bookings.length === 0) {
          console.log('Không tìm thấy đặt phòng nào cho khách hàng');
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
            console.log('Bỏ qua đặt phòng null');
            continue;
          }

          console.log(`Đang xử lý đặt phòng: ${booking.bookingID}`);

          // 2. Gọi API ../Bookings/{bookingID} để lấy thông tin chi tiết của booking
          let bookingData = null;
          try {
            console.log(`Đang lấy dữ liệu đặt phòng cho ${booking.bookingID}...`);
            bookingData = await services.api.booking.fetchBookingById(booking.bookingID);
            console.log(`Dữ liệu đặt phòng cho ${booking.bookingID}:`, bookingData);
          } catch (bookingError) {
            console.error(`Lỗi khi lấy dữ liệu đặt phòng cho ${booking.bookingID}:`, bookingError);
            continue;
          }

          if (!bookingData) {
            console.log(`Không tìm thấy dữ liệu đặt phòng cho ${booking.bookingID}, bỏ qua đặt phòng này`);
            continue;
          }

          // 3. Lấy bookingDetails từ dữ liệu booking
          const bookingDetails = bookingData.bookingDetails || [];
          const detail = bookingDetails && bookingDetails.length > 0 ? bookingDetails[0] : null;

          if (!detail || !detail.detailID) {
            console.log(`Không tìm thấy chi tiết hoặc detailID cho đặt phòng ${booking.bookingID}, bỏ qua đặt phòng này`);
            continue;
          }

          // 4. Gọi API bookingDetails để lấy thông tin chi tiết
          let bookingDetailData = null;
          let roomId = detail.roomID || 'N/A';
          let roomTypeName = 'Phòng Tiêu Chuẩn'; // Giá trị mặc định

          try {
            console.log(`Đang lấy dữ liệu chi tiết đặt phòng cho detailID ${detail.detailID}...`);
            bookingDetailData = await services.api.booking.fetchBookingDetailById(detail.detailID);
            console.log(`Dữ liệu chi tiết đặt phòng cho ${detail.detailID}:`, bookingDetailData);

            if (!bookingDetailData || !bookingDetailData.room) {
              console.log(`Không tìm thấy dữ liệu chi tiết hoặc phòng cho detailID ${detail.detailID}, sử dụng giá trị dự phòng`);
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
                  // Dịch tên loại phòng sang tiếng Việt
                  roomTypeName = roomTypeName === 'Standard Room' ? 'Phòng Tiêu Chuẩn' :
                                 roomTypeName === 'Deluxe Room' ? 'Phòng Cao Cấp' :
                                 roomTypeName === 'Family Room' ? 'Phòng Gia Đình' :
                                 roomTypeName === 'Suite Room' ? 'Phòng Suite' :
                                 roomTypeName === 'Executive Suite' ? 'Căn Hộ Hạng Sang' :
                                 roomTypeName === 'Presidential Suite' ? 'Căn Hộ Tổng Thống' : roomTypeName;
                } else {
                  console.log(`Không tìm thấy loại phòng cho rTypeID ${rTypeID}, sử dụng giá trị dự phòng`);
                }
              }
            }
          } catch (detailError) {
            console.error(`Lỗi khi lấy chi tiết đặt phòng cho ${detail.detailID}:`, detailError);
            // Fallback dựa trên roomID prefix nếu có
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

        console.log('Danh sách đặt phòng đã xử lý:', processedBookings);
        setBookings(processedBookings);
        setFilteredBookings(processedBookings);

      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu đặt phòng:', err);
        setError('Không thể tải danh sách đặt phòng của bạn. Vui lòng thử lại sau.');
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
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
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

      alert('Hủy đặt phòng thành công!');
    } catch (err) {
      console.error('Lỗi khi hủy đặt phòng:', err);
      setError('Không thể hủy đặt phòng. Vui lòng thử lại.');
      setLoading(false);

      alert('Không thể hủy đặt phòng. Vui lòng thử lại.');
    }
  };

  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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
          <h1 className="page-title">Đặt Phòng Của Bạn</h1>
          <p>Quản lý và xem tất cả các đặt phòng của bạn</p>
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
                Tất Cả
              </button>
              <button
                className={`filter-button ${activeFilter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('confirmed')}
              >
                Đã Xác Nhận
              </button>
              <button
                className={`filter-button ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pending')}
              >
                Đang Chờ
              </button>
              <button
                className={`filter-button ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Đã Hoàn Thành
              </button>
              <button
                className={`filter-button ${activeFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveFilter('cancelled')}
              >
                Đã Hủy
              </button>
            </div>

            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm đặt phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Hiển thị loading */}
          {loading && (
            <div className="loading-container">
              <FaSpinner className="loading-spinner" />
              <p>Đang tải đặt phòng của bạn...</p>
            </div>
          )}

          {/* Hiển thị lỗi */}
          {error && (
            <div className="error-container">
              <FaExclamationTriangle />
              <h3>Lỗi khi tải đặt phòng</h3>
              <p>{error}</p>
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Thử Lại
              </button>
            </div>
          )}

          {/* Danh sách đặt phòng */}
          {!loading && !error && currentItems.length === 0 ? (
            <div className="empty-state">
              <h3>Không tìm thấy đặt phòng</h3>
              <p>Bạn không có đặt phòng nào phù hợp với tiêu chí của bạn.</p>
              <Link to="/rooms" className="booking-button btn-outline">Xem Phòng</Link>
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
                      {booking.status === 'confirmed' ? 'Đã Xác Nhận' :
                       booking.status === 'pending' ? 'Đang Chờ' :
                       booking.status === 'completed' ? 'Đã Hoàn Thành' :
                       booking.status === 'cancelled' ? 'Đã Hủy' : 'Đã trả phòng'}
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
                      <span className="booking-detail-label">Mã Phòng:</span>
                      <span>{booking.roomId}</span>
                    </div>

                    {/* Mã booking */}
                    <div className="booking-detail">
                      <FaHashtag className="booking-icon" />
                      <span className="booking-detail-label">Mã Đặt Phòng:</span>
                      <span>{booking.id}</span>
                    </div>

                    {/* Thời gian */}
                    <div className="booking-dates">
                      <div>
                        <FaCalendarAlt className="booking-icon" />
                        <span>Nhận Phòng: {formatDate(booking.checkInDate)}</span>
                      </div>
                      <div>
                        <FaCalendarAlt className="booking-icon" />
                        <span>Trả Phòng: {formatDate(booking.checkOutDate)}</span>
                      </div>
                    </div>

                    {/* Số tiền */}
                    <div className="booking-detail">
                      <FaDollarSign className="booking-icon" />
                      <span className="booking-detail-label">Tổng Số Tiền:</span>
                      <span>{services.utils.format.formatCurrency(booking.total)}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <Link
                      to={`/my-bookings/${booking.id}`}
                      className="btn-outline"
                    >
                      <FaEye /> Xem Chi Tiết
                    </Link>

                    {booking.status === 'completed' && (
                      <Link
                        to={`/rooms/${booking.roomId}`}
                        className="booking-button btn-secondary"
                      >
                        <FaCheck /> Đặt Lại
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default MyBookingsPage;