import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaSpinner, FaCheck, FaArrowRight, FaArrowLeft, FaCalendarAlt, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { services } from '../services';
import { PAYMENT_METHODS, BOOKING_STATUS, PAYMENT_STATUS } from '../services/constants';
import '../styles/BookingPage.css';

// Import các component con
import GuestInformationForm from '../components/booking/GuestInformationForm';
import CompanionsInformationForm from '../components/booking/CompanionsInformationForm';
import PaymentMethodForm from '../components/booking/PaymentMethodForm';
import BookingSummary from '../components/booking/BookingSummary';

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
  
  // State cho các bước đặt phòng
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state
  const [formData, setFormData] = useState({
    // Thông tin người đặt phòng
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    idCard: '',
    dob: '',
    gender: '',
    specialRequests: '',
    
    // Thông tin thanh toán
    paymentMethod: '', // Không đặt mặc định để người dùng phải chọn
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    useSavedCard: true, // Sử dụng thẻ đã lưu (nếu có)
    transferConfirmed: false, // Xác nhận đã chuyển khoản
    saveCard: true, // Lưu thẻ mới
    
    // Thời gian check-in/check-out
    checkInTime: '14:00',
    checkOutTime: '12:00',
    
    // Thông tin người đi cùng
    companions: Array(bookingData?.guests > 1 ? bookingData.guests - 1 : 0).fill().map(() => ({
      fullName: '',
      idCard: '',
      dob: '',
      gender: ''
    }))
  });

  // State cho loading và error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // State cho thông tin thẻ thanh toán
  const [hasPaymentCard, setHasPaymentCard] = useState(false);
  const [paymentCardInfo, setPaymentCardInfo] = useState(null);
  
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
          
          const checkInDate = services.utils.format.formatDateForApi(bookingData.checkInDate);
          const checkOutDate = services.utils.format.formatDateForApi(bookingData.checkOutDate);
          
          // Gọi API để kiểm tra phòng có sẵn không
          const availability = await services.api.room.checkRoomAvailability(
            bookingData.roomId,
            checkInDate,
            checkOutDate
          );
          setIsRoomAvailable(availability.isAvailable);
          
          setLoading(false);
        } catch (err) {
          console.error('Error checking room availability:', err);
          setError(services.utils.api.handleApiError(err));
          setIsRoomAvailable(true);
          setLoading(false);
        }
      }
    };
    
    checkAvailability();
  }, [bookingData]);
  
  // Lấy thông tin thẻ thanh toán của người dùng
  useEffect(() => {
    const fetchPaymentCardInfo = async () => {
      if (currentUser && currentStep === 3) {
        try {
          const customerID = currentUser.id || currentUser.username;
          
          // Kiểm tra xem customer có payment card không
          const { hasPaymentCard, pan } = await services.api.payment.checkCustomerPaymentCard(customerID);
          setHasPaymentCard(hasPaymentCard);
          
          if (hasPaymentCard && pan) {
            // Lấy thông tin thẻ
            const paymentCard = await services.api.payment.fetchPaymentCardByPAN(pan);
            setPaymentCardInfo(paymentCard);
          }
        } catch (error) {
          console.error('Error fetching payment card info:', error);
          setHasPaymentCard(false);
          setPaymentCardInfo(null);
        }
      }
    };
    
    fetchPaymentCardInfo();
  }, [currentUser, currentStep]);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!services.utils.validation.validateEmail(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!services.utils.validation.validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone number format (XXX-XXXX-XXXXX)';
    }

    if (!services.utils.validation.validateIdCard(formData.idCard)) {
      errors.idCard = 'Invalid ID card number';
    }

    // Validate companions data if there are any and only if we're on step 2 or submitting the form
    if (currentStep === 2 && formData.companions.length > 0) {
      const companionErrors = formData.companions.map((companion, index) => {
        const errors = {};
        if (!companion.fullName.trim()) {
          errors.fullName = `Yêu cầu nhập tên đầy đủ của người bạn đồng hành ${index + 1}`;
        }
        if (!companion.idCard.trim()) {
          errors.idCard = `Yêu cầu nhập thẻ căn cước của người bạn đồng hành ${index + 1}`;
        }
        if (!companion.dob) {
          errors.dob = `Yêu cầu nhập ngày sinh của người bạn đồng hành ${index + 1}`;
        }
        if (!companion.gender) {
          errors.gender = `Yêu cầu nhập giới tính của người bạn đồng hành ${index + 1}`;
        }
        return Object.keys(errors).length > 0 ? errors : null;
      }).filter(Boolean);
      
      if (companionErrors.length > 0) {
        errors.companions = companionErrors;
      }
    }

    if (currentStep === 3 && formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        errors.payment = 'All card details are required';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
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
  
  const handleCompanionChange = (index, field, value) => {
    const updatedCompanions = [...formData.companions];
    updatedCompanions[index] = {
      ...updatedCompanions[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      companions: updatedCompanions
    });
  };
  
  const handleNextStep = () => {
    // Validate current step
    const validation = validateForm();
    if (!validation.isValid) {
      // Đảm bảo error luôn là một chuỗi
      const firstError = Object.values(validation.errors)[0];
      setError(typeof firstError === 'string' ? firstError : JSON.stringify(firstError));
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    setError(null);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };
  
  // Kiểm tra xem phương thức thanh toán có hợp lệ không
  const validatePaymentMethod = () => {
    // Chỉ kiểm tra khi đang ở bước thanh toán (bước 3)
    if (currentStep !== 3) {
      return true;
    }
    
    // Kiểm tra xem người dùng đã chọn phương thức thanh toán chưa
    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return false;
    }
    
    // Nếu là thẻ tín dụng, kiểm tra thông tin thẻ
    if (formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
      // Nếu sử dụng thẻ đã lưu, không cần kiểm tra thông tin thẻ
      if (hasPaymentCard && paymentCardInfo && formData.useSavedCard) {
        return true;
      }
      
      // Nếu không sử dụng thẻ đã lưu, kiểm tra thông tin thẻ
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        setError('Please enter all card details');
        return false;
      }
    }
    
    // Nếu là chuyển khoản, kiểm tra xác nhận đã chuyển khoản
    if (formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && !formData.transferConfirmed) {
      setError('Please confirm that you have completed the bank transfer');
      return false;
    }
    
    return true;
  };

  // Kiểm tra xem form có sẵn sàng để submit không
  const isFormReadyToSubmit = () => {
    // Nếu chưa ở bước cuối cùng, không cho phép submit
    if (currentStep < totalSteps) {
      return false;
    }
    
    // Validate form - Khi submit, cần kiểm tra tất cả các thông tin
    // Lưu trữ currentStep hiện tại
    const originalStep = currentStep;
    
    // Tạm thời đặt currentStep = 2 để kiểm tra thông tin người đồng hành
    let isValid = true;
    let errorMessage = '';
    
    if (formData.companions.length > 0) {
      setCurrentStep(2);
      const companionValidation = validateForm();
      // Khôi phục currentStep
      setCurrentStep(originalStep);
      
      if (!companionValidation.isValid) {
        // Đảm bảo error luôn là một chuỗi
        const firstError = Object.values(companionValidation.errors)[0];
        errorMessage = typeof firstError === 'string' ? firstError : JSON.stringify(firstError);
        isValid = false;
      }
    }
    
    // Kiểm tra thông tin thanh toán
    const validation = validateForm();
    if (!validation.isValid) {
      // Đảm bảo error luôn là một chuỗi
      const firstError = Object.values(validation.errors)[0];
      errorMessage = typeof firstError === 'string' ? firstError : JSON.stringify(firstError);
      isValid = false;
    }
    
    // Kiểm tra phương thức thanh toán
    if (!validatePaymentMethod()) {
      errorMessage = 'Please complete payment information';
      isValid = false;
    }
    
    if (!isValid) {
      setError(errorMessage);
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isRoomAvailable) {
      setError('This room is no longer available for the selected dates. Please choose different dates or another room.');
      return;
    }

    // Kiểm tra xem form có sẵn sàng để submit không
    if (!isFormReadyToSubmit()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Format dates
      const checkInDate = services.utils.format.formatDateForApi(bookingData.checkInDate);
      const checkOutDate = services.utils.format.formatDateForApi(bookingData.checkOutDate);
      
      // Bước 1: Cập nhật thông tin khách hàng
      const customerID = currentUser?.id || currentUser?.username;
      console.log('Updating customer information for:', customerID);
      
      let customerData = null;
      try {
        // Lấy thông tin khách hàng hiện tại
        customerData = await services.api.customer.fetchCustomerByUsername(customerID);
        console.log('Fetched customer data:', customerData);
        
        if (customerData) {
          // Cập nhật thông tin khách hàng với dữ liệu mới từ form
          const updatedCustomerData = {
            ...customerData,
            cName: formData.fullName,
            gender: formData.gender,
            email: formData.email,
            dob: formData.dob ? services.utils.format.formatDateForApi(formData.dob) : customerData.dob,
            phone: formData.phone,
            address: formData.address,
            idCard: formData.idCard
          };
          
          console.log('Updating customer with data:', JSON.stringify(updatedCustomerData, null, 2));
          const updatedCustomer = await services.api.customer.updateCustomer(customerID, updatedCustomerData);
          console.log('Customer information updated successfully:', updatedCustomer);
        }
      } catch (error) {
        console.error('Error updating customer information:', error);
        // Tiếp tục quá trình đặt phòng ngay cả khi không thể cập nhật thông tin khách hàng
      }
      
      // Bước 2: Tạo booking mới
      // Tạo ID cho booking
      const timestamp = Date.now().toString().slice(-8);
      const bookingID = 'BOOK' + timestamp;
      
      // Khởi tạo biến cho payment
      let paymentID = null;
      let paymentStatus = false;
      let paymentData = null;
      
      // Tạo dữ liệu booking theo cấu trúc API (không có paymentID ban đầu)
      const bookingPayload = {
        bookingID: bookingID,
        bookingTime: new Date().toISOString(),
        totalAmount: bookingData.total,
        bookingStatus: BOOKING_STATUS.CONFIRMED,
        paymentStatus: false, // Luôn đặt false ban đầu
        paymentID: null, // Luôn đặt null ban đầu
        customerID: customerID,
        employeeID: "emp000001", // Sử dụng employeeID mặc định theo yêu cầu
        paymentMethod: formData.paymentMethod,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        idCard: formData.idCard,
        dob: formData.dob,
        gender: formData.gender,
        cardNumber: formData.cardNumber,
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
      const createdBooking = await services.api.booking.createBooking(bookingPayload);
      console.log('Booking created successfully:', createdBooking);
      
      // Xử lý thanh toán dựa trên phương thức thanh toán sau khi booking đã được tạo
      if (formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD || 
          formData.paymentMethod === PAYMENT_METHODS.PAYPAL) {
        
        try {
          // Nếu người dùng chọn sử dụng thẻ đã lưu
          if (hasPaymentCard && paymentCardInfo && formData.useSavedCard) {
            console.log('Using saved payment card:', paymentCardInfo.pan);
            
            // Xác thực thanh toán
            const verification = await services.api.payment.verifyPayment({
              amount: bookingData.total,
              pan: paymentCardInfo.pan,
              method: formData.paymentMethod
            });
            
            if (verification.success) {
              // Tạo payment
              paymentID = 'PAY' + Date.now().toString().slice(-8);
              paymentData = await services.api.payment.createPayment({
                paymentID: paymentID,
                paymentMethod: formData.paymentMethod,
                totalAmount: bookingData.total,
                bookingID: createdBooking.bookingID,
                description: `Payment for booking ${createdBooking.bookingID}`
              });
              
              paymentStatus = true;
            }
          } 
          // Nếu người dùng nhập thẻ mới
          else if (formData.cardNumber && formData.cardName && formData.expiryDate && formData.cvv) {
            console.log('Using new payment card');
            
            // Xác thực thanh toán
            const verification = await services.api.payment.verifyPayment({
              amount: bookingData.total,
              cardNumber: formData.cardNumber,
              cardName: formData.cardName,
              expiryDate: formData.expiryDate,
              cvv: formData.cvv,
              method: formData.paymentMethod
            });
            
            if (verification.success) {
              // Nếu người dùng muốn lưu thẻ
              if (formData.saveCard) {
                try {
                  // Thêm thẻ mới
                  const [month, year] = formData.expiryDate.split('/');
                  await services.api.payment.addPaymentCard({
                    cardNumber: formData.cardNumber,
                    cardHolder: formData.cardName,
                    expiryMonth: month,
                    expiryYear: '20' + year,
                    bank: 'Unknown'
                  });
                  
                  // Cập nhật PAN cho customer
                  if (customerData) {
                    await services.api.customer.updateCustomer(customerID, {
                      ...customerData,
                      pan: formData.cardNumber.replace(/\s/g, '')
                    });
                  }
                } catch (error) {
                  console.error('Error saving payment card:', error);
                  // Tiếp tục quá trình đặt phòng ngay cả khi không thể lưu thẻ
                }
              }
              
              // Tạo payment
              paymentID = 'PAY' + Date.now().toString().slice(-8);
              paymentData = await services.api.payment.createPayment({
                paymentID: paymentID,
                paymentMethod: formData.paymentMethod,
                totalAmount: bookingData.total,
                bookingID: createdBooking.bookingID,
                description: `Payment for booking ${createdBooking.bookingID}`
              });
              
              paymentStatus = true;
            }
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          // Tiếp tục quá trình đặt phòng ngay cả khi không thể xử lý thanh toán
        }
      } 
      // Xử lý chuyển khoản ngân hàng
      else if (formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && formData.transferConfirmed) {
        try {
          // Tạo payment
          paymentID = 'PAY' + Date.now().toString().slice(-8);
          paymentData = await services.api.payment.createPayment({
            paymentID: paymentID,
            paymentMethod: formData.paymentMethod,
            totalAmount: bookingData.total,
            bookingID: createdBooking.bookingID,
            description: `Bank transfer for booking ${createdBooking.bookingID}`
          });
          
          paymentStatus = true;
        } catch (error) {
          console.error('Error processing bank transfer:', error);
          // Tiếp tục quá trình đặt phòng ngay cả khi không thể xử lý thanh toán
        }
      }
      
      // Nếu payment đã được tạo, cập nhật booking với paymentID
      if (paymentID && paymentStatus) {
        try {
          // Cập nhật booking với paymentID
          await services.api.booking.updateBooking(createdBooking.bookingID, {
            ...createdBooking,
            paymentID: paymentID,
            paymentStatus: paymentStatus
          });
          console.log('Booking updated with payment information');
        } catch (error) {
          console.error('Error updating booking with payment information:', error);
        }
      }
      
      // Bước 3: Tạo booking detail
      // Tạo ID cho booking detail
      const detailID = 'BD' + Date.now().toString().slice(-8);
      
      // Tạo dữ liệu booking detail theo cấu trúc API
      const bookingDetailPayload = {
        detailID: detailID,
        checkinDate: new Date(bookingData.checkInDate),
        checkoutDate: new Date(bookingData.checkOutDate),
        detailStatus: "Booked",
        pricePerDay: bookingData.price,
        totalPrice: bookingData.total,
        bookingID: createdBooking.bookingID || bookingID,
        roomID: bookingData.roomId,
        // Tạo guest_BDetails cho người đặt phòng và người đi cùng
        guest_BDetails: [
          // Thông tin người đặt phòng
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
              isPrimary: true
            }
          },
          // Thông tin người đi cùng
          ...formData.companions.map((companion, index) => ({
            detailID: detailID,
            guestID: `GUEST${Date.now().toString().slice(-4)}_${index + 1}`,
            guestInfo: {
              fullName: companion.fullName,
              idCard: companion.idCard,
              dob: companion.dob,
              gender: companion.gender,
              isPrimary: false
            }
          }))
        ],
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
      const createdBookingDetail = await services.api.booking.createBookingDetail(bookingDetailPayload);
      console.log('Booking detail created successfully:', createdBookingDetail);
      
      // Chuẩn bị dữ liệu đặt phòng để hiển thị trong trang checkout
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
        status: BOOKING_STATUS.CONFIRMED.toLowerCase(),
        roomImage: bookingData.roomImage,
        bookingDate: services.utils.format.formatDateForApi(new Date()),
        paymentMethod: formData.paymentMethod,
        specialRequests: formData.specialRequests,
        primaryGuest: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          idCard: formData.idCard,
          dob: formData.dob,
          gender: formData.gender
        },
        companions: formData.companions,
        timeline: [
          { 
            date: services.utils.format.formatDateForApi(new Date()), 
            text: 'Booking created', 
            icon: 'FaCalendarAlt' 
          },
          { 
            date: services.utils.format.formatDateForApi(new Date()), 
            text: formData.paymentMethod === PAYMENT_METHODS.CASH ? 'Payment pending' : 'Payment confirmed', 
            icon: 'FaCreditCard' 
          }
        ]
      };
      
      // Xóa dữ liệu đặt phòng tạm thời
      localStorage.removeItem('bookingData');
      
      setSuccess(true);
      
      // Chuyển hướng đến trang xác nhận đặt phòng
      navigate('/checkout', { state: { booking: bookingForCheckout } });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(services.utils.api.handleApiError(err));
      setLoading(false);
    }
  };
  
  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="step-indicators">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div 
            key={i} 
            className={`step-indicator ${currentStep >= i + 1 ? 'active' : ''}`}
            onClick={() => currentStep > i + 1 && setCurrentStep(i + 1)}
          >
            <div className="step-number">{i + 1}</div>
            <div className="step-label">
              {i === 0 ? 'Guest Information' : i === 1 ? 'Companions' : 'Payment'}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <GuestInformationForm formData={formData} handleInputChange={handleInputChange} />;
      case 2:
        return <CompanionsInformationForm 
          bookingData={bookingData} 
          formData={formData} 
          handleCompanionChange={handleCompanionChange} 
        />;
      case 3:
        return <PaymentMethodForm 
          formData={formData} 
          handleInputChange={handleInputChange} 
          hasPaymentCard={hasPaymentCard}
          paymentCardInfo={paymentCardInfo}
        />;
      default:
        return <GuestInformationForm formData={formData} handleInputChange={handleInputChange} />;
    }
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
              {renderStepIndicators()}
              
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
              
              {renderStepContent()}
              
              <div className="form-actions">
                {currentStep > 1 && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <FaArrowLeft /> Back
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    Next <FaArrowRight />
                  </button>
                ) : (
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
                )}
              </div>
            </form>
          </div>
          
          <BookingSummary bookingData={bookingData} />
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
