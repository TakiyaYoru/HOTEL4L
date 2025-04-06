import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaLock, 
  FaHistory, 
  FaHeart, 
  FaBell, 
  FaCog, 
  FaEdit, 
  FaCamera, 
  FaCheck, 
  FaTimes, 
  FaSignOutAlt,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/ProfilePage.css';
import visaIcon from '/images/Logo/visa-icon.png'; 
import masterCardIcon from '/images/Logo/mastercard-icon.png'; 
import paypalIcon from '/images/Logo/paypal-icon.png'; 

function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    birthdate: '',
    gender: '',
    bio: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardType: '', // Thêm trường cardType
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Xử lý thay đổi trong form thanh toán
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };
  
  // Lưu thông tin thanh toán
  const handleSavePayment = (e) => {
    e.preventDefault();
    
    // Lưu thông tin thanh toán vào localStorage
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
  
    setSuccessMessage('Cập nhật phương thức thanh toán thành công!');
    setEditMode(false);
  
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };  
  
  // Tải lại thông tin thẻ tín dụng từ localStorage khi component mount
  useEffect(() => {
    const storedPaymentData = localStorage.getItem('paymentData');
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    }
  }, []);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Mock data for bookings
  const [bookings, setBookings] = useState([
    {
      id: 'b001',
      roomName: 'Phòng Cao Cấp',
      checkIn: '2025-04-15',
      checkOut: '2025-04-18',
      guests: 2,
      price: 150,
      total: 450,
      status: 'confirmed',
      image: '/images/Rooms/deluxe-room-1.jpg'
    },
    {
      id: 'b002',
      roomName: 'Căn Hộ Hạng Sang',
      checkIn: '2025-05-20',
      checkOut: '2025-05-25',
      guests: 2,
      price: 250,
      total: 1250,
      status: 'pending',
      image: '/images/Rooms/executive-suite-1.jpg'
    }
  ]);
  
  // Mock data for favorites
  const [favorites, setFavorites] = useState([
    {
      id: 'r001',
      name: 'Phòng Hướng Biển',
      price: 180,
      image: '/images/Rooms/ocean-view-room-1.jpg'
    },
    {
      id: 'r002',
      name: 'Căn Hộ Tổng Thống',
      price: 350,
      image: '/images/Rooms/presidential-suite-1.jpg'
    },
    {
      id: 'r003',
      name: 'Phòng Gia Đình',
      price: 200,
      image: '/images/Rooms/family-room-1.jpg'
    }
  ]);
  
  // Mock data for notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'n001',
      title: 'Xác Nhận Đặt Phòng',
      message: 'Đặt phòng của bạn cho Phòng Cao Cấp đã được xác nhận.',
      time: '2 ngày trước',
      read: true
    },
    {
      id: 'n002',
      title: 'Ưu Đãi Đặc Biệt',
      message: 'Nhận 20% giảm giá cho lần đặt phòng tiếp theo với mã SUMMER20.',
      time: '1 tuần trước',
      read: false
    },
    {
      id: 'n003',
      title: 'Kỳ Nghỉ Sắp Tới',
      message: 'Kỳ nghỉ của bạn tại khách sạn của chúng tôi sẽ bắt đầu sau 3 ngày. Chúng tôi rất mong được chào đón bạn!',
      time: 'Vừa xong',
      read: false
    }
  ]);
  
  // Load user data
  useEffect(() => {
    if (currentUser) {
      // Lấy thông tin người dùng từ localStorage (nếu có)
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setFormData(JSON.parse(storedUserData));
      } else {
        setFormData({
          firstName: currentUser.name?.split(' ')[0] || '',
          lastName: currentUser.name?.split(' ')[1] || '',
          email: currentUser.email || '',
          phone: '+1 234 567 8900',
          address: '123 Đường Chính',
          city: 'Hà Nội',
          country: 'Việt Nam',
          birthdate: '1990-01-01',
          gender: 'Nam',
          bio: 'Tôi yêu thích du lịch và trải nghiệm các khách sạn sang trọng trên khắp thế giới.'
        });
      }
    }
  }, [currentUser]);  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Lưu thông tin đã chỉnh sửa vào localStorage
    localStorage.setItem('userData', JSON.stringify(formData));
  
    setSuccessMessage('Cập nhật hồ sơ thành công!');
    setEditMode(false);
  
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };  
  
  const handleChangePassword = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Mật khẩu mới không khớp');
      return;
    }
    
    // In a real app, you would send the password change request to an API
    setSuccessMessage('Đổi mật khẩu thành công!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };
  
  const handleCancelBooking = (bookingId) => {
    // In a real app, you would send a cancellation request to an API
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' } 
        : booking
    ));
  };
  
  const handleRemoveFavorite = (roomId) => {
    // In a real app, you would send a request to remove from favorites
    setFavorites(favorites.filter(room => room.id !== roomId));
  };
  
  const handleMarkAsRead = (notificationId) => {
    // In a real app, you would send a request to mark as read
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    ));
  };
  
  const handleDeleteNotification = (notificationId) => {
    // In a real app, you would send a request to delete notification
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Get user's first initial for avatar
  const getInitial = () => {
    if (currentUser?.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    if (formData.firstName) {
      return formData.firstName.charAt(0).toUpperCase();
    }
    return 'N';
  };
  
  // Get role display name
  const getRoleDisplay = () => {
    if (!currentUser) return '';
    
    switch (currentUser.role) {
      case 'admin':
        return 'Quản Trị Viên';
      case 'employee':
        return 'Nhân Viên';
      case 'customer':
        return 'Khách Hàng';
      default:
        return 'Người Dùng';
    }
  };
  
  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Hồ Sơ Của Tôi</h1>
          <p className="profile-subtitle">Quản lý cài đặt và tùy chọn tài khoản của bạn</p>
        </div>
        
        {successMessage && (
          <div className="alert alert-success">
            <FaCheck />
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="alert alert-error">
            <FaExclamationTriangle />
            {errorMessage}
          </div>
        )}
        
        <div className="profile-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.name} />
              ) : (
                getInitial()
              )}
              <label className="avatar-upload">
                <input type="file" accept="image/*" />
                <FaCamera /> Đổi Ảnh
              </label>
            </div>
            
            <h2 className="profile-name">{formData.firstName} {formData.lastName}</h2>
            <p className="profile-email">{formData.email}</p>
            
            <div className="profile-role-container">
              <span className="profile-role">{getRoleDisplay()}</span>
            </div>
            
            <div className="profile-menu">
              <div 
                className={`profile-menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <FaUser />
                Thông Tin Cá Nhân
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaLock />
                Bảo Mật
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                <FaDollarSign />
                Phương Thức Thanh Toán
              </div>

              <div 
                className={`profile-menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <FaHistory />
                Đặt Phòng Của Tôi
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <FaHeart />
                Yêu Thích
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell />
                Thông Báo
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <FaCog />
                Cài Đặt Tài Khoản
              </div>
              
              <div 
                className="profile-menu-item"
                onClick={logout}
              >
                <FaSignOutAlt />
                Đăng Xuất
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="profile-main">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Thông Tin Cá Nhân</h2>
                  <button onClick={() => setEditMode(!editMode)}>
                    <FaEdit />
                    {editMode ? 'Hủy' : 'Chỉnh Sửa'}
                  </button>
                </div>
                
                {editMode ? (
                  <form className="profile-form" onSubmit={handleSaveProfile}>
                    <div className="form-group">
                      <label htmlFor="firstName">Tên</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName">Họ</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Số Điện Thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="birthdate">Ngày Sinh</label>
                      <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="gender">Giới Tính</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Chọn Giới Tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                        <option value="Không muốn tiết lộ">Không muốn tiết lộ</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address">Địa Chỉ</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="city">Thành Phố</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="country">Quốc Gia</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="bio">Tiểu Sử</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info">
                    <div className="profile-form">
                      <div className="form-group">
                        <label>Tên</label>
                        <p>{formData.firstName}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Họ</label>
                        <p>{formData.lastName}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Email</label>
                        <p>{formData.email}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Số Điện Thoại</label>
                        <p>{formData.phone}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Ngày Sinh</label>
                        <p>{formData.birthdate ? formatDate(formData.birthdate) : 'Chưa cung cấp'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Giới Tính</label>
                        <p>{formData.gender || 'Chưa cung cấp'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Địa Chỉ</label>
                        <p>{formData.address || 'Chưa cung cấp'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Thành Phố</label>
                        <p>{formData.city || 'Chưa cung cấp'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Quốc Gia</label>
                        <p>{formData.country || 'Chưa cung cấp'}</p>
                      </div>
                      
                      <div className="form-group full-width">
                        <label>Tiểu Sử</label>
                        <p>{formData.bio || 'Chưa cung cấp'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Bảo Mật</h2>
                </div>
                
                <div className="security-section">
                  <h3 className="security-title">Đổi Mật Khẩu</h3>
                  <p className="security-description">
                    Đảm bảo tài khoản của bạn sử dụng mật khẩu mạnh để bảo mật tốt hơn.
                  </p>
                  
                  <form className="profile-form" onSubmit={handleChangePassword}>
                    <div className="form-group full-width">
                      <label htmlFor="currentPassword">Mật Khẩu Hiện Tại</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="newPassword">Mật Khẩu Mới</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu Mới</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Đổi Mật Khẩu
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="security-section">
                  <h3 className="security-title">Hoạt Động Tài Khoản</h3>
                  <p className="security-description">
                    Theo dõi và quản lý hoạt động tài khoản của bạn vì mục đích bảo mật.
                  </p>
                  
                  <div className="activity-list">
                    <div className="activity-item">
                      <p><strong>Lần đăng nhập cuối:</strong> Hôm nay lúc 14:30</p>
                      <p><strong>Thiết bị:</strong> Chrome trên Windows</p>
                      <p><strong>Vị trí:</strong> Hà Nội, Việt Nam</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Phương Thức Thanh Toán</h2>
                  <button onClick={() => setEditMode(!editMode)}>
                    <FaEdit />
                    {editMode ? 'Hủy' : 'Chỉnh Sửa'}
                  </button>
                </div>

                {editMode ? (
                  <form className="profile-form" onSubmit={handleSavePayment}>
                    <div className="form-group">
                      <label htmlFor="cardType">Loại Thẻ</label>
                      <div className="card-type-selector">
                        <select
                          id="cardType"
                          name="cardType"
                          value={paymentData.cardType}
                          onChange={handlePaymentChange}
                          required
                        >
                          <option value="">Chọn Loại Thẻ</option>
                          <option value="Visa">Visa</option>
                          <option value="MasterCard">MasterCard</option>
                          <option value="PayPal">PayPal</option>
                        </select>

                        {/* Hiển thị icon của thẻ đã chọn */}
                        {paymentData.cardType && (
                          <img 
                            src={
                              paymentData.cardType === 'Visa' ? visaIcon :
                              paymentData.cardType === 'MasterCard' ? masterCardIcon :
                              paymentData.cardType === 'PayPal' ? paypalIcon : ''
                            }
                            alt={paymentData.cardType}
                            className="card-icon"
                          />
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="cardNumber">Số Thẻ</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handlePaymentChange}
                        required
                        placeholder="1234 5678 9876 5432"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="expiryDate">Ngày Hết Hạn</label>
                      <input
                        type="month"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handlePaymentChange}
                        required
                        placeholder="123"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="payment-info">
                    <div className="form-group">
                      <label>Loại Thẻ</label>
                      <div className="card-type-container">
                        <p>{paymentData.cardType || 'Chưa cung cấp'}</p>
                        
                        {/* Hiển thị icon của thẻ đã chọn */}
                        {paymentData.cardType && (
                          <img 
                            src={
                              paymentData.cardType === 'Visa' ? visaIcon :
                              paymentData.cardType === 'MasterCard' ? masterCardIcon :
                              paymentData.cardType === 'PayPal' ? paypalIcon : ''
                            }
                            alt={paymentData.cardType}
                            className="card-icon"
                          />
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Số Thẻ</label>
                      <p>{paymentData.cardNumber ? paymentData.cardNumber.replace(/\d{4}(?=\d)/g, '**** ') : 'Chưa cung cấp'}</p>
                    </div>

                    <div className="form-group">
                      <label>Ngày Hết Hạn</label>
                      <p>{paymentData.expiryDate || 'Chưa cung cấp'}</p>
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <p>{paymentData.cvv ? '***' : 'Chưa cung cấp'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Đặt Phòng Của Tôi</h2>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>Bạn chưa có đặt phòng nào.</p>
                    <Link to="/rooms" className="btn btn-primary">Xem Phòng</Link>
                  </div>
                ) : (
                  <div className="booking-list">
                    {bookings.map(booking => (
                      <div className="booking-card" key={booking.id}>
                        <div className="booking-header">
                          <h3 className="booking-title">{booking.roomName}</h3>
                          <div className="booking-dates">
                            <span>{formatDate(booking.checkIn)}</span>
                            <span>đến</span>
                            <span>{formatDate(booking.checkOut)}</span>
                          </div>
                        </div>
                        
                        <div className="booking-content">
                          <div className="booking-details">
                            <div className="booking-detail">
                              <span className="booking-detail-label">Số Khách</span>
                              <span>{booking.guests}</span>
                            </div>
                            
                            <div className="booking-detail">
                              <span className="booking-detail-label">Giá mỗi đêm</span>
                              <span>${booking.price}</span>
                            </div>
                            
                            <div className="booking-detail">
                              <span className="booking-detail-label">Tổng Cộng</span>
                              <span>${booking.total}</span>
                            </div>
                            
                            <div className="booking-detail">
                              <span className="booking-detail-label">Trạng Thái</span>
                              <span className={`booking-status status-${booking.status}`}>
                                {booking.status === 'confirmed' ? 'Đã Xác Nhận' :
                                 booking.status === 'pending' ? 'Đang Chờ' :
                                 booking.status === 'cancelled' ? 'Đã Hủy' : booking.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="booking-actions">
                            <Link to={`/rooms/${booking.id}`} className="btn btn-secondary">
                              Xem Phòng
                            </Link>
                            
                            {booking.status === 'confirmed' && (
                              <button 
                                className="btn btn-secondary"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Hủy Đặt Phòng
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Yêu Thích</h2>
                </div>
                
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <p>Bạn chưa có phòng yêu thích nào.</p>
                    <Link to="/rooms" className="btn btn-primary">Xem Phòng</Link>
                  </div>
                ) : (
                  <div className="favorites-list">
                    {favorites.map(room => (
                      <div className="favorite-card" key={room.id}>
                        <div 
                          className="favorite-image" 
                          style={{ backgroundImage: `url(${room.image})` }}
                        />
                        
                        <div className="favorite-content">
                          <h3 className="favorite-title">{room.name}</h3>
                          <p className="favorite-price">${room.price} / đêm</p>
                          
                          <div className="favorite-actions">
                            <Link to={`/rooms/${room.id}`} className="btn btn-secondary">
                              Xem Chi Tiết
                            </Link>
                            
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleRemoveFavorite(room.id)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Thông Báo</h2>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>Bạn không có thông báo nào.</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notifications.map(notification => (
                      <div 
                        className={`notification-item ${notification.read ? '' : 'unread'}`} 
                        key={notification.id}
                      >
                        <div className="notification-icon">
                          <FaInfoCircle />
                        </div>
                        
                        <div className="notification-content">
                          <h3 className="notification-title">{notification.title}</h3>
                          <p className="notification-message">{notification.message}</p>
                          <p className="notification-time">{notification.time}</p>
                          
                          <div className="notification-actions">
                            {!notification.read && (
                              <button onClick={() => handleMarkAsRead(notification.id)}>
                                Đánh Dấu Đã Đọc
                              </button>
                            )}
                            
                            <button onClick={() => handleDeleteNotification(notification.id)}>
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Cài Đặt Tài Khoản</h2>
                </div>
                
                <div className="settings-section">
                  <h3 className="settings-title">Thông Báo Email</h3>
                  
                  <div className="settings-option">
                    <div className="settings-option-label">
                      <label htmlFor="emailBookings">Xác nhận đặt phòng</label>
                      <p>Nhận thông báo email cho các xác nhận đặt phòng</p>
                    </div>
                    <div className="settings-option-control">
                      <input type="checkbox" id="emailBookings" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="settings-option-label">
                      <label htmlFor="emailPromotions">Khuyến mãi và ưu đãi</label>
                      <p>Nhận thông báo email về các ưu đãi và khuyến mãi đặc biệt</p>
                    </div>
                    <div className="settings-option-control">
                      <input type="checkbox" id="emailPromotions" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="settings-option-label">
                      <label htmlFor="emailNewsletter">Bản tin</label>
                      <p>Nhận bản tin hàng tháng của chúng tôi</p>
                    </div>
                    <div className="settings-option-control">
                      <input type="checkbox" id="emailNewsletter" />
                    </div>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h3 className="settings-title">Ngôn Ngữ và Tiền Tệ</h3>
                  
                  <div className="settings-form">
                    <div className="form-group">
                      <label htmlFor="language">Ngôn Ngữ</label>
                      <select id="language" defaultValue="vi">
                        <option value="en">Tiếng Anh</option>
                        <option value="fr">Tiếng Pháp</option>
                        <option value="es">Tiếng Tây Ban Nha</option>
                        <option value="de">Tiếng Đức</option>
                        <option value="vi">Tiếng Việt</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="currency">Tiền Tệ</label>
                      <select id="currency" defaultValue="vnd">
                        <option value="usd">USD ($)</option>
                        <option value="eur">EUR (€)</option>
                        <option value="gbp">GBP (£)</option>
                        <option value="jpy">JPY (¥)</option>
                        <option value="vnd">VND (₫)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h3 className="settings-title danger">Xóa Tài Khoản</h3>
                  <p className="settings-description">
                    Sau khi bạn xóa tài khoản, không thể hoàn tác. Vui lòng chắc chắn.
                  </p>
                  
                  <button className="btn btn-danger">Xóa Tài Khoản</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;