import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { services } from '../services';
import { 
  FaCalendarAlt, 
  FaCheck, 
  FaUser, 
  FaQrcode, 
  FaSignOutAlt, 
  FaSpinner,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import '../styles/EmployeeDashboard.css';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const DashboardContainer = styled.div`
  padding: 50px 0;
  animation: ${fadeIn} 0.5s ease;
`;

const DashboardHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background-color: #b8860b;
  }
`;

const DashboardTitle = styled.h1`
  font-size: 2.8rem;
  margin-bottom: 10px;
  color: #333;
  font-family: 'Playfair Display', serif;
`;

const EmployeeInfo = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const EmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const DashboardContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  }
`;

const SearchSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #b8860b;
    box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.2);
    outline: none;
  }
`;

const SearchButton = styled.button`
  padding: 12px 20px;
  background-color: #b8860b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #d4af37;
    transform: translateY(-2px);
  }
`;

const BookingInfo = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TabContainer = styled.div`
  margin-top: 20px;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 30px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #b8860b;
    border-radius: 4px;
  }
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background-color: ${props => props.$active ? '#b8860b' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: none;
  border-radius: ${props => props.$active ? '8px 8px 0 0' : '0'};
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  white-space: nowrap;
  
  svg {
    margin-right: 8px;
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: ${props => props.$active ? '#b8860b' : '#f5f5f5'};
    transform: translateY(-3px);
  }
`;

const TabContent = styled.div`
  padding: 20px 0;
  animation: ${fadeIn} 0.4s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
  color: #555;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
  
  tr:last-child & {
    border-bottom: none;
  }
  
  tr:hover & {
    background-color: #f9f9f9;
  }
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-right: 12px;
  color: ${props => props.danger ? '#e74c3c' : '#3498db'};
  font-size: 1.1rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.danger ? '#c0392b' : '#2980b9'};
    transform: scale(1.2);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const SubmitButton = styled.button`
  padding: 14px 28px;
  background-color: #b8860b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #d4af37;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  background-color: ${props => {
    if (props.status === 'PENDING') return '#f39c12';
    if (props.status === 'CONFIRMED') return '#2ecc71';
    if (props.status === 'CHECKED_IN') return '#3498db';
    if (props.status === 'CHECKED_OUT') return '#95a5a6';
    if (props.status === 'CANCELLED') return '#e74c3c';
    return '#95a5a6';
  }};
  color: white;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: white;
    margin-right: 6px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(184, 134, 11, 0.2);
  border-radius: 50%;
  border-top-color: #b8860b;
  animation: spin 1s ease-in-out infinite;
  margin: 30px auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  padding: 15px;
  background-color: #fdf3f2;
  border-left: 4px solid #e74c3c;
  border-radius: 4px;
  margin: 20px 0;
`;

function EmployeeDashboard() {
  const { currentUser, logout, isEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [checkedInBookings, setCheckedInBookings] = useState([]);
  const [checkedOutBookings, setCheckedOutBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search states
  const [searchBookingId, setSearchBookingId] = useState('');
  const [searchedBooking, setSearchedBooking] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'confirmPayment', 'checkIn', 'checkOut'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch employee and bookings data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employee data
        const employeeData = await services.api.employee.fetchEmployeeById(currentUser.id);
        setEmployee(employeeData);

        // Fetch bookings theo trạng thái
        const pendingData = await services.api.booking.fetchBookingsByStatus('PENDING');
        const confirmedData = await services.api.booking.fetchBookingsByStatus('CONFIRMED');
        const checkedInData = await services.api.booking.fetchBookingsByStatus('CHECKED_IN');
        const checkedOutData = await services.api.booking.fetchBookingsByStatus('CHECKED_OUT');
        const allData = await services.api.booking.fetchAllBookings();

        // Chuẩn hóa dữ liệu: Lấy roomID từ bookingDetails và chuẩn hóa bookingStatus
        const standardizeBookings = (bookings) => {
          return bookings.map(booking => ({
            ...booking,
            roomID: booking.bookingDetails && booking.bookingDetails.length > 0 
              ? booking.bookingDetails[0].roomID 
              : booking.roomID || null,
            bookingStatus: booking.bookingStatus ? booking.bookingStatus.toUpperCase() : 'UNKNOWN',
            fullName: booking.fullName || 'Không xác định',
            checkInDate: booking.checkInDate || null,
            checkOutDate: booking.checkOutDate || null,
            paymentMethod: booking.paymentMethod || 'Không xác định',
          }));
        };

        // Lọc dữ liệu để đảm bảo đúng trạng thái
        const filterByStatus = (bookings, status) => {
          console.log(`Dữ liệu gốc cho trạng thái ${status}:`, bookings);
          const filtered = bookings.filter(booking => {
            const matchesStatus = booking.bookingStatus === status;
            if (!matchesStatus) {
              console.warn(`Đặt phòng ${booking.bookingID} không khớp với trạng thái ${status}. Trạng thái tìm thấy: ${booking.bookingStatus}`);
            }
            return matchesStatus;
          });
          if (filtered.length !== bookings.length) {
            console.warn(`API trả về dữ liệu không chính xác cho trạng thái ${status}. Kì vọng ${status}, nhưng tìm thấy:`, 
              bookings.filter(booking => booking.bookingStatus !== status));
          }
          return filtered;
        };

        const standardizedPending = filterByStatus(standardizeBookings(pendingData), 'PENDING');
        const standardizedConfirmed = filterByStatus(standardizeBookings(confirmedData), 'CONFIRMED');
        const standardizedCheckedIn = filterByStatus(standardizeBookings(checkedInData), 'CHECKED_IN');
        const standardizedCheckedOut = filterByStatus(standardizeBookings(checkedOutData), 'CHECKED_OUT');
        const standardizedAll = standardizeBookings(allData);

        setPendingBookings(standardizedPending);
        setConfirmedBookings(standardizedConfirmed);
        setCheckedInBookings(standardizedCheckedIn);
        setCheckedOutBookings(standardizedCheckedOut);
        setAllBookings(standardizedAll);

        console.log('Đặt phòng đang chờ:', standardizedPending);
        console.log('Đặt phòng đã xác nhận:', standardizedConfirmed);
        console.log('Đặt phòng đã nhận:', standardizedCheckedIn);
        console.log('Đặt phòng đã trả:', standardizedCheckedOut);
        console.log('Tất cả đặt phòng:', standardizedAll);

        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  // Redirect if not an employee
  if (!isEmployee) {
    return <Navigate to="/" />;
  }

  // Refresh bookings after actions
  const refreshBookings = async () => {
    try {
      const pendingData = await services.api.booking.fetchBookingsByStatus('PENDING');
      const confirmedData = await services.api.booking.fetchBookingsByStatus('CONFIRMED');
      const checkedInData = await services.api.booking.fetchBookingsByStatus('CHECKED_IN');
      const checkedOutData = await services.api.booking.fetchBookingsByStatus('CHECKED_OUT');
      const allData = await services.api.booking.fetchAllBookings();

      // Chuẩn hóa dữ liệu: Lấy roomID từ bookingDetails và chuẩn hóa bookingStatus
      const standardizeBookings = (bookings) => {
        return bookings.map(booking => ({
          ...booking,
          roomID: booking.bookingDetails && booking.bookingDetails.length > 0 
            ? booking.bookingDetails[0].roomID 
            : booking.roomID || null,
          bookingStatus: booking.bookingStatus ? booking.bookingStatus.toUpperCase() : 'UNKNOWN',
          fullName: booking.fullName || 'Không xác định',
          checkInDate: booking.checkInDate || null,
          checkOutDate: booking.checkOutDate || null,
          paymentMethod: booking.paymentMethod || 'Không xác định',
        }));
      };

      // Lọc dữ liệu để đảm bảo đúng trạng thái
      const filterByStatus = (bookings, status) => {
        console.log(`Dữ liệu gốc cho trạng thái ${status}:`, bookings);
        const filtered = bookings.filter(booking => {
          const matchesStatus = booking.bookingStatus === status;
          if (!matchesStatus) {
            console.warn(`Đặt phòng ${booking.bookingID} không khớp với trạng thái ${status}. Trạng thái tìm thấy: ${booking.bookingStatus}`);
          }
          return matchesStatus;
        });
        if (filtered.length !== bookings.length) {
          console.warn(`API trả về dữ liệu không chính xác cho trạng thái ${status}. Kì vọng ${status}, nhưng tìm thấy:`, 
            bookings.filter(booking => booking.bookingStatus !== status));
        }
        return filtered;
      };

      const standardizedPending = filterByStatus(standardizeBookings(pendingData), 'PENDING');
      const standardizedConfirmed = filterByStatus(standardizeBookings(confirmedData), 'CONFIRMED');
      const standardizedCheckedIn = filterByStatus(standardizeBookings(checkedInData), 'CHECKED_IN');
      const standardizedCheckedOut = filterByStatus(standardizeBookings(checkedOutData), 'CHECKED_OUT');
      const standardizedAll = standardizeBookings(allData);

      setPendingBookings(standardizedPending);
      setConfirmedBookings(standardizedConfirmed);
      setCheckedInBookings(standardizedCheckedIn);
      setCheckedOutBookings(standardizedCheckedOut);
      setAllBookings(standardizedAll);

      console.log('Đặt phòng đang chờ sau khi làm mới:', standardizedPending);
    } catch (err) {
      console.error('Lỗi khi làm mới đặt phòng:', err);
      setError('Không thể làm mới danh sách đặt phòng. Vui lòng thử lại.');
    }
  };

  // Handle search booking by BookingID
  const handleSearchBooking = async (e) => {
    e.preventDefault();
    setSearchError(null);
    setSearchedBooking(null);

    try {
      const bookingData = await services.api.booking.fetchBookingById(searchBookingId);
      if (!bookingData) {
        setSearchError('Không tìm thấy đặt phòng. Vui lòng kiểm tra mã đặt phòng.');
        return;
      }
      if (bookingData.bookingStatus !== 'CONFIRMED') {
        setSearchError('Đặt phòng này không ở trạng thái ĐÃ XÁC NHẬN và không thể nhận phòng.');
        return;
      }

      // Chuẩn hóa dữ liệu: Lấy roomID từ bookingDetails
      const roomID = bookingData.bookingDetails && bookingData.bookingDetails.length > 0 
        ? bookingData.bookingDetails[0].roomID 
        : null;

      if (!roomID) {
        setSearchError('Không tìm thấy mã phòng cho đặt phòng này.');
        return;
      }

      const standardizedBooking = {
        ...bookingData,
        roomID: roomID,
        bookingStatus: bookingData.bookingStatus ? bookingData.bookingStatus.toUpperCase() : 'UNKNOWN',
      };

      setSearchedBooking(standardizedBooking);
    } catch (err) {
      console.error('Lỗi khi tìm kiếm đặt phòng:', err);
      setSearchError('Không thể tìm thấy đặt phòng. Vui lòng thử lại.');
    }
  };

  // Handle modal actions
  const openModal = (type, booking) => {
    setModalType(type);
    setSelectedBooking(booking);
    setShowModal(true);
    setModalError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedBooking(null);
    setModalError(null);
  };

  const handleConfirmPayment = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      if (!selectedBooking.roomID) {
        throw new Error('Thiếu mã phòng cho đặt phòng này.');
      }

      // Update booking status to CONFIRMED
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'CONFIRMED',
        paymentStatus: true,
      });

      // Update room status to Blocked
      const roomData = await services.api.room.fetchRoomById(selectedBooking.roomID);
      await services.api.room.updateRoom(selectedBooking.roomID, {
        roomID: roomData.roomID,
        roomStatus: 'Blocked',
        rTypeID: roomData.rTypeID,
      });

      // Refresh bookings
      await refreshBookings();
      closeModal();
    } catch (err) {
      console.error('Lỗi khi xác nhận thanh toán:', err);
      setModalError(err.message || 'Không thể xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      if (!selectedBooking.roomID) {
        throw new Error('Thiếu mã phòng cho đặt phòng này.');
      }

      // Update booking status to CHECKED_IN
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'CHECKED_IN',
        checkInTime: new Date().toISOString(),
      });

      // Update room status to Occupied
      const roomData = await services.api.room.fetchRoomById(selectedBooking.roomID);
      await services.api.room.updateRoom(selectedBooking.roomID, {
        roomID: roomData.roomID,
        roomStatus: 'Occupied',
        rTypeID: roomData.rTypeID,
      });

      // Refresh bookings
      await refreshBookings();
      setSearchedBooking(null);
      setSearchBookingId('');
      closeModal();
    } catch (err) {
      console.error('Lỗi khi nhận phòng:', err);
      setModalError(err.message || 'Không thể nhận phòng. Vui lòng thử lại.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      if (!selectedBooking.roomID) {
        throw new Error('Thiếu mã phòng cho đặt phòng này.');
      }

      // Update booking status to CHECKED_OUT
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'CHECKED_OUT',
        checkOutTime: new Date().toISOString(),
      });

      // Update room status to Available
      const roomData = await services.api.room.fetchRoomById(selectedBooking.roomID);
      await services.api.room.updateRoom(selectedBooking.roomID, {
        roomID: roomData.roomID,
        roomStatus: 'Available',
        rTypeID: roomData.rTypeID,
      });

      // Refresh bookings
      await refreshBookings();
      closeModal();
    } catch (err) {
      console.error('Lỗi khi trả phòng:', err);
      setModalError(err.message || 'Không thể trả phòng. Vui lòng thử lại.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  // Hàm để hiển thị ngày tháng an toàn
  const formatDate = (date) => {
    try {
      if (!date) return 'N/A';
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) return 'Ngày không hợp lệ';
      return parsedDate.toLocaleDateString('vi-VN');
    } catch (err) {
      console.error('Lỗi khi định dạng ngày:', err);
      return 'Lỗi';
    }
  };

  // Dịch trạng thái đặt phòng sang tiếng Việt
  const translateStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang Chờ';
      case 'CONFIRMED':
        return 'Đã Xác Nhận';
      case 'CHECKED_IN':
        return 'Đã Nhận Phòng';
      case 'CHECKED_OUT':
        return 'Đã Trả Phòng';
      case 'CANCELLED':
        return 'Đã Hủy';
      default:
        return status;
    }
  };

  return (
    <div className="container">
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>Bảng Điều Khiển Nhân Viên</DashboardTitle>
          <p>Xin chào, {employee?.eName || 'Nhân Viên'}!</p>
        </DashboardHeader>

        {employee && (
          <EmployeeInfo>
            <EmployeeDetails>
              <p><strong>Mã Nhân Viên:</strong> {employee.employeeID}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Số Điện Thoại:</strong> {employee.phone}</p>
              <p><strong>Ngày Tuyển Dụng:</strong> {new Date(employee.hireDate).toLocaleDateString('vi-VN')}</p>
            </EmployeeDetails>
            <ActionButton onClick={handleLogout} danger>
              <FaSignOutAlt /> Đăng Xuất
            </ActionButton>
          </EmployeeInfo>
        )}

        <DashboardContent>
          {/* Search Section for Check-in */}
          <SearchSection>
            <h3>Nhận Phòng Khách Hàng Theo Mã Đặt Phòng</h3>
            <SearchForm onSubmit={handleSearchBooking}>
              <SearchInput
                type="text"
                value={searchBookingId}
                onChange={(e) => setSearchBookingId(e.target.value)}
                placeholder="Nhập Mã Đặt Phòng"
                required
              />
              <SearchButton type="submit">
                <FaSearch /> Tìm Kiếm
              </SearchButton>
            </SearchForm>

            {searchError && <ErrorMessage>{searchError}</ErrorMessage>}

            {searchedBooking && (
              <BookingInfo>
                <h4>Chi Tiết Đặt Phòng</h4>
                <p><strong>Mã Đặt Phòng:</strong> {searchedBooking.bookingID}</p>
                <p><strong>Khách Hàng:</strong> {searchedBooking.fullName}</p>
                <p><strong>Mã Phòng:</strong> {searchedBooking.roomID}</p>
                <p><strong>Ngày Nhận Phòng:</strong> {formatDate(searchedBooking.checkInDate)}</p>
                <p><strong>Ngày Trả Phòng:</strong> {formatDate(searchedBooking.checkOutDate)}</p>
                <p><strong>Phương Thức Thanh Toán:</strong> {searchedBooking.paymentMethod}</p>
                <p><strong>Trạng Thái:</strong> <StatusBadge status={searchedBooking.bookingStatus}>{translateStatus(searchedBooking.bookingStatus)}</StatusBadge></p>
                <SubmitButton onClick={() => openModal('checkIn', searchedBooking)}>
                  <FaQrcode /> Xác Nhận Nhận Phòng
                </SubmitButton>
              </BookingInfo>
            )}
          </SearchSection>

          <TabContainer>
            <TabButtons>
              <TabButton 
                $active={activeTab === 'PENDING'} 
                onClick={() => setActiveTab('PENDING')}
              >
                <FaCalendarAlt /> Đang Chờ Thanh Toán
              </TabButton>
              <TabButton 
                $active={activeTab === 'CONFIRMED'} 
                onClick={() => setActiveTab('CONFIRMED')}
              >
                <FaCheck /> Đã Xác Nhận Thanh Toán
              </TabButton>
              <TabButton 
                $active={activeTab === 'CHECKED_IN'} 
                onClick={() => setActiveTab('CHECKED_IN')}
              >
                <FaUser /> Đặt Phòng Đã Nhận
              </TabButton>
              <TabButton 
                $active={activeTab === 'CHECKED_OUT'} 
                onClick={() => setActiveTab('CHECKED_OUT')}
              >
                <FaSignOutAlt /> Đặt Phòng Đã Trả
              </TabButton>
              <TabButton 
                $active={activeTab === 'ALL'} 
                onClick={() => setActiveTab('ALL')}
              >
                <FaCalendarAlt /> Tất Cả Đặt Phòng
              </TabButton>
            </TabButtons>

            {activeTab === 'PENDING' && (
              <TabContent>
                <h3>Đặt Phòng Đang Chờ Thanh Toán</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : pendingBookings.length === 0 ? (
                  <p>Không tìm thấy đặt phòng đang chờ thanh toán.</p>
                ) : (
                  <>
                    <p>Tìm thấy {pendingBookings.length} đặt phòng đang chờ thanh toán.</p>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Mã Đặt Phòng</Th>
                          <Th>Khách Hàng</Th>
                          <Th>Mã Phòng</Th>
                          <Th>Ngày Nhận Phòng</Th>
                          <Th>Ngày Trả Phòng</Th>
                          <Th>Phương Thức Thanh Toán</Th>
                          <Th>Trạng Thái</Th>
                          <Th>Hành Động</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingBookings.map(booking => {
                          try {
                            return (
                              <tr key={booking.bookingID}>
                                <Td>{booking.bookingID || 'N/A'}</Td>
                                <Td>{booking.fullName || 'N/A'}</Td>
                                <Td>{booking.roomID || 'N/A'}</Td>
                                <Td>{formatDate(booking.checkInDate)}</Td>
                                <Td>{formatDate(booking.checkOutDate)}</Td>
                                <Td>{booking.paymentMethod || 'N/A'}</Td>
                                <Td><StatusBadge status={booking.bookingStatus}>{translateStatus(booking.bookingStatus)}</StatusBadge></Td>
                                <Td>
                                  <ActionButton onClick={() => openModal('confirmPayment', booking)}>
                                    <FaCheck /> Xác Nhận Thanh Toán
                                  </ActionButton>
                                </Td>
                              </tr>
                            );
                          } catch (err) {
                            console.error(`Lỗi khi hiển thị đặt phòng ${booking.bookingID}:`, err);
                            return null;
                          }
                        })}
                      </tbody>
                    </Table>
                  </>
                )}
              </TabContent>
            )}

            {activeTab === 'CONFIRMED' && (
              <TabContent>
                <h3>Đặt Phòng Đã Xác Nhận (Đang Chờ Nhận Phòng)</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : confirmedBookings.length === 0 ? (
                  <p>Không tìm thấy đặt phòng đã xác nhận.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Mã Đặt Phòng</Th>
                        <Th>Khách Hàng</Th>
                        <Th>Mã Phòng</Th>
                        <Th>Ngày Nhận Phòng</Th>
                        <Th>Ngày Trả Phòng</Th>
                        <Th>Phương Thức Thanh Toán</Th>
                        <Th>Trạng Thái</Th>
                        <Th>Hành Động</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID || 'N/A'}</Td>
                          <Td>{booking.fullName || 'N/A'}</Td>
                          <Td>{booking.roomID || 'N/A'}</Td>
                          <Td>{formatDate(booking.checkInDate)}</Td>
                          <Td>{formatDate(booking.checkOutDate)}</Td>
                          <Td>{booking.paymentMethod || 'N/A'}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{translateStatus(booking.bookingStatus)}</StatusBadge></Td>
                          <Td>
                            {/* Không cần nút Nhận Phòng ở đây vì đã có tìm kiếm */}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}

            {activeTab === 'CHECKED_IN' && (
              <TabContent>
                <h3>Đặt Phòng Đã Nhận (Đang Chờ Trả Phòng)</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : checkedInBookings.length === 0 ? (
                  <p>Không tìm thấy đặt phòng đã nhận.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Mã Đặt Phòng</Th>
                        <Th>Khách Hàng</Th>
                        <Th>Mã Phòng</Th>
                        <Th>Ngày Nhận Phòng</Th>
                        <Th>Ngày Trả Phòng</Th>
                        <Th>Phương Thức Thanh Toán</Th>
                        <Th>Trạng Thái</Th>
                        <Th>Hành Động</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkedInBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID || 'N/A'}</Td>
                          <Td>{booking.fullName || 'N/A'}</Td>
                          <Td>{booking.roomID || 'N/A'}</Td>
                          <Td>{formatDate(booking.checkInDate)}</Td>
                          <Td>{formatDate(booking.checkOutDate)}</Td>
                          <Td>{booking.paymentMethod || 'N/A'}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{translateStatus(booking.bookingStatus)}</StatusBadge></Td>
                          <Td>
                            <ActionButton onClick={() => openModal('checkOut', booking)}>
                              <FaSignOutAlt /> Trả Phòng
                            </ActionButton>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}

            {activeTab === 'CHECKED_OUT' && (
              <TabContent>
                <h3>Đặt Phòng Đã Trả</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : checkedOutBookings.length === 0 ? (
                  <p>Không tìm thấy đặt phòng đã trả.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Mã Đặt Phòng</Th>
                        <Th>Khách Hàng</Th>
                        <Th>Mã Phòng</Th>
                        <Th>Ngày Nhận Phòng</Th>
                        <Th>Ngày Trả Phòng</Th>
                        <Th>Phương Thức Thanh Toán</Th>
                        <Th>Trạng Thái</Th>
                        <Th>Hành Động</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkedOutBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID || 'N/A'}</Td>
                          <Td>{booking.fullName || 'N/A'}</Td>
                          <Td>{booking.roomID || 'N/A'}</Td>
                          <Td>{formatDate(booking.checkInDate)}</Td>
                          <Td>{formatDate(booking.checkOutDate)}</Td>
                          <Td>{booking.paymentMethod || 'N/A'}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{translateStatus(booking.bookingStatus)}</StatusBadge></Td>
                          <Td>
                            {/* Không có hành động cho CHECKED_OUT */}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}

            {activeTab === 'ALL' && (
              <TabContent>
                <h3>Tất Cả Đặt Phòng</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : allBookings.length === 0 ? (
                  <p>Không tìm thấy đặt phòng nào.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Mã Đặt Phòng</Th>
                        <Th>Khách Hàng</Th>
                        <Th>Mã Phòng</Th>
                        <Th>Ngày Nhận Phòng</Th>
                        <Th>Ngày Trả Phòng</Th>
                        <Th>Phương Thức Thanh Toán</Th>
                        <Th>Trạng Thái</Th>
                        <Th>Hành Động</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID || 'N/A'}</Td>
                          <Td>{booking.fullName || 'N/A'}</Td>
                          <Td>{booking.roomID || 'N/A'}</Td>
                          <Td>{formatDate(booking.checkInDate)}</Td>
                          <Td>{formatDate(booking.checkOutDate)}</Td>
                          <Td>{booking.paymentMethod || 'N/A'}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{translateStatus(booking.bookingStatus)}</StatusBadge></Td>
                          <Td>
                            {booking.bookingStatus === 'PENDING' && (
                              <ActionButton onClick={() => openModal('confirmPayment', booking)}>
                                <FaCheck /> Xác Nhận Thanh Toán
                              </ActionButton>
                            )}
                            {booking.bookingStatus === 'CHECKED_IN' && (
                              <ActionButton onClick={() => openModal('checkOut', booking)}>
                                <FaSignOutAlt /> Trả Phòng
                              </ActionButton>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}
          </TabContainer>
        </DashboardContent>

        {/* Modal for actions */}
        {showModal && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>
                  {modalType === 'confirmPayment' && 'Xác Nhận Thanh Toán'}
                  {modalType === 'checkIn' && 'Nhận Phòng Khách Hàng'}
                  {modalType === 'checkOut' && 'Trả Phòng Khách Hàng'}
                </ModalTitle>
                <CloseButton onClick={closeModal}><FaTimes /></CloseButton>
              </ModalHeader>

              {modalError && <ErrorMessage>{modalError}</ErrorMessage>}

              {modalType === 'confirmPayment' && (
                <div>
                  <p>Xác nhận rằng khách hàng đã thanh toán cho đặt phòng <strong>{selectedBooking.bookingID}</strong>.</p>
                  <SubmitButton onClick={handleConfirmPayment} disabled={modalLoading}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaCheck />} Xác Nhận Thanh Toán
                  </SubmitButton>
                </div>
              )}

              {modalType === 'checkIn' && (
                <div>
                  <p>Xác nhận nhận phòng cho đặt phòng <strong>{selectedBooking.bookingID}</strong>.</p>
                  <SubmitButton onClick={handleCheckIn} disabled={modalLoading}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaQrcode />} Xác Nhận Nhận Phòng
                  </SubmitButton>
                </div>
              )}

              {modalType === 'checkOut' && (
                <div>
                  <p>Xác nhận rằng khách hàng của đặt phòng <strong>{selectedBooking.bookingID}</strong> đã trả phòng.</p>
                  <SubmitButton onClick={handleCheckOut} disabled={modalLoading}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaSignOutAlt />} Xác Nhận Trả Phòng
                  </SubmitButton>
                </div>
              )}
            </ModalContent>
          </Modal>
        )}
      </DashboardContainer>
    </div>
  );
}

export default EmployeeDashboard;