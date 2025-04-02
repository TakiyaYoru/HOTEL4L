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
  
    setSuccessMessage('Payment method updated successfully!');
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
      roomName: 'Deluxe Room',
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
      roomName: 'Executive Suite',
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
      name: 'Ocean View Room',
      price: 180,
      image: '/images/Rooms/ocean-view-room-1.jpg'
    },
    {
      id: 'r002',
      name: 'Presidential Suite',
      price: 350,
      image: '/images/Rooms/presidential-suite-1.jpg'
    },
    {
      id: 'r003',
      name: 'Family Room',
      price: 200,
      image: '/images/Rooms/family-room-1.jpg'
    }
  ]);
  
  // Mock data for notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'n001',
      title: 'Booking Confirmed',
      message: 'Your booking for Deluxe Room has been confirmed.',
      time: '2 days ago',
      read: true
    },
    {
      id: 'n002',
      title: 'Special Offer',
      message: 'Get 20% off on your next booking with code SUMMER20.',
      time: '1 week ago',
      read: false
    },
    {
      id: 'n003',
      title: 'Upcoming Stay',
      message: 'Your stay at our hotel is coming up in 3 days. We look forward to welcoming you!',
      time: 'Just now',
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
          address: '123 Main Street',
          city: 'New York',
          country: 'United States',
          birthdate: '1990-01-01',
          gender: 'Male',
          bio: 'I love traveling and experiencing luxury hotels around the world.'
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
  
    setSuccessMessage('Profile updated successfully!');
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
      setErrorMessage('New passwords do not match');
      return;
    }
    
    // In a real app, you would send the password change request to an API
    setSuccessMessage('Password changed successfully!');
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
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get user's first initial for avatar
  const getInitial = () => {
    if (currentUser?.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    if (formData.firstName) {
      return formData.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  // Get role display name
  const getRoleDisplay = () => {
    if (!currentUser) return '';
    
    switch (currentUser.role) {
      case 'admin':
        return 'Administrator';
      case 'employee':
        return 'Employee';
      case 'customer':
        return 'Customer';
      default:
        return 'User';
    }
  };
  
  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings and preferences</p>
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
                <FaCamera /> Change Photo
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
                Personal Information
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaLock />
                Security
              </div>
              <div 

                className={`profile-menu-item ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                <FaDollarSign />
                Payment Method
              </div>

              <div 
                className={`profile-menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <FaHistory />
                My Bookings
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                <FaHeart />
                Favorites
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </div>
              
              <div 
                className={`profile-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <FaCog />
                Account Settings
              </div>
              
              <div 
                className="profile-menu-item"
                onClick={logout}
              >
                <FaSignOutAlt />
                Logout
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="profile-main">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>Personal Information</h2>
                  <button onClick={() => setEditMode(!editMode)}>
                    <FaEdit />
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {editMode ? (
                  <form className="profile-form" onSubmit={handleSaveProfile}>
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
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
                      <label htmlFor="lastName">Last Name</label>
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
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="birthdate">Date of Birth</label>
                      <input
                        type="date"
                        id="birthdate"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="bio">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info">
                    <div className="profile-form">
                      <div className="form-group">
                        <label>First Name</label>
                        <p>{formData.firstName}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Last Name</label>
                        <p>{formData.lastName}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Email</label>
                        <p>{formData.email}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Phone</label>
                        <p>{formData.phone}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <p>{formData.birthdate ? formatDate(formData.birthdate) : 'Not provided'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Gender</label>
                        <p>{formData.gender || 'Not provided'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Address</label>
                        <p>{formData.address || 'Not provided'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>City</label>
                        <p>{formData.city || 'Not provided'}</p>
                      </div>
                      
                      <div className="form-group">
                        <label>Country</label>
                        <p>{formData.country || 'Not provided'}</p>
                      </div>
                      
                      <div className="form-group full-width">
                        <label>Bio</label>
                        <p>{formData.bio || 'Not provided'}</p>
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
                  <h2>Security</h2>
                </div>
                
                <div className="security-section">
                  <h3 className="security-title">Change Password</h3>
                  <p className="security-description">
                    Ensure your account is using a strong password for better security.
                  </p>
                  
                  <form className="profile-form" onSubmit={handleChangePassword}>
                    <div className="form-group full-width">
                      <label htmlFor="currentPassword">Current Password</label>
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
                      <label htmlFor="newPassword">New Password</label>
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
                      <label htmlFor="confirmPassword">Confirm New Password</label>
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
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="security-section">
                  <h3 className="security-title">Account Activity</h3>
                  <p className="security-description">
                    Monitor and manage your account activity for security purposes.
                  </p>
                  
                  <div className="activity-list">
                    <div className="activity-item">
                      <p><strong>Last login:</strong> Today at 2:30 PM</p>
                      <p><strong>Device:</strong> Chrome on Windows</p>
                      <p><strong>Location:</strong> New York, United States</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
            <div className="profile-section">
              <div className="profile-section-title">
                <h2>Payment Method</h2>
                <button onClick={() => setEditMode(!editMode)}>
                  <FaEdit />
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <form className="profile-form" onSubmit={handleSavePayment}>
                  <div className="form-group">
                    <label htmlFor="cardType">Card Type</label>
                    <div className="card-type-selector">
                      <select
                        id="cardType"
                        name="cardType"
                        value={paymentData.cardType}
                        onChange={handlePaymentChange}
                        required
                      >
                        <option value="">Select Card Type</option>
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
                    <label htmlFor="cardNumber">Card Number</label>
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
                    <label htmlFor="expiryDate">Expiry Date</label>
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
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="payment-info">
                <div className="form-group">
                  <label>Card Type</label>
                  <div className="card-type-container">
                    <p>{paymentData.cardType || 'Not provided'}</p>
                    
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
                    <label>Card Number</label>
                    <p>{paymentData.cardNumber ? paymentData.cardNumber.replace(/\d{4}(?=\d)/g, '**** ') : 'Not provided'}</p>
                  </div>

                  <div className="form-group">
                    <label>Expiry Date</label>
                    <p>{paymentData.expiryDate || 'Not provided'}</p>
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <p>{paymentData.cvv ? '***' : 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="profile-section">
                <div className="profile-section-title">
                  <h2>My Bookings</h2>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>You don't have any bookings yet.</p>
                    <Link to="/rooms" className="btn btn-primary">Browse Rooms</Link>
                  </div>
                ) : (
                  <div className="booking-list">
                    {bookings.map(booking => (
                      <div className="booking-card" key={booking.id}>
                        <div className="booking-header">
                          <h3 className="booking-title">{booking.roomName}</h3>
                          <div className="booking-dates">
                            <span>{formatDate(booking.checkIn)}</span>
                            <span>to</span>
                            <span>{formatDate(booking.checkOut)}</span>
                          </div>
                        </div>
                        
                        <div className="booking-content">
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
                            
                            <div className="booking-detail">
                              <span className="booking-detail-label">Status</span>
                              <span className={`booking-status status-${booking.status}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="booking-actions">
                            <Link to={`/rooms/${booking.id}`} className="btn btn-secondary">
                              View Room
                            </Link>
                            
                            {booking.status === 'confirmed' && (
                              <button 
                                className="btn btn-secondary"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel Booking
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
                  <h2>Favorites</h2>
                </div>
                
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <p>You don't have any favorite rooms yet.</p>
                    <Link to="/rooms" className="btn btn-primary">Browse Rooms</Link>
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
                          <p className="favorite-price">${room.price} / night</p>
                          
                          <div className="favorite-actions">
                            <Link to={`/rooms/${room.id}`} className="btn btn-secondary">
                              View Details
                            </Link>
                            
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleRemoveFavorite(room.id)}
                            >
                              Remove
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
                  <h2>Notifications</h2>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>You don't have any notifications.</p>
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
                                Mark as read
                              </button>
                            )}
                            
                            <button onClick={() => handleDeleteNotification(notification.id)}>
                              Delete
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
                  <h2>Account Settings</h2>
                </div>
                
                <div className="settings-section">
                  <h3 className="settings-title">Email Notifications</h3>
                  
                  <div className="settings-option">
                    <div className="settings-option-label">
                      <label htmlFor="emailBookings">Booking confirmations</label>
                      <p>Receive email notifications for booking confirmations</p>
                    </div>
                    <div className="settings-option-control">
                      <input type="checkbox" id="emailBookings" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="settings-option-label">
                      <label htmlFor="emailPromotions">Promotions and offers</label>
                      <p>Receive email notifications about special offers and promotions</p>
                    </div>
                    <div className="settings-option-control">
                      <input type="checkbox" id="emailPromotions" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="settings-option-label">
                      <label htmlFor="emailNewsletter">Newsletter</label>
                      <p>Receive our monthly newsletter</p>
                    </div>
                    <div className="settings-option-control">
                      <input type="checkbox" id="emailNewsletter" />
                    </div>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h3 className="settings-title">Language and Currency</h3>
                  
                  <div className="settings-form">
                    <div className="form-group">
                      <label htmlFor="language">Language</label>
                      <select id="language" defaultValue="en">
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                        <option value="vi">Vietnamese</option>
                      </select>
                    </div>

                    <div className="payment-info">
                    <div className="form-group">
                      <label>Card Type</label>
                      <p>{paymentData.cardType || 'Not provided'}</p>
                    </div>

                    <div className="form-group">
                      <label>Card Number</label>
                      <p>{paymentData.cardNumber ? paymentData.cardNumber.replace(/\d{4}(?=\d)/g, '**** ') : 'Not provided'}</p>
                    </div>

                    <div className="form-group">
                      <label>Expiry Date</label>
                      <p>{paymentData.expiryDate || 'Not provided'}</p>
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <p>{paymentData.cvv ? '***' : 'Not provided'}</p>
                    </div>
                  </div>

                    <div className="form-group">
                      <label htmlFor="currency">Currency</label>
                      <select id="currency" defaultValue="usd">
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
                  <h3 className="settings-title danger">Delete Account</h3>
                  <p className="settings-description">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  <button className="btn btn-danger">Delete Account</button>
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
