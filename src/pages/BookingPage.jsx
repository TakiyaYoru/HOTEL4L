// pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { services } from '../services';
import { BOOKING_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, ROOM_STATUS } from '../services/constants';
import { FaUser, FaUsers, FaCreditCard, FaCalendarAlt, FaDollarSign, FaExclamationCircle, FaCheckCircle, FaSpinner, FaPlus, FaTrash, FaArrowLeft, FaArrowRight, FaLock } from 'react-icons/fa';
import '../styles/BookingPage.css';

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // State để quản lý dữ liệu booking từ localStorage
  const [bookingData, setBookingData] = useState(() => {
    const savedData = localStorage.getItem('bookingData');
    return savedData ? JSON.parse(savedData) : null;
  });

  // State để quản lý form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    idCard: '',
    dob: '',
    gender: '',
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    useSavedCard: false,
    saveCard: false,
    transferConfirmed: false,
    specialRequests: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    companions: [],
  });

  // State để quản lý các bước trong quy trình đặt phòng
  const [currentStep, setCurrentStep] = useState(1);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasPaymentCard, setHasPaymentCard] = useState(false);
  const [paymentCardInfo, setPaymentCardInfo] = useState(null);

  // Kiểm tra dữ liệu booking khi component mount
  useEffect(() => {
    if (!bookingData) {
      navigate('/rooms');
    } else {
      checkRoomAvailability();
    }
  }, [bookingData, navigate]);

  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: location.pathname } });
    } else {
      fetchCustomerData();
    }
  }, [currentUser, navigate, location]);

  // Kiểm tra tính khả dụng của phòng dựa trên checkRoomAvailability
  const checkRoomAvailability = async () => {
    try {
      const response = await services.api.room.checkRoomAvailability(
        bookingData.roomId,
        bookingData.checkInDate,
        bookingData.checkOutDate
      );
      setIsRoomAvailable(response.isAvailable);
      if (!response.isAvailable) {
        setError('This room is not available for the selected dates. Please choose different dates or another room.');
      }
    } catch (err) {
      console.error('Error checking room availability:', err);
      setError('Error checking room availability');
      setIsRoomAvailable(false);
    }
  };

  // Lấy thông tin khách hàng và thẻ thanh toán
  const fetchCustomerData = async () => {
    try {
      const customerID = currentUser?.id || currentUser?.username;
      const customerData = await services.api.customer.fetchCustomerByUsername(customerID);
      if (customerData) {
        setFormData((prev) => ({
          ...prev,
          fullName: customerData.cName || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          address: customerData.address || '',
          idCard: customerData.idCard || '',
          dob: customerData.dob ? new Date(customerData.dob).toISOString().split('T')[0] : '',
          gender: customerData.gender || '',
        }));

        if (customerData.pan) {
          const paymentCard = await services.api.payment.fetchPaymentCard(customerData.pan);
          if (paymentCard) {
            setHasPaymentCard(true);
            setPaymentCardInfo(paymentCard);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching customer data:', err);
    }
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Thêm người đi cùng
  const handleAddCompanion = () => {
    setFormData((prev) => ({
      ...prev,
      companions: [
        ...prev.companions,
        { fullName: '', idCard: '', dob: '', gender: '' },
      ],
    }));
  };

  // Xử lý thay đổi thông tin người đi cùng
  const handleCompanionChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedCompanions = [...prev.companions];
      updatedCompanions[index] = { ...updatedCompanions[index], [name]: value };
      return { ...prev, companions: updatedCompanions };
    });
  };

  // Xóa người đi cùng
  const handleRemoveCompanion = (index) => {
    setFormData((prev) => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.idCard) {
      setError('Please fill in all required guest information');
      return false;
    }
    if (!services.utils.validation.validateEmail(formData.email)) {
      setError('Invalid email address');
      return false;
    }
    if (!services.utils.validation.validatePhone(formData.phone)) {
      setError('Invalid phone number');
      return false;
    }
    if (!services.utils.validation.validateIdCard(formData.idCard)) {
      setError('Invalid ID card number');
      return false;
    }
    return true;
  };

  // Validate phương thức thanh toán
  const validatePaymentMethod = () => {
    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    if (formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD || formData.paymentMethod === PAYMENT_METHODS.PAYPAL) {
      if (formData.useSavedCard) {
        if (!hasPaymentCard || !paymentCardInfo) {
          setError('No saved payment card found');
          return false;
        }
      } else {
        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
          setError('Please fill in all payment details');
          return false;
        }
      }
    } else if (formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER) {
      if (!formData.transferConfirmed) {
        setError('Please confirm the bank transfer');
        return false;
      }
    }
    return true;
  };

  // Kiểm tra xem form đã sẵn sàng để submit chưa
  const isFormReadyToSubmit = () => {
    if (currentStep === 1) {
      return validateForm();
    } else if (currentStep === 3) {
      return validatePaymentMethod();
    }
    return true;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isRoomAvailable) {
      setError('This room is not available for the selected dates. Please choose different dates or another room.');
      return;
    }
  
    if (!isFormReadyToSubmit()) {
      return;
    }
  
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    let createdBooking = null;
    let checkInCode = null;
    let originalRoomStatus = null;
  
    try {
      // Lấy trạng thái phòng hiện tại để rollback nếu cần
      const roomData = await services.api.room.fetchRoomById(bookingData.roomId);
      originalRoomStatus = roomData.roomStatus;
  
      // Format dates
      const checkInDate = services.utils.format.formatDateForApi(bookingData.checkInDate);
      const checkOutDate = services.utils.format.formatDateForApi(bookingData.checkOutDate);
  
      // Bước 1: Cập nhật thông tin khách hàng
      const customerID = currentUser?.id || currentUser?.username;
      let customerData = null;
      try {
        customerData = await services.api.customer.fetchCustomerByUsername(customerID);
        if (customerData) {
          const updatedCustomerData = {
            ...customerData,
            cName: formData.fullName,
            gender: formData.gender,
            email: formData.email,
            dob: formData.dob ? services.utils.format.formatDateForApi(formData.dob) : customerData.dob,
            phone: formData.phone,
            address: formData.address,
            idCard: formData.idCard,
          };
          await services.api.customer.updateCustomer(customerID, updatedCustomerData);
        }
      } catch (error) {
        console.error('Error updating customer information:', error);
      }
  
      // Bước 2: Tạo booking mới
      const timestamp = Date.now().toString().slice(-8);
      const bookingID = 'BOOK' + timestamp;
  
      let paymentID = null;
      let paymentStatus = PAYMENT_STATUS.PENDING;
      let bookingStatus = BOOKING_STATUS.PENDING;
  
      const bookingPayload = {
        bookingID: bookingID,
        bookingTime: new Date().toISOString(),
        totalAmount: bookingData.total,
        bookingStatus: bookingStatus,
        paymentStatus: false,
        paymentID: null,
        customerID: customerID,
        paymentMethod: formData.paymentMethod,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        idCard: formData.idCard,
        dob: formData.dob,
        gender: formData.gender,
        checkInCode: null,
        customer: customerData || {
          customerID: customerID,
          cName: formData.fullName,
          gender: formData.gender || "Unknown",
          email: formData.email || currentUser?.email || "guest@example.com",
          dob: formData.dob ? services.utils.format.formatDateForApi(formData.dob) : "1990-01-01T00:00:00",
          phone: formData.phone || "000-000-0000",
          address: formData.address || "Unknown",
          idCard: formData.idCard || "000000000000",
          point: 0,
        },
      };
  
      createdBooking = await services.api.booking.createBooking(bookingPayload);
  
      // Bước 3: Xử lý thanh toán
      if (
        formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD ||
        formData.paymentMethod === PAYMENT_METHODS.PAYPAL
      ) {
        try {
          if (hasPaymentCard && paymentCardInfo && formData.useSavedCard) {
            const verification = await services.api.payment.verifyPayment({
              amount: bookingData.total,
              pan: paymentCardInfo.pan,
              method: formData.paymentMethod,
            });
  
            if (verification.success) {
              paymentID = 'PAY' + Date.now().toString().slice(-8);
              await services.api.payment.createPayment({
                paymentID: paymentID,
                paymentMethod: formData.paymentMethod,
                totalAmount: bookingData.total,
                bookingID: createdBooking.bookingID,
                description: `Payment for booking ${createdBooking.bookingID}`,
              });
              paymentStatus = PAYMENT_STATUS.COMPLETED;
              bookingStatus = BOOKING_STATUS.CONFIRMED;
              checkInCode = services.utils.generateCheckInCode();
              console.log(`Payment successful for ${formData.paymentMethod}. Booking status: ${bookingStatus}`);
            } else {
              console.log(`Payment verification failed for ${formData.paymentMethod}. Booking status remains: ${bookingStatus}`);
            }
          } else if (formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv) {
            const verification = await services.api.payment.verifyPayment({
              amount: bookingData.total,
              cardNumber: formData.cardNumber,
              cardName: formData.cardName,
              expiryDate: formData.expiryDate,
              cvv: formData.cvv,
              method: formData.paymentMethod,
            });
  
            if (verification.success) {
              if (formData.saveCard) {
                try {
                  const [month, year] = formData.expiryDate.split('/');
                  await services.api.payment.addPaymentCard({
                    cardNumber: formData.cardNumber,
                    cardHolder: formData.cardName,
                    expiryMonth: month,
                    expiryYear: '20' + year,
                    bank: 'Unknown',
                  });
                  if (customerData) {
                    await services.api.customer.updateCustomer(customerID, {
                      ...customerData,
                      pan: formData.cardNumber.replace(/\s/g, ''),
                    });
                  }
                } catch (error) {
                  console.error('Error saving payment card:', error);
                }
              }
  
              paymentID = 'PAY' + Date.now().toString().slice(-8);
              await services.api.payment.createPayment({
                paymentID: paymentID,
                paymentMethod: formData.paymentMethod,
                totalAmount: bookingData.total,
                bookingID: createdBooking.bookingID,
                description: `Payment for booking ${createdBooking.bookingID}`,
              });
              paymentStatus = PAYMENT_STATUS.COMPLETED;
              bookingStatus = BOOKING_STATUS.CONFIRMED;
              checkInCode = services.utils.generateCheckInCode();
              console.log(`Payment successful for ${formData.paymentMethod}. Booking status: ${bookingStatus}`);
            } else {
              console.log(`Payment verification failed for ${formData.paymentMethod}. Booking status remains: ${bookingStatus}`);
            }
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          paymentStatus = PAYMENT_STATUS.FAILED;
          console.log(`Payment failed for ${formData.paymentMethod}. Booking status remains: ${bookingStatus}`);
        }
      } else if (formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && formData.transferConfirmed) {
        try {
          paymentID = 'PAY' + Date.now().toString().slice(-8);
          await services.api.payment.createPayment({
            paymentID: paymentID,
            paymentMethod: formData.paymentMethod,
            totalAmount: bookingData.total,
            bookingID: createdBooking.bookingID,
            description: `Bank transfer for booking ${createdBooking.bookingID}`,
          });
          paymentStatus = PAYMENT_STATUS.COMPLETED;
          bookingStatus = BOOKING_STATUS.CONFIRMED;
          checkInCode = services.utils.generateCheckInCode();
          console.log(`Payment successful for ${formData.paymentMethod}. Booking status: ${bookingStatus}`);
        } catch (error) {
          console.error('Error processing bank transfer:', error);
          paymentStatus = PAYMENT_STATUS.FAILED;
          console.log(`Payment failed for ${formData.paymentMethod}. Booking status remains: ${bookingStatus}`);
        }
      } else if (formData.paymentMethod === PAYMENT_METHODS.CASH) {
        paymentStatus = PAYMENT_STATUS.PENDING;
        bookingStatus = BOOKING_STATUS.PENDING;
        console.log(`Payment method is ${formData.paymentMethod}. Booking status: ${bookingStatus}`);
      }
  
      // Cập nhật booking với paymentID, paymentStatus, bookingStatus và checkInCode
      if (createdBooking) {
        const updatedBooking = await services.api.booking.updateBooking(createdBooking.bookingID, {
          ...createdBooking,
          paymentID: paymentID,
          paymentStatus: paymentStatus === PAYMENT_STATUS.COMPLETED,
          bookingStatus: bookingStatus,
          checkInCode: checkInCode,
        });
        console.log('Updated booking:', updatedBooking);
      }
  
      // Bước 4: Tạo booking detail
      const detailID = 'BD' + Date.now().toString().slice(-8);
      const bookingDetailPayload = {
        detailID: detailID,
        checkinDate: new Date(bookingData.checkInDate),
        checkoutDate: new Date(bookingData.checkOutDate),
        detailStatus: "Booked",
        pricePerDay: bookingData.price,
        totalPrice: bookingData.total,
        bookingID: createdBooking.bookingID,
        roomID: bookingData.roomId,
        guest_BDetails: [
          {
            detailID: detailID,
            guestID: `GUEST${Date.now().toString().slice(-4)}_0`,
            guestInfo: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              idCard: formData.idCard,
              dob: formData.dob,
              gender: formData.gender,
              isPrimary: true,
            },
          },
          ...formData.companions.map((companion, index) => ({
            detailID: detailID,
            guestID: `GUEST${Date.now().toString().slice(-4)}_${index + 1}`,
            guestInfo: {
              fullName: companion.fullName,
              idCard: companion.idCard,
              dob: companion.dob,
              gender: companion.gender,
              isPrimary: false,
            },
          })),
        ],
        eService_BDetails: bookingData.extraServices
          ? bookingData.extraServices.map((service) => ({
              detailID: detailID,
              eServiceID: service.id,
              quantity: service.quantity || 1,
            }))
          : [],
        specialRequests: formData.specialRequests,
      };
  
      await services.api.booking.createBookingDetail(bookingDetailPayload);
  
      // Bước 5: Cập nhật trạng thái phòng thành BOOKED
      try {
        const currentRoomData = await services.api.room.fetchRoomById(bookingData.roomId);
        const updatedRoomData = {
          roomID: currentRoomData.roomID,
          roomStatus: ROOM_STATUS.BOOKED,
          rTypeID: currentRoomData.rTypeID,
        };
        await services.api.room.updateRoom(bookingData.roomId, updatedRoomData);
        console.log(`Room ${bookingData.roomId} status updated to BOOKED`);
      } catch (error) {
        console.error('Error updating room status:', error);
        throw new Error('Failed to update room status');
      }
  
      // Gửi email xác nhận nếu trạng thái là CONFIRMED
      if (bookingStatus === BOOKING_STATUS.CONFIRMED) {
        try {
          await services.api.email.sendConfirmationEmail({
            to: formData.email,
            bookingID: createdBooking.bookingID,
            checkInCode: checkInCode,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            total: bookingData.total,
          });
          console.log('Confirmation email sent to:', formData.email);
        } catch (emailErr) {
          console.error('Error sending confirmation email:', emailErr);
        }
      }
  
      // Chuẩn bị dữ liệu cho trang checkout
      const bookingForCheckout = {
        id: createdBooking.bookingID,
        roomId: bookingData.roomId,
        roomName: bookingData.roomName,
        checkInDate: checkInDate,
        checkInTime: formData.checkInTime,
        checkOutDate: checkOutDate,
        checkOutTime: formData.checkOutTime,
        guests: bookingData.guests,
        price: bookingData.price,
        total: bookingData.total,
        status: bookingStatus.toLowerCase(),
        roomImage: bookingData.roomImage,
        bookingDate: services.utils.format.formatDateForApi(new Date()),
        paymentMethod: formData.paymentMethod,
        specialRequests: formData.specialRequests,
        checkInCode: checkInCode,
        primaryGuest: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          idCard: formData.idCard,
          dob: formData.dob,
          gender: formData.gender,
        },
        companions: formData.companions,
        timeline: [
          {
            date: services.utils.format.formatDateForApi(new Date()),
            text: 'Booking created',
            icon: 'FaCalendarAlt',
          },
          {
            date: services.utils.format.formatDateForApi(new Date()),
            text:
              formData.paymentMethod === PAYMENT_METHODS.CASH
                ? 'Payment pending'
                : paymentStatus === PAYMENT_STATUS.COMPLETED
                ? 'Payment confirmed'
                : 'Payment failed',
            icon: 'FaCreditCard',
          },
        ],
      };
  
      // Xóa dữ liệu tạm
      localStorage.removeItem('bookingData');
  
      setSuccess(true);
      navigate('/checkout', { state: { booking: bookingForCheckout } });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(services.utils.api.handleApiError(err));
      setLoading(false);
  
      // Rollback: Xóa booking nếu có lỗi
      if (createdBooking) {
        try {
          await services.api.booking.deleteBooking(createdBooking.bookingID);
          console.log('Rolled back: Booking deleted due to error');
        } catch (rollbackErr) {
          console.error('Error rolling back booking:', rollbackErr);
        }
      }
  
      // Rollback: Khôi phục trạng thái phòng nếu có lỗi
      if (originalRoomStatus && originalRoomStatus !== ROOM_STATUS.BOOKED) {
        try {
          const currentRoomData = await services.api.room.fetchRoomById(bookingData.roomId);
          const updatedRoomData = {
            roomID: currentRoomData.roomID,
            roomStatus: originalRoomStatus,
            rTypeID: currentRoomData.rTypeID,
          };
          await services.api.room.updateRoom(bookingData.roomId, updatedRoomData);
          console.log(`Rolled back: Room ${bookingData.roomId} status restored to ${originalRoomStatus}`);
        } catch (rollbackErr) {
          console.error('Error rolling back room status:', rollbackErr);
        }
      }
    }
  };

  // Chuyển đến bước tiếp theo
  const handleNextStep = () => {
    if (currentStep === 1 && !validateForm()) {
      return;
    }
    if (currentStep === 3 && !validatePaymentMethod()) {
      return;
    }
    setCurrentStep((prev) => prev + 1);
    setError(null);
  };

  // Quay lại bước trước
  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError(null);
  };

  // Chuyển đến bước cụ thể
  const handleStepClick = (step) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      setError(null);
    }
  };

  // Render form theo từng bước
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h2>Guest Information</h2>
            <p className="section-description">
              Please provide your personal information to proceed with the booking.
            </p>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ID Card Number *</label>
                <input
                  type="text"
                  name="idCard"
                  value={formData.idCard}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => navigate('/rooms')}>
                <FaArrowLeft /> Back to Rooms
              </button>
              <button className="btn-primary" onClick={handleNextStep}>
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h2>Companions</h2>
            <p className="section-description">
              Add information about any companions traveling with you (if applicable).
            </p>
            {formData.companions.length === 0 ? (
              <div className="no-companions-message">
                <FaUsers className="icon" />
                <p>No companions added yet.</p>
              </div>
            ) : (
              formData.companions.map((companion, index) => (
                <div key={index} className="companion-form">
                  <h3>Companion {index + 1}</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={companion.fullName}
                        onChange={(e) => handleCompanionChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>ID Card Number</label>
                      <input
                        type="text"
                        name="idCard"
                        value={companion.idCard}
                        onChange={(e) => handleCompanionChange(index, e)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={companion.dob}
                        onChange={(e) => handleCompanionChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={companion.gender}
                        onChange={(e) => handleCompanionChange(index, e)}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => handleRemoveCompanion(index)}
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              ))
            )}
            <button className="btn-primary" onClick={handleAddCompanion}>
              <FaPlus /> Add Companion
            </button>
            <div className="form-actions">
              <button className="btn-secondary" onClick={handlePreviousStep}>
                <FaArrowLeft /> Previous
              </button>
              <button className="btn-primary" onClick={handleNextStep}>
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-section">
            <h2>Payment & Confirmation</h2>
            <p className="section-description">
              Select your payment method and add any special requests.
            </p>
            <div className="form-group">
              <label>Payment Method *</label>
              <div className="payment-methods">
                <div className="payment-method">
                  <input
                    type="radio"
                    id="creditCard"
                    name="paymentMethod"
                    value={PAYMENT_METHODS.CREDIT_CARD}
                    checked={formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="creditCard">
                    <FaCreditCard /> Credit Card
                  </label>
                </div>
                <div className="payment-method">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value={PAYMENT_METHODS.PAYPAL}
                    checked={formData.paymentMethod === PAYMENT_METHODS.PAYPAL}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="paypal">
                    <FaLock /> PayPal
                  </label>
                </div>
                <div className="payment-method">
                  <input
                    type="radio"
                    id="bankTransfer"
                    name="paymentMethod"
                    value={PAYMENT_METHODS.BANK_TRANSFER}
                    checked={formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="bankTransfer">
                    <FaDollarSign /> Bank Transfer
                  </label>
                </div>
                <div className="payment-method">
                  <input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value={PAYMENT_METHODS.CASH}
                    checked={formData.paymentMethod === PAYMENT_METHODS.CASH}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="cash">
                    <FaDollarSign /> Cash
                  </label>
                </div>
              </div>
            </div>

            {(formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD ||
              formData.paymentMethod === PAYMENT_METHODS.PAYPAL) && (
              <div className="credit-card-form">
                {hasPaymentCard && (
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="useSavedCard"
                        checked={formData.useSavedCard}
                        onChange={handleInputChange}
                      />
                      Use Saved Card (**** **** **** {paymentCardInfo?.pan?.slice(-4)})
                    </label>
                  </div>
                )}
                {!formData.useSavedCard && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date (MM/YY) *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          name="saveCard"
                          checked={formData.saveCard}
                          onChange={handleInputChange}
                        />
                        Save Card for Future Use
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && (
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="transferConfirmed"
                    checked={formData.transferConfirmed}
                    onChange={handleInputChange}
                  />
                  I have completed the bank transfer
                </label>
              </div>
            )}

            {formData.paymentMethod === PAYMENT_METHODS.CASH && (
              <p className="section-description">
                You will pay in cash upon arrival at the hotel.
              </p>
            )}

            <div className="form-group">
              <label>Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handlePreviousStep}>
                <FaArrowLeft /> Previous
              </button>
              <button className="btn(primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="loading-spinner" /> Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!bookingData) {
    return (
      <div className="loading-indicator">
        <FaSpinner />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <h1>Book Your Stay</h1>
        <p>Complete the steps below to confirm your booking.</p>
      </div>

      <div className="step-indicators">
        <div
          className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}
          onClick={() => handleStepClick(1)}
        >
          <div className="step-number">1</div>
          <span className="step-label">Guest Information</span>
        </div>
        <div
          className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}
          onClick={() => handleStepClick(2)}
        >
          <div className="step-number">2</div>
          <span className="step-label">Companions</span>
        </div>
        <div
          className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}
          onClick={() => handleStepClick(3)}
        >
          <div className="step-number">3</div>
          <span className="step-label">Payment</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationCircle /> {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          <FaCheckCircle /> Booking created successfully!
        </div>
      )}

      <div className="booking-content">
        <div className="booking-form-container">{renderStep()}</div>

        <div className="booking-summary">
          <div className="summary-card">
            <h2>Booking Summary</h2>
            <div
              className="summary-image"
              style={{
                backgroundImage: `url(${bookingData.roomImage || 'https://via.placeholder.com/300'})`,
              }}
            />
            <div className="summary-details">
              <h3>{bookingData.roomName}</h3>
              <div className="summary-item">
                <FaCalendarAlt className="summary-icon" />
                <div className="summary-text">
                  <span className="summary-label">Check-in</span>
                  <span>{new Date(bookingData.checkInDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaCalendarAlt className="summary-icon" />
                <div className="summary-text">
                  <span className="summary-label">Check-out</span>
                  <span>{new Date(bookingData.checkOutDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaUsers className="summary-icon" />
                <div className="summary-text">
                  <span className="summary-label">Guests</span>
                  <span>{bookingData.guests}</span>
                </div>
              </div>
            </div>
            <div className="summary-pricing">
              <div className="price-item">
                <span>Price per Night</span>
                <span>${bookingData.price.toFixed(2)}</span>
              </div>
              {bookingData.extraServices && bookingData.extraServices.length > 0 && (
                <div className="price-item">
                  <span>Extra Services</span>
                  <span>
                    $
                    {bookingData.extraServices
                      .reduce((total, service) => total + (service.price * (service.quantity || 1)), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
              <div className="price-total">
                <span>Total</span>
                <span>${bookingData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;