import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaQrcode, FaSearch, FaSignInAlt, FaSignOutAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { services } from '../services';
import { BOOKING_STATUS, ROOM_STATUS } from '../services/constants/common';

// Styled Components
const DashboardContainer = styled.div`
  padding: 30px 0;
`;

const DashboardHeader = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DashboardTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0;
`;

const DashboardContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#007bff' : '#333'};
  border-bottom: ${props => props.active ? '2px solid #007bff' : 'none'};
`;

const BookingList = styled.div`
  margin-top: 20px;
`;

const BookingItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.status === BOOKING_STATUS.PENDING ? '#fff8e1' : 
                              props.status === BOOKING_STATUS.CONFIRMED ? '#e8f5e9' : 
                              props.status === BOOKING_STATUS.CHECKED_IN ? '#e3f2fd' : 
                              props.status === BOOKING_STATUS.COMPLETED ? '#f5f5f5' : '#fff'};
`;

const BookingInfo = styled.div`
  flex: 1;
`;

const BookingActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: ${props => props.primary ? '#007bff' : props.danger ? '#dc3545' : props.success ? '#28a745' : '#6c757d'};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px 0 0 4px;
  outline: none;
  
  &:focus {
    border-color: #007bff;
  }
`;

const SearchButton = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background-color: #0069d9;
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
  border-radius: 8px;
  padding: 20px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  
  &:hover {
    color: #007bff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  outline: none;
  
  &:focus {
    border-color: #007bff;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
`;

const QRCodeImage = styled.div`
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const BookingCode = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  text-align: center;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  background-color: ${props => 
    props.status === BOOKING_STATUS.PENDING ? '#ffc107' : 
    props.status === BOOKING_STATUS.CONFIRMED ? '#28a745' : 
    props.status === BOOKING_STATUS.CHECKED_IN ? '#007bff' : 
    props.status === BOOKING_STATUS.COMPLETED ? '#6c757d' : 
    props.status === BOOKING_STATUS.CANCELLED ? '#dc3545' : '#6c757d'};
`;

const RoomStatusBadge = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  background-color: ${props => 
    props.status === ROOM_STATUS.AVAILABLE ? '#28a745' : 
    props.status === ROOM_STATUS.BOOKED ? '#ffc107' : 
    props.status === ROOM_STATUS.OCCUPIED ? '#007bff' : 
    props.status === ROOM_STATUS.MAINTAINING ? '#dc3545' : 
    props.status === ROOM_STATUS.FREE ? '#6c757d' : '#6c757d'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function EmployeeDashboard() {
  const { currentUser, isEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingCode, setBookingCode] = useState('');
  const [checkInError, setCheckInError] = useState(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  // Nếu người dùng không phải là employee, chuyển hướng về trang chủ
  if (!isEmployee) {
    return <Navigate to="/" />;
  }

  // Lấy danh sách booking theo trạng thái
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let status;
        switch (activeTab) {
          case 'pending':
            status = BOOKING_STATUS.PENDING;
            break;
          case 'confirmed':
            status = BOOKING_STATUS.CONFIRMED;
            break;
          case 'checkedIn':
            status = BOOKING_STATUS.CHECKED_IN;
            break;
          case 'completed':
            status = BOOKING_STATUS.COMPLETED;
            break;
          default:
            status = BOOKING_STATUS.PENDING;
        }
        
        const data = await services.api.booking.fetchBookingsByStatus(status);
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
        
        // Dữ liệu mẫu cho trường hợp API không hoạt động
        const mockBookings = [
          {
            bookingID: 'BOOK12345678',
            customerID: 'CUST12345',
            customer: { cName: 'John Doe', phone: '123-4567-8901' },
            bookingTime: new Date().toISOString(),
            bookingStatus: status,
            totalAmount: 200,
            paymentStatus: true,
            bookingDetails: [
              {
                roomID: 'ROOM101',
                checkinDate: new Date().toISOString(),
                checkoutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
                pricePerDay: 100
              }
            ]
          },
          {
            bookingID: 'BOOK87654321',
            customerID: 'CUST54321',
            customer: { cName: 'Jane Smith', phone: '987-6543-2109' },
            bookingTime: new Date().toISOString(),
            bookingStatus: status,
            totalAmount: 300,
            paymentStatus: false,
            bookingDetails: [
              {
                roomID: 'ROOM102',
                checkinDate: new Date().toISOString(),
                checkoutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
                pricePerDay: 100
              }
            ]
          }
        ];
        
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [activeTab]);

  // Xác nhận booking
  const handleConfirmBooking = async (bookingId) => {
    setLoading(true);
    setError(null);
    
    try {
      await services.api.booking.confirmBooking(bookingId);
      
      // Cập nhật danh sách booking
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking.bookingID !== bookingId)
      );
      
      // Hiển thị thông báo thành công
      alert('Booking confirmed successfully!');
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal check-in
  const handleOpenCheckInModal = (booking) => {
    setSelectedBooking(booking);
    setBookingCode('');
    setCheckInError(null);
    setCheckInSuccess(false);
    setShowCheckInModal(true);
  };

  // Check-in booking
  const handleCheckIn = async () => {
    if (!selectedBooking) return;
    
    setLoading(true);
    setCheckInError(null);
    setCheckInSuccess(false);
    
    try {
      await services.api.booking.checkInBooking(selectedBooking.bookingID, bookingCode);
      
      // Cập nhật danh sách booking
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking.bookingID !== selectedBooking.bookingID)
      );
      
      setCheckInSuccess(true);
      
      // Đóng modal sau 2 giây
      setTimeout(() => {
        setShowCheckInModal(false);
        setSelectedBooking(null);
      }, 2000);
    } catch (err) {
      console.error('Error checking in booking:', err);
      setCheckInError('Invalid booking code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check-out booking
  const handleCheckOut = async (bookingId) => {
    setLoading(true);
    setError(null);
    
    try {
      await services.api.booking.checkOutBooking(bookingId);
      
      // Cập nhật danh sách booking
      setBookings(prevBookings => 
        prevBookings.filter(booking => booking.bookingID !== bookingId)
      );
      
      // Hiển thị thông báo thành công
      alert('Check-out successful!');
    } catch (err) {
      console.error('Error checking out booking:', err);
      setError('Failed to check-out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal QR code
  const handleOpenQRModal = async (booking) => {
    setSelectedBooking(booking);
    setQrCode(null);
    setShowQRModal(true);
    
    try {
      const qrData = await services.api.booking.generateBookingQRCode(booking.bookingID);
      setQrCode(qrData.qrCode);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setQrCode(booking.bookingID);
    }
  };

  // Tìm kiếm booking
  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  // Render danh sách booking
  const renderBookings = () => {
    if (loading) {
      return (
        <LoadingSpinner>
          <FaSpinner size={40} />
        </LoadingSpinner>
      );
    }
    
    if (error) {
      return (
        <ErrorMessage>
          <FaExclamationTriangle /> {error}
        </ErrorMessage>
      );
    }
    
    if (bookings.length === 0) {
      return <p>No bookings found.</p>;
    }
    
    return (
      <BookingList>
        {bookings.map(booking => (
          <BookingItem key={booking.bookingID} status={booking.bookingStatus}>
            <BookingInfo>
              <h3>Booking #{booking.bookingID}</h3>
              <p><strong>Customer:</strong> {booking.customer?.cName}</p>
              <p><strong>Phone:</strong> {booking.customer?.phone}</p>
              <p><strong>Check-in:</strong> {new Date(booking.bookingDetails?.[0]?.checkinDate).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {new Date(booking.bookingDetails?.[0]?.checkoutDate).toLocaleDateString()}</p>
              <p><strong>Room:</strong> {booking.bookingDetails?.[0]?.roomID}</p>
              <p><strong>Total:</strong> ${booking.totalAmount}</p>
              <p>
                <strong>Status:</strong> <StatusBadge status={booking.bookingStatus}>{booking.bookingStatus}</StatusBadge>
              </p>
              <p>
                <strong>Payment:</strong> {booking.paymentStatus ? 'Paid' : 'Unpaid'}
              </p>
            </BookingInfo>
            <BookingActions>
              {activeTab === 'pending' && (
                <ActionButton 
                  primary 
                  onClick={() => handleConfirmBooking(booking.bookingID)}
                  disabled={loading}
                >
                  <FaCheckCircle /> Confirm
                </ActionButton>
              )}
              {activeTab === 'confirmed' && (
                <>
                  <ActionButton 
                    primary 
                    onClick={() => handleOpenCheckInModal(booking)}
                    disabled={loading}
                  >
                    <FaSignInAlt /> Check-in
                  </ActionButton>
                  <ActionButton 
                    onClick={() => handleOpenQRModal(booking)}
                    disabled={loading}
                  >
                    <FaQrcode /> QR Code
                  </ActionButton>
                </>
              )}
              {activeTab === 'checkedIn' && (
                <ActionButton 
                  success 
                  onClick={() => handleCheckOut(booking.bookingID)}
                  disabled={loading}
                >
                  <FaSignOutAlt /> Check-out
                </ActionButton>
              )}
            </BookingActions>
          </BookingItem>
        ))}
      </BookingList>
    );
  };

  return (
    <div className="container">
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>Employee Dashboard</DashboardTitle>
          <p>Welcome, {currentUser?.name || 'Employee'}!</p>
        </DashboardHeader>

        <DashboardContent>
          <TabContainer>
            <Tab 
              active={activeTab === 'pending'} 
              onClick={() => setActiveTab('pending')}
            >
              Pending Bookings
            </Tab>
            <Tab 
              active={activeTab === 'confirmed'} 
              onClick={() => setActiveTab('confirmed')}
            >
              Confirmed Bookings
            </Tab>
            <Tab 
              active={activeTab === 'checkedIn'} 
              onClick={() => setActiveTab('checkedIn')}
            >
              Checked-in Guests
            </Tab>
            <Tab 
              active={activeTab === 'completed'} 
              onClick={() => setActiveTab('completed')}
            >
              Completed Stays
            </Tab>
          </TabContainer>
          
          <SearchBar>
            <SearchInput 
              type="text" 
              placeholder="Search by booking ID, customer name, or room number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton onClick={handleSearch}>
              <FaSearch /> Search
            </SearchButton>
          </SearchBar>
          
          {renderBookings()}
        </DashboardContent>
      </DashboardContainer>
      
      {/* Check-in Modal */}
      {showCheckInModal && selectedBooking && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Check-in Guest</ModalTitle>
              <CloseButton onClick={() => setShowCheckInModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <div>
              <p><strong>Booking ID:</strong> {selectedBooking.bookingID}</p>
              <p><strong>Customer:</strong> {selectedBooking.customer?.cName}</p>
              <p><strong>Room:</strong> {selectedBooking.bookingDetails?.[0]?.roomID}</p>
              
              <FormGroup>
                <Label htmlFor="bookingCode">Enter Booking Code:</Label>
                <Input 
                  type="text" 
                  id="bookingCode" 
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder="Enter the booking code provided by the guest"
                />
              </FormGroup>
              
              {checkInError && (
                <ErrorMessage>
                  <FaExclamationTriangle /> {checkInError}
                </ErrorMessage>
              )}
              
              {checkInSuccess && (
                <SuccessMessage>
                  <FaCheckCircle /> Check-in successful!
                </SuccessMessage>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <ActionButton onClick={() => setShowCheckInModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton 
                  primary 
                  onClick={handleCheckIn}
                  disabled={loading || !bookingCode}
                >
                  {loading ? <FaSpinner /> : <FaSignInAlt />} Check-in
                </ActionButton>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
      
      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Booking QR Code</ModalTitle>
              <CloseButton onClick={() => setShowQRModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <div>
              <p><strong>Booking ID:</strong> {selectedBooking.bookingID}</p>
              <p><strong>Customer:</strong> {selectedBooking.customer?.cName}</p>
              
              <QRCodeContainer>
                <QRCodeImage>
                  {qrCode ? (
                    <FaQrcode size={150} />
                  ) : (
                    <FaSpinner size={40} />
                  )}
                </QRCodeImage>
                
                {qrCode && (
                  <BookingCode>
                    {qrCode}
                  </BookingCode>
                )}
              </QRCodeContainer>
              
              <p style={{ textAlign: 'center' }}>
                Show this QR code to the guest for check-in.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <ActionButton onClick={() => setShowQRModal(false)}>
                  Close
                </ActionButton>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default EmployeeDashboard;
