import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaCreditCard, FaMoneyBillWave, FaPaypal, FaUniversity, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { createBooking, checkRoomAvailability, createBookingDetail, fetchCustomerByUsername, updateCustomer } from '../services/api';
import '../styles/BookingPage.css';

function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openLoginModal } = useAuth();
  
  // Lấy dữ liệu đặt phòng từ state hoặc localStorage
  const [bookingData, setBookingData] = useState(() => {
    const stateData = location.state;
    if (stateData) {
      return stateData;
    }
    
    const storedData = localStorage.getItem('bookingData');
    return storedData ? JSON.parse(storedData) : null;
  });
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ')[1] || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    idCard: '',
    dob: '',
    gender: '',
    specialRequests: '',
    paymentMethod: 'creditCard',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // State cho loading và error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Nếu không có dữ liệu đặt phòng, chuyển hướng về trang phòng
  useEffect(() => {
    if (!bookingData) {
      navigate('/rooms');
    }
  }, [bookingData, navigate]);
  
  // Nếu người dùng chưa đăng nhập, hiển thị modal đăng nhập
  useEffect(() => {
    if (!currentUser) {
      openLoginModal('/booking');
    }
  }, [currentUser, openLoginModal]);

  // Kiểm tra phòng có sẵn không
  useEffect(() => {
    const checkAvailability = async () => {
      if (bookingData && bookingData.roomId) {
        try {
          setLoading(true);
          
          const checkInDate = bookingData.checkInDate instanceof Date 
            ? bookingData.checkInDate.toISOString().split('T')[0] 
            : bookingData.checkInDate;
          
          const checkOutDate = bookingData.checkOutDate instanceof Date 
            ? bookingData.checkOutDate.toISOString().split('T')[0] 
            : bookingData.checkOutDate;
          
          // Gọi API để kiểm tra phòng có sẵn không
          const availability = await checkRoomAvailability(bookingData.roomId, checkInDate, checkOutDate);
          setIsRoomAvailable(availability.isAvailable);
          
          setLoading(false);
        } catch (err) {
          console.error('Error checking room availability:', err);
          setError('Failed to check room availability. Please try again.');
          setIsRoomAvailable(true);
          setLoading(false);
        }
      }
    };
    
    checkAvailability();
  }, [bookingData]);
  
  if (!bookingData) {
    return <div className="container">Loading...</div>;
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isRoomAvailable) {
      setError('This room is no longer available for the selected dates. Please choose different dates or another room.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(False);
    
    try {
      // Chuẩn bị dữ liệu đặt phòng
      const checkInDate = bookingData.checkInDate instanceof Date 
        ? bookingData.checkInDate.toISOString().split('T')[0] 
        : bookingData.checkInDate;
      
      const checkOutDate = bookingData.checkOutDate instanceof Date 
        ? bookingData.checkOutDate.toISOString().split('T')[0] 
        : bookingData.checkOutDate;
      
      // Bước 1: Cập nhật thông tin khách hàng
      const customerID = currentUser?.id || currentUser?.username;
      console.log('Updating customer information for:', customerID);
      
      let customerData = null;
      try {
        // Lấy thông tin khách hàng hiện tại
        customerData = await fetchCustomerByUsername(customerID);
        console.log('Fetched customer data:', customerData);
        
        if (customerData) {
          // Cập nhật thông tin khách hàng với dữ liệu mới từ form
          const updatedCustomerData = {
            ...customerData,
            cName: `${formData.firstName} ${formData.lastName}`,
            gender: formData.gender,
            email: formData.email,
            dob: formData.dob ? new Date(formData.dob).toISOString() : customerData.dob,
            phone: formData.phone,
            address: formData.address,
            idCard: formData.idCard
          };
          
          console.log('Updating customer with data:', JSON.stringify(updatedCustomerData, null, 2));
          const updatedCustomer = await updateCustomer(customerID, updatedCustomerData);
          console.log('Customer information updated successfully:', updatedCustomer);
        }
      } catch (error) {
        console.error('Error updating customer information:', error);
        // Tiếp tục quá trình đặt phòng ngay cả khi không thể cập nhật thông tin khách hàng
      }
      
      // Bước 2: Tạo booking mới
      // Tạo ID cho booking
      const bookingID = 'BOOK' + Date.now().toString().slice(-8);
      const paymentID = 'PAY' + Date.now().toString().slice(-8);
      
      // Tạo dữ liệu booking theo cấu trúc API
      const bookingPayload = {
        bookingID: bookingID,
        bookingTime: new Date().toISOString(),
        totalAmount: bookingData.total,
        bookingStatus: "Confirmed",
        paymentStatus: formData.paymentMethod === 'cash' ? false : true,
        paymentID: formData.paymentMethod !== 'cash' ? paymentID : null,
        customerID: customerID,
        employeeID: "emp000001", // Sử dụng employeeID mặc định theo yêu cầu
        paymentMethod: formData.paymentMethod,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        idCard: formData.idCard,
        dob: formData.dob,
        gender: formData.gender,
        cardNumber: formData.cardNumber,
        payment: formData.paymentMethod !== 'cash' ? {
          paymentID: paymentID,
          paymentTime: new Date().toISOString(),
          method: getPaymentMethodName(formData.paymentMethod),
          details: "Online payment",
          totalAmount: bookingData.total,
          pan: formData.paymentMethod === 'creditCard' ? formData.cardNumber.replace(/\s/g, '') : null,
          bookingID: bookingID,
          paymentCard: null,
          booking: null
        } : null,
        customer: customerData || {
          customerID: customerID,
          cName: `${formData.firstName} ${formData.lastName}`,
          gender: formData.gender || "Unknown",
          email: formData.email || currentUser?.email || "guest@example.com",
          dob: formData.dob ? new Date(formData.dob).toISOString() : "1990-01-01T00:00:00",
          phone: formData.phone || "000-000-0000",
          address: formData.address || "Unknown",
          idCard: formData.idCard || "000000000000",
          point: 0,
          pan: null,
          paymentCard: null,
          bookings: [null]
        },
        employee: {
          employeeID: "emp000001",
          eName: "Emily Thomas",
          dob: "1995-08-05T00:00:00",
          hireDate: "2018-04-20T00:00:00",
          salary: 50000,
          email: "emily.thomas@email.com",
          phone: "777-888-9999",
          managerID: "man000001",
          manager: null,
          shifts: null
        },
        bookingDetails: []
      };
      
      console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));
      
      // Gọi API để tạo booking
      const createdBooking = await createBooking(bookingPayload);
      console.log('Booking created successfully:', createdBooking);
      
      // Bước 3: Tạo booking detail
      // Tạo ID cho booking detail
      const detailID = 'BD' + Date.now().toString().slice(-8);
      
      // Tạo dữ liệu booking detail theo cấu trúc API
      const bookingDetailPayload = {
        detailID: detailID,
        checkinDate: checkInDate + "T14:00:00", // Thêm thời gian check-in mặc định (2PM)
        checkoutDate: checkOutDate + "T12:00:00", // Thêm thời gian check-out mặc định (12PM)
        detailStatus: "Booked",
        pricePerDay: bookingData.price,
        totalPrice: bookingData.total,
        bookingID: createdBooking.bookingID || bookingID,
        roomID: bookingData.roomId,
        // Tạo guest_BDetails theo số lượng khách
        guest_BDetails: Array.from({ length: bookingData.guests }, (_, index) => ({
          detailID: detailID,
          guestID: `GUEST${Date.now().toString().slice(-4)}_${index}`,
          guestInfo: index === 0 ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            idCard: formData.idCard,
            dob: formData.dob,
            gender: formData.gender
          } : null
        })),
        // Thêm dịch vụ bổ sung nếu có
        eService_BDetails: bookingData.extraServices ? bookingData.extraServices.map(service => ({
          detailID: detailID,
          eServiceID: service.id,
          quantity: service.quantity || 1
        })) : [],
        // Thêm yêu cầu đặc biệt
        specialRequests: formData.specialRequests
      };
      
      console.log('Booking detail payload:', JSON.stringify(bookingDetailPayload, null, 2));
      
      // Gọi API để tạo booking detail
      const createdBookingDetail = await createBookingDetail(bookingDetailPayload);
      console.log('Booking detail created successfully:', createdBookingDetail);
      
      // Chuẩn bị dữ liệu đặt phòng để hiển thị trong trang checkout
      const bookingForCheckout = {
        id: createdBooking.bookingID,
        roomId: bookingData.roomId,
        roomName: bookingData.roomName,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: bookingData.guests,
        price: bookingData.price,
        total: bookingData.total,
        status: 'confirmed',
        roomImage: bookingData.roomImage,
        bookingDate: new Date().toISOString().split('T')[0],
        paymentMethod: getPaymentMethodName(formData.paymentMethod),
        specialRequests: formData.specialRequests,
        guestInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          idCard: formData.idCard,
          dob: formData.dob,
          gender: formData.gender
        },
        timeline: [
          { date: new Date().toISOString().split('T')[0], text: 'Booking created', icon: 'FaCalendarAlt' },
          { date: new Date().toISOString().split('T')[0], text: formData.paymentMethod === 'cash' ? 'Payment pending' : 'Payment confirmed', icon: 'FaCreditCard' }
        ]
      };
      
      // Xóa dữ liệu đặt phòng tạm thời
      localStorage.removeItem('bookingData');
      
      setSuccess(true);
      
      // Chuyển hướng đến trang xác nhận đặt phòng
      navigate('/checkout', { state: { booking: bookingForCheckout } });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
      setLoading(false);
    }
  };
  
  // Lấy tên phương thức thanh toán
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'creditCard':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'bankTransfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return 'Credit Card';
    }
  };
  
  // Format ngày
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="container">
      <div className="booking-page">
        <div className="booking-header">
          <h1>Complete Your Booking</h1>
          <p>Please fill in your details to complete the booking process</p>
        </div>
        
        <div className="booking-content">
          <div className="booking-form-container">
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Guest Information</h2>
                
                {error && (
                  <div className="error-message">
                    <FaExclamationTriangle /> {error}
                  </div>
                )}
                
                {success && (
                  <div className="success-message">
                    <FaCheck /> Booking created successfully!
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name*</label>
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
                    <label htmlFor="lastName">Last Name*</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone*</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="idCard">ID Card/Passport*</label>
                    <input
                      type="text"
                      id="idCard"
                      name="idCard"
                      value={formData.idCard}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your ID card or passport number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth*</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender">Gender*</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address">Address*</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="specialRequests">Special Requests (Optional)</label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any special requests or preferences for your stay"
                  ></textarea>
                </div>
              </div>
              
              <div className="form-section">
                <h2>Payment Method</h2>
                
                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="creditCard"
                      name="paymentMethod"
                      value="creditCard"
                      checked={formData.paymentMethod === 'creditCard'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="creditCard">
                      <FaCreditCard />
                      <span>Credit Card</span>
                    </label>
                  </div>
                  
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="paypal">
                      <FaPaypal />
                      <span>PayPal</span>
                    </label>
                  </div>
                  
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="bankTransfer"
                      name="paymentMethod"
                      value="bankTransfer"
                      checked={formData.paymentMethod === 'bankTransfer'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="bankTransfer">
                      <FaUniversity />
                      <span>Bank Transfer</span>
                    </label>
                  </div>
                  
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="cash"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="cash">
                      <FaMoneyBillWave />
                      <span>Cash on Arrival</span>
                    </label>
                  </div>
                </div>
                
                {formData.paymentMethod === 'creditCard' && (
                  <div className="credit-card-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cardName">Name on Card</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="loading-spinner" />
                      Processing...
                    </>
                  ) : (
                    'Complete Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="booking-summary">
            <div className="summary-card">
              <h2>Booking Summary</h2>
              
              <div className="summary-image" style={{ backgroundImage: `url(${bookingData.roomImage})` }}></div>
              
              <div className="summary-details">
                <h3>{bookingData.roomName}</h3>
                
                <div className="summary-item">
                  <div className="summary-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="summary-text">
                    <span className="summary-label">Check-in</span>
                    <span>{formatDate(bookingData.checkInDate)}</span>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="summary-text">
                    <span className="summary-label">Check-out</span>
                    <span>{formatDate(bookingData.checkOutDate)}</span>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-icon">
                    <FaUsers />
                  </div>
                  <div className="summary-text">
                    <span className="summary-label">Guests</span>
                    <span>{bookingData.guests}</span>
                  </div>
                </div>
              </div>
              
              <div className="summary-pricing">
                <div className="price-item">
                  <span>Room Rate</span>
                  <span>${bookingData.price} x {bookingData.nights} nights</span>
                </div>
                
                <div className="price-item">
                  <span>Room Total</span>
                  <span>${bookingData.price * bookingData.nights}</span>
                </div>
                
                <div className="price-item">
                  <span>Tax (10%)</span>
                  <span>${(bookingData.price * bookingData.nights * 0.1).toFixed(2)}</span>
                </div>
                
                <div className="price-total">
                  <span>Total</span>
                  <span>${bookingData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
