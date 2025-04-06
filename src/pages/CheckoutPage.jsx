import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaPrint, FaHome, FaList, FaCalendarAlt, FaUsers, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/CheckoutPage.css';

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [booking, setBooking] = useState(() => {
    const stateData = location.state?.booking;
    return stateData || null;
  });

  useEffect(() => {
    if (!booking) {
      navigate('/rooms');
    }
  }, [booking, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!booking) {
    return <div className="container">Đang tải...</div>;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container">
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="success-header">
            <div className="success-icon">
              <FaCheck />
            </div>
            <h1 className="success-title">Đặt Phòng Thành Công!</h1>
            <p className="success-message">
              Đặt phòng của bạn đã được {booking.status === 'pending' ? 'tạo' : 'xác nhận'} thành công. Một email xác nhận đã được gửi đến địa chỉ email của bạn.
            </p>
            <div className="booking-id">
              Mã Đặt Phòng: {booking.id}
            </div>
            <div className="booking-status">
              Trạng Thái: <span className={`status-${booking.status}`}>{booking.status === 'pending' ? 'ĐANG CHỜ' : 'ĐÃ XÁC NHẬN'}</span>
            </div>
            {booking.checkInCode && booking.status === 'confirmed' && (
              <div className="checkin-code">
                <FaQrcode style={{ marginRight: '8px' }} />
                Mã Nhận Phòng: <strong>{booking.checkInCode}</strong>
                <p>Vui lòng xuất trình mã này tại quầy lễ tân khi bạn nhận phòng.</p>
              </div>
            )}
          </div>

          <div className="confirmation-card">
            <div className="confirmation-header">
              <h2>Chi Tiết Đặt Phòng</h2>
            </div>

            <div className="confirmation-body">
              <div className="confirmation-section">
                <h3>Thông Tin Phòng</h3>
                <div className="room-details">
                  <div
                    className="room-image"
                    style={{ backgroundImage: `url(${booking.roomImage})` }}
                  />
                  <div className="room-info">
                    <h4>{booking.roomName}</h4>
                    <p>
                      {formatDate(booking.checkInDate)} đến {formatDate(booking.checkOutDate)}
                      <br />
                      {calculateNights()} đêm, {booking.guests} khách
                    </p>
                  </div>
                </div>

                <div className="price-details">
                  <div className="price-item">
                    <span>Giá Phòng</span>
                    <span>${booking.price} x {calculateNights()} đêm</span>
                  </div>
                  <div className="price-item">
                    <span>Tổng Giá Phòng</span>
                    <span>${(booking.price * calculateNights()).toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Thuế (10%)</span>
                    <span>${(booking.price * calculateNights() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="price-total">
                    <span>Tổng Cộng</span>
                    <span>${booking.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>Thông Tin Khách Hàng</h3>
                <div className="confirmation-grid">
                  <div className="confirmation-item">
                    <span className="confirmation-label">Họ Tên</span>
                    <span className="confirmation-value">{booking.primaryGuest.fullName}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Email</span>
                    <span className="confirmation-value">{booking.primaryGuest.email}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Số Điện Thoại</span>
                    <span className="confirmation-value">{booking.primaryGuest.phone}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Phương Thức Thanh Toán</span>
                    <span className="confirmation-value">{booking.paymentMethod}</span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="confirmation-item">
                    <span className="confirmation-label">Yêu Cầu Đặc Biệt</span>
                    <span className="confirmation-value">{booking.specialRequests}</span>
                  </div>
                )}

                {booking.companions && booking.companions.length > 0 && (
                  <div className="confirmation-item">
                    <span className="confirmation-label">Người Đi Cùng</span>
                    <ul className="companions-list">
                      {booking.companions.map((companion, index) => (
                        <li key={index}>
                          {companion.fullName} (CMND/CCCD: {companion.idCard})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="confirmation-section">
                <h3>Thông Tin Nhận/Trả Phòng</h3>
                <div className="confirmation-grid">
                  <div className="confirmation-item">
                    <span className="confirmation-label">Ngày Nhận Phòng</span>
                    <span className="confirmation-value">{formatDate(booking.checkInDate)}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Giờ Nhận Phòng</span>
                    <span className="confirmation-value">Sau {booking.checkInTime}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Ngày Trả Phòng</span>
                    <span className="confirmation-value">{formatDate(booking.checkOutDate)}</span>
                  </div>
                  <div className="confirmation-item">
                    <span className="confirmation-label">Giờ Trả Phòng</span>
                    <span className="confirmation-value">Trước {booking.checkOutTime}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>Lịch Sử Đặt Phòng</h3>
                <ul className="timeline">
                  {booking.timeline.map((event, index) => (
                    <li key={index} className="timeline-item">
                      <span className="timeline-icon">
                        {event.icon === 'FaCalendarAlt' ? <FaCalendarAlt /> : <FaCreditCard />}
                      </span>
                      <span className="timeline-date">{formatDate(event.date)}</span>
                      <span className="timeline-text">
                        {event.text === 'Booking Created' ? 'Đặt Phòng Được Tạo' : 
                         event.text === 'Payment Confirmed' ? 'Thanh Toán Được Xác Nhận' : event.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/" className="btn btn-secondary">
              <FaHome style={{ marginRight: '8px' }} />
              Quay Về Trang Chủ
            </Link>
            <Link to="/my-bookings" className="btn btn-primary">
              <FaList style={{ marginRight: '8px' }} />
              Xem Đặt Phòng Của Tôi
            </Link>
            <button className="btn btn-secondary print-button" onClick={handlePrint}>
              <FaPrint />
              In Xác Nhận
            </button>
          </div>

          <div className="contact-info">
            <p>Nếu bạn có bất kỳ câu hỏi nào về đặt phòng của mình, vui lòng liên hệ với chúng tôi:</p>
            <p><strong>Email:</strong> support@luxuryhotel.com</p>
            <p><strong>Số Điện Thoại:</strong> +1 (234) 567-8900</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;