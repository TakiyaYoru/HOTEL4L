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
        setError('Phòng này không còn trống trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng khác.');
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra tính khả dụng của phòng:', err);
      setError('Lỗi khi kiểm tra tính khả dụng của phòng');
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
      console.error('Lỗi khi lấy dữ liệu khách hàng:', err);
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
      setError('Vui lòng điền đầy đủ thông tin khách hàng bắt buộc');
      return false;
    }
    if (!services.utils.validation.validateEmail(formData.email)) {
      setError('Địa chỉ email không hợp lệ');
      return false;
    }
    if (!services.utils.validation.validatePhone(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    if (!services.utils.validation.validateIdCard(formData.idCard)) {
      setError('Số CMND/CCCD không hợp lệ');
      return false;
    }
    return true;
  };

  // Validate phương thức thanh toán
  const validatePaymentMethod = () => {
    if (!formData.paymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return false;
    }

    if (formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD || formData.paymentMethod === PAYMENT_METHODS.PAYPAL) {
      if (formData.useSavedCard) {
        if (!hasPaymentCard || !paymentCardInfo) {
          setError('Không tìm thấy thẻ thanh toán đã lưu');
          return false;
        }
      } else {
        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
          setError('Vui lòng điền đầy đủ thông tin thanh toán');
          return false;
        }
      }
    } else if (formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER) {
      if (!formData.transferConfirmed) {
        setError('Vui lòng xác nhận đã hoàn tất chuyển khoản ngân hàng');
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
      setError('Phòng này không còn trống trong khoảng thời gian bạn chọn. Vui lòng chọn ngày khác hoặc phòng khác.');
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
        console.error('Lỗi khi cập nhật thông tin khách hàng:', error);
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
          gender: formData.gender || "Không xác định",
          email: formData.email || currentUser?.email || "guest@example.com",
          dob: formData.dob ? services.utils.format.formatDateForApi(formData.dob) : "1990-01-01T00:00:00",
          phone: formData.phone || "000-000-0000",
          address: formData.address || "Không xác định",
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
                description: `Thanh toán cho đặt phòng ${createdBooking.bookingID}`,
              });
              paymentStatus = PAYMENT_STATUS.COMPLETED;
              bookingStatus = BOOKING_STATUS.CONFIRMED;
              checkInCode = services.utils.generateCheckInCode();
              console.log(`Thanh toán thành công bằng ${formData.paymentMethod}. Trạng thái đặt phòng: ${bookingStatus}`);
            } else {
              console.log(`Xác minh thanh toán thất bại bằng ${formData.paymentMethod}. Trạng thái đặt phòng vẫn là: ${bookingStatus}`);
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
                    bank: 'Không xác định',
                  });
                  if (customerData) {
                    await services.api.customer.updateCustomer(customerID, {
                      ...customerData,
                      pan: formData.cardNumber.replace(/\s/g, ''),
                    });
                  }
                } catch (error) {
                  console.error('Lỗi khi lưu thẻ thanh toán:', error);
                }
              }
  
              paymentID = 'PAY' + Date.now().toString().slice(-8);
              await services.api.payment.createPayment({
                paymentID: paymentID,
                paymentMethod: formData.paymentMethod,
                totalAmount: bookingData.total,
                bookingID: createdBooking.bookingID,
                description: `Thanh toán cho đặt phòng ${createdBooking.bookingID}`,
              });
              paymentStatus = PAYMENT_STATUS.COMPLETED;
              bookingStatus = BOOKING_STATUS.CONFIRMED;
              checkInCode = services.utils.generateCheckInCode();
              console.log(`Thanh toán thành công bằng ${formData.paymentMethod}. Trạng thái đặt phòng: ${bookingStatus}`);
            } else {
              console.log(`Xác minh thanh toán thất bại bằng ${formData.paymentMethod}. Trạng thái đặt phòng vẫn là: ${bookingStatus}`);
            }
          }
        } catch (error) {
          console.error('Lỗi khi xử lý thanh toán:', error);
          paymentStatus = PAYMENT_STATUS.FAILED;
          console.log(`Thanh toán thất bại bằng ${formData.paymentMethod}. Trạng thái đặt phòng vẫn là: ${bookingStatus}`);
        }
      } else if (formData.paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && formData.transferConfirmed) {
        try {
          paymentID = 'PAY' + Date.now().toString().slice(-8);
          await services.api.payment.createPayment({
            paymentID: paymentID,
            paymentMethod: formData.paymentMethod,
            totalAmount: bookingData.total,
            bookingID: createdBooking.bookingID,
            description: `Chuyển khoản ngân hàng cho đặt phòng ${createdBooking.bookingID}`,
          });
          paymentStatus = PAYMENT_STATUS.COMPLETED;
          bookingStatus = BOOKING_STATUS.CONFIRMED;
          checkInCode = services.utils.generateCheckInCode();
          console.log(`Thanh toán thành công bằng ${formData.paymentMethod}. Trạng thái đặt phòng: ${bookingStatus}`);
        } catch (error) {
          console.error('Lỗi khi xử lý chuyển khoản ngân hàng:', error);
          paymentStatus = PAYMENT_STATUS.FAILED;
          console.log(`Thanh toán thất bại bằng ${formData.paymentMethod}. Trạng thái đặt phòng vẫn là: ${bookingStatus}`);
        }
      } else if (formData.paymentMethod === PAYMENT_METHODS.CASH) {
        paymentStatus = PAYMENT_STATUS.PENDING;
        bookingStatus = BOOKING_STATUS.PENDING;
        console.log(`Phương thức thanh toán là ${formData.paymentMethod}. Trạng thái đặt phòng: ${bookingStatus}`);
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
        console.log('Đặt phòng đã cập nhật:', updatedBooking);
      }
  
      // Bước 4: Tạo booking detail
      const detailID = 'BD' + Date.now().toString().slice(-8);
      const bookingDetailPayload = {
        detailID: detailID,
        checkinDate: new Date(bookingData.checkInDate),
        checkoutDate: new Date(bookingData.checkOutDate),
        detailStatus: "Đã Đặt",
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
  
      // Bước 5: Cập nhật trạng thái phòng thành ĐÃ ĐẶT
      try {
        const currentRoomData = await services.api.room.fetchRoomById(bookingData.roomId);
        const updatedRoomData = {
          roomID: currentRoomData.roomID,
          roomStatus: ROOM_STATUS.BOOKED,
          rTypeID: currentRoomData.rTypeID,
        };
        await services.api.room.updateRoom(bookingData.roomId, updatedRoomData);
        console.log(`Trạng thái phòng ${bookingData.roomId} đã được cập nhật thành ĐÃ ĐẶT`);
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái phòng:', error);
        throw new Error('Không thể cập nhật trạng thái phòng');
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
          console.log('Email xác nhận đã được gửi đến:', formData.email);
        } catch (emailErr) {
          console.error('Lỗi khi gửi email xác nhận:', emailErr);
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
            text: 'Đặt phòng đã được tạo',
            icon: 'FaCalendarAlt',
          },
          {
            date: services.utils.format.formatDateForApi(new Date()),
            text:
              formData.paymentMethod === PAYMENT_METHODS.CASH
                ? 'Thanh toán đang chờ'
                : paymentStatus === PAYMENT_STATUS.COMPLETED
                ? 'Thanh toán đã xác nhận'
                : 'Thanh toán thất bại',
            icon: 'FaCreditCard',
          },
        ],
      };
  
      // Xóa dữ liệu tạm
      localStorage.removeItem('bookingData');
  
      setSuccess(true);
      navigate('/checkout', { state: { booking: bookingForCheckout } });
    } catch (err) {
      console.error('Lỗi khi tạo đặt phòng:', err);
      setError(services.utils.api.handleApiError(err));
      setLoading(false);
  
      // Rollback: Xóa booking nếu có lỗi
      if (createdBooking) {
        try {
          await services.api.booking.deleteBooking(createdBooking.bookingID);
          console.log('Hoàn tác: Đặt phòng đã bị xóa do lỗi');
        } catch (rollbackErr) {
          console.error('Lỗi khi hoàn tác đặt phòng:', rollbackErr);
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
          console.log(`Hoàn tác: Trạng thái phòng ${bookingData.roomId} đã được khôi phục thành ${originalRoomStatus}`);
        } catch (rollbackErr) {
          console.error('Lỗi khi hoàn tác trạng thái phòng:', rollbackErr);
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
            <h2>Thông Tin Khách Hàng</h2>
            <p className="section-description">
              Vui lòng cung cấp thông tin cá nhân của bạn để tiếp tục đặt phòng.
            </p>
            <div className="form-row">
              <div className="form-group">
                <label>Họ Tên *</label>
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
                <label>Số Điện Thoại *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số CMND/CCCD *</label>
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
                <label>Địa Chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Ngày Sinh</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Giới Tính</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Chọn Giới Tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => navigate('/rooms')}>
                <FaArrowLeft /> Quay Lại Danh Sách Phòng
              </button>
              <button className="btn-primary" onClick={handleNextStep}>
                Tiếp Theo <FaArrowRight />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h2>Người Đi Cùng</h2>
            <p className="section-description">
              Thêm thông tin về những người đi cùng bạn (nếu có).
            </p>
            {formData.companions.length === 0 ? (
              <div className="no-companions-message">
                <FaUsers className="icon" />
                <p>Chưa có người đi cùng nào được thêm.</p>
              </div>
            ) : (
              formData.companions.map((companion, index) => (
                <div key={index} className="companion-form">
                  <h3>Người Đi Cùng {index + 1}</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Họ Tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={companion.fullName}
                        onChange={(e) => handleCompanionChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Số CMND/CCCD</label>
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
                      <label>Ngày Sinh</label>
                      <input
                        type="date"
                        name="dob"
                        value={companion.dob}
                        onChange={(e) => handleCompanionChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Giới Tính</label>
                      <select
                        name="gender"
                        value={companion.gender}
                        onChange={(e) => handleCompanionChange(index, e)}
                      >
                        <option value="">Chọn Giới Tính</option>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => handleRemoveCompanion(index)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>
              ))
            )}
            <button className="btn-primary" onClick={handleAddCompanion}>
              <FaPlus /> Thêm Người Đi Cùng
            </button>
            <div className="form-actions">
              <button className="btn-secondary" onClick={handlePreviousStep}>
                <FaArrowLeft /> Quay Lại
              </button>
              <button className="btn-primary" onClick={handleNextStep}>
                Tiếp Theo <FaArrowRight />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-section">
            <h2>Thanh Toán & Xác Nhận</h2>
            <p className="section-description">
              Chọn phương thức thanh toán và thêm yêu cầu đặc biệt nếu có.
            </p>
            <div className="form-group">
              <label>Phương Thức Thanh Toán *</label>
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
                    <FaCreditCard /> Thẻ Tín Dụng
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
                    <FaDollarSign /> Chuyển Khoản Ngân Hàng
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
                    <FaDollarSign /> Tiền Mặt
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
                      Sử Dụng Thẻ Đã Lưu (**** **** **** {paymentCardInfo?.pan?.slice(-4)})
                    </label>
                  </div>
                )}
                {!formData.useSavedCard && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Số Thẻ *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tên Chủ Thẻ *</label>
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
                        <label>Ngày Hết Hạn (MM/YY) *</label>
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
                        <label>Mã CVV *</label>
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
                        Lưu Thẻ Để Sử Dụng Sau
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
                  Tôi đã hoàn tất chuyển khoản ngân hàng
                </label>
              </div>
            )}

            {formData.paymentMethod === PAYMENT_METHODS.CASH && (
              <p className="section-description">
                Bạn sẽ thanh toán bằng tiền mặt khi đến khách sạn.
              </p>
            )}

            <div className="form-group">
              <label>Yêu Cầu Đặc Biệt</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handlePreviousStep}>
                <FaArrowLeft /> Quay Lại
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="loading-spinner" /> Đang Xử Lý...
                  </>
                ) : (
                  <>
                    Xác Nhận Đặt Phòng <FaArrowRight />
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
        <h1>Đặt Phòng Của Bạn</h1>
        <p>Hoàn thành các bước dưới đây để xác nhận đặt phòng của bạn.</p>
      </div>

      <div className="step-indicators">
        <div
          className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}
          onClick={() => handleStepClick(1)}
        >
          <div className="step-number">1</div>
          <span className="step-label">Thông Tin Khách Hàng</span>
        </div>
        <div
          className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}
          onClick={() => handleStepClick(2)}
        >
          <div className="step-number">2</div>
          <span className="step-label">Người Đi Cùng</span>
        </div>
        <div
          className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}
          onClick={() => handleStepClick(3)}
        >
          <div className="step-number">3</div>
          <span className="step-label">Thanh Toán</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationCircle /> {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          <FaCheckCircle /> Đặt phòng thành công!
        </div>
      )}

      <div className="booking-content">
        <div className="booking-form-container">{renderStep()}</div>

        <div className="booking-summary">
          <div className="summary-card">
            <h2>Tóm Tắt Đặt Phòng</h2>
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
                  <span className="summary-label">Ngày Nhận Phòng</span>
                  <span>{new Date(bookingData.checkInDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaCalendarAlt className="summary-icon" />
                <div className="summary-text">
                  <span className="summary-label">Ngày Trả Phòng</span>
                  <span>{new Date(bookingData.checkOutDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaUsers className="summary-icon" />
                <div className="summary-text">
                  <span className="summary-label">Số Khách</span>
                  <span>{bookingData.guests}</span>
                </div>
              </div>
            </div>
            <div className="summary-pricing">
              <div className="price-item">
                <span>Giá Mỗi Đêm</span>
                <span>${bookingData.price.toFixed(2)}</span>
              </div>
              {bookingData.extraServices && bookingData.extraServices.length > 0 && (
                <div className="price-item">
                  <span>Dịch Vụ Bổ Sung</span>
                  <span>
                    $
                    {bookingData.extraServices
                      .reduce((total, service) => total + (service.price * (service.quantity || 1)), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}
              <div className="price-total">
                <span>Tổng Cộng</span>
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