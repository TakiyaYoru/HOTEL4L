import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { services } from '../services';
import { 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes, 
  FaUser, 
  FaQrcode, 
  FaSignOutAlt, 
  FaSpinner 
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

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
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
    if (props.status === 'Pending') return '#f39c12';
    if (props.status === 'Confirmed') return '#2ecc71';
    if (props.status === 'Checked-in') return '#3498db';
    if (props.status === 'Checked-out') return '#95a5a6';
    if (props.status === 'Cancelled') return '#e74c3c';
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
  const [activeTab, setActiveTab] = useState('pending');
  const [bookings, setBookings] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'confirmPayment', 'checkIn', 'checkOut', 'cancel'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInCode, setCheckInCode] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch employee and bookings data
// State để lưu trữ booking theo trạng thái
const [pendingBookings, setPendingBookings] = useState([]);
const [confirmedBookings, setConfirmedBookings] = useState([]);
const [checkedInBookings, setCheckedInBookings] = useState([]);
const [allBookings, setAllBookings] = useState([]);

// Fetch bookings theo trạng thái
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employee data
      const employeeData = await services.api.employee.fetchEmployeeById(currentUser.id);
      setEmployee(employeeData);

      // Fetch bookings theo trạng thái
      const pendingData = await services.api.booking.fetchBookingsByStatus('Pending');
      const confirmedData = await services.api.booking.fetchBookingsByStatus('Confirmed');
      const checkedInData = await services.api.booking.fetchBookingsByStatus('Checked-in');
      const allData = await services.api.booking.fetchAllBookings();

      // Lọc thêm điều kiện paymentMethod cho Pending Bookings
      const filteredPending = pendingData.filter(booking => booking.paymentMethod === 'Cash');

      setPendingBookings(filteredPending);
      setConfirmedBookings(confirmedData);
      setCheckedInBookings(checkedInData);
      setAllBookings(allData);

      console.log('Pending Bookings:', filteredPending);
      console.log('Confirmed Bookings:', confirmedData);
      console.log('Checked-in Bookings:', checkedInData);
      console.log('All Bookings:', allData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };

  fetchData();
}, [currentUser.id]);
  // Redirect if not an employee
  if (!isEmployee) {
    return <Navigate to="/" />;
  }

  // Filter bookings by status


  // Handle modal actions
  const openModal = (type, booking) => {
    setModalType(type);
    setSelectedBooking(booking);
    setShowModal(true);
    setCheckInCode('');
    setModalError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedBooking(null);
    setCheckInCode('');
    setModalError(null);
  };

  const handleConfirmPayment = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      // Generate check-in code
      const checkInCode = services.utils.generateCheckInCode();

      // Update booking status to Confirmed
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'Confirmed',
        paymentStatus: true,
        checkInCode: checkInCode,
      });

      // Send confirmation email to customer
      await services.api.email.sendConfirmationEmail({
        to: selectedBooking.email,
        bookingID: selectedBooking.bookingID,
        checkInCode: checkInCode,
        checkInDate: selectedBooking.checkInDate,
        checkOutDate: selectedBooking.checkOutDate,
        total: selectedBooking.totalAmount,
      });

      // Refresh bookings
      const bookingsData = await services.api.booking.fetchBookings();
      setBookings(bookingsData);

      closeModal();
    } catch (err) {
      console.error('Error confirming payment:', err);
      setModalError('Failed to confirm payment. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      // Verify check-in code
      const verification = await services.api.booking.verifyCheckInCode(selectedBooking.bookingID, checkInCode);
      if (!verification.success) {
        setModalError('Invalid check-in code. Please try again.');
        return;
      }

      // Update booking status to Checked-in
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'Checked-in',
        checkInTime: new Date().toISOString(),
      });

      // Refresh bookings
      const bookingsData = await services.api.booking.fetchBookings();
      setBookings(bookingsData);

      closeModal();
    } catch (err) {
      console.error('Error checking in:', err);
      setModalError('Failed to check in. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      // Update booking status to Checked-out
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'Checked-out',
        checkOutTime: new Date().toISOString(),
      });

      // Update room status to Available
      const roomData = await services.api.room.fetchRoomById(selectedBooking.roomID);
      await services.api.room.updateRoom(selectedBooking.roomID, {
        roomID: roomData.roomID,
        roomStatus: 'Available',
        rTypeID: roomData.rTypeID,
      });

      // Send thank you email to customer
      await services.api.email.sendThankYouEmail({
        to: selectedBooking.email,
        bookingID: selectedBooking.bookingID,
      });

      // Refresh bookings
      const bookingsData = await services.api.booking.fetchBookings();
      setBookings(bookingsData);

      closeModal();
    } catch (err) {
      console.error('Error checking out:', err);
      setModalError('Failed to check out. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setModalLoading(true);
      setModalError(null);

      // Update booking status to Cancelled
      await services.api.booking.updateBooking(selectedBooking.bookingID, {
        ...selectedBooking,
        bookingStatus: 'Cancelled',
      });

      // If the room is still booked, set it to Available
      if (selectedBooking.bookingStatus === 'Pending' || selectedBooking.bookingStatus === 'Confirmed' || selectedBooking.bookingStatus === 'Checked-in') {
        const roomData = await services.api.room.fetchRoomById(selectedBooking.roomID);
        await services.api.room.updateRoom(selectedBooking.roomID, {
          roomID: roomData.roomID,
          roomStatus: 'Available',
          rTypeID: roomData.rTypeID,
        });
      }

      // Send cancellation email to customer
      await services.api.email.sendCancellationEmail({
        to: selectedBooking.email,
        bookingID: selectedBooking.bookingID,
      });

      // Refresh bookings
      const bookingsData = await services.api.booking.fetchBookings();
      setBookings(bookingsData);

      closeModal();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setModalError('Failed to cancel booking. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="container">
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>Employee Dashboard</DashboardTitle>
          <p>Welcome, {employee?.eName || 'Employee'}!</p>
        </DashboardHeader>

        {employee && (
          <EmployeeInfo>
            <EmployeeDetails>
              <p><strong>Employee ID:</strong> {employee.employeeID}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Phone:</strong> {employee.phone}</p>
              <p><strong>Hire Date:</strong> {new Date(employee.hireDate).toLocaleDateString()}</p>
            </EmployeeDetails>
            <ActionButton onClick={handleLogout} danger>
              <FaSignOutAlt /> Logout
            </ActionButton>
          </EmployeeInfo>
        )}

        <DashboardContent>
          <TabContainer>
            <TabButtons>
              <TabButton 
                $active={activeTab === 'pending'} 
                onClick={() => setActiveTab('pending')}
              >
                <FaCalendarAlt /> Pending Payment
              </TabButton>
              <TabButton 
                $active={activeTab === 'confirmed'} 
                onClick={() => setActiveTab('confirmed')}
              >
                <FaCheck /> Confirmed Payment
              </TabButton>
              <TabButton 
                $active={activeTab === 'checkedIn'} 
                onClick={() => setActiveTab('checkedIn')}
              >
                <FaUser /> Checked-in Bookings
              </TabButton>
              <TabButton 
                $active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
              >
                <FaCalendarAlt /> All Bookings
              </TabButton>
            </TabButtons>

            {activeTab === 'pending' && (
              <TabContent>
                <h3>Pending Payment (Cash Payments)</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : pendingBookings.length === 0 ? (
                  <p>No pending bookings found.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Booking ID</Th>
                        <Th>Customer</Th>
                        <Th>Room ID</Th>
                        <Th>Check-in Date</Th>
                        <Th>Check-out Date</Th>
                        <Th>Payment Method</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID}</Td>
                          <Td>{booking.fullName}</Td>
                          <Td>{booking.roomID}</Td>
                          <Td>{new Date(booking.checkInDate).toLocaleDateString()}</Td>
                          <Td>{new Date(booking.checkOutDate).toLocaleDateString()}</Td>
                          <Td>{booking.paymentMethod}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{booking.bookingStatus}</StatusBadge></Td>
                          <Td>
                            <ActionButton onClick={() => openModal('confirmPayment', booking)}>
                              <FaCheck /> Confirm Payment
                            </ActionButton>
                            <ActionButton danger onClick={() => openModal('cancel', booking)}>
                              <FaTimes /> Cancel
                            </ActionButton>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}

            {activeTab === 'confirmed' && (
              <TabContent>
                <h3>Confirmed Bookings (Awaiting Check-in)</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : confirmedBookings.length === 0 ? (
                  <p>No confirmed bookings found.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Booking ID</Th>
                        <Th>Customer</Th>
                        <Th>Room ID</Th>
                        <Th>Check-in Date</Th>
                        <Th>Check-out Date</Th>
                        <Th>Payment Method</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID}</Td>
                          <Td>{booking.fullName}</Td>
                          <Td>{booking.roomID}</Td>
                          <Td>{new Date(booking.checkInDate).toLocaleDateString()}</Td>
                          <Td>{new Date(booking.checkOutDate).toLocaleDateString()}</Td>
                          <Td>{booking.paymentMethod}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{booking.bookingStatus}</StatusBadge></Td>
                          <Td>
                            <ActionButton onClick={() => openModal('checkIn', booking)}>
                              <FaQrcode /> Check-in
                            </ActionButton>
                            <ActionButton danger onClick={() => openModal('cancel', booking)}>
                              <FaTimes /> Cancel
                            </ActionButton>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}

            {activeTab === 'checkedIn' && (
              <TabContent>
                <h3>Checked-in Bookings (Awaiting Check-out)</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : checkedInBookings.length === 0 ? (
                  <p>No checked-in bookings found.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Booking ID</Th>
                        <Th>Customer</Th>
                        <Th>Room ID</Th>
                        <Th>Check-in Date</Th>
                        <Th>Check-out Date</Th>
                        <Th>Payment Method</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkedInBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID}</Td>
                          <Td>{booking.fullName}</Td>
                          <Td>{booking.roomID}</Td>
                          <Td>{new Date(booking.checkInDate).toLocaleDateString()}</Td>
                          <Td>{new Date(booking.checkOutDate).toLocaleDateString()}</Td>
                          <Td>{booking.paymentMethod}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{booking.bookingStatus}</StatusBadge></Td>
                          <Td>
                            <ActionButton onClick={() => openModal('checkOut', booking)}>
                              <FaSignOutAlt /> Check-out
                            </ActionButton>
                            <ActionButton danger onClick={() => openModal('cancel', booking)}>
                              <FaTimes /> Cancel
                            </ActionButton>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </TabContent>
            )}

            {activeTab === 'all' && (
              <TabContent>
                <h3>All Bookings</h3>
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : allBookings.length === 0 ? (
                  <p>No bookings found.</p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Booking ID</Th>
                        <Th>Customer</Th>
                        <Th>Room ID</Th>
                        <Th>Check-in Date</Th>
                        <Th>Check-out Date</Th>
                        <Th>Payment Method</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.map(booking => (
                        <tr key={booking.bookingID}>
                          <Td>{booking.bookingID}</Td>
                          <Td>{booking.fullName}</Td>
                          <Td>{booking.roomID}</Td>
                          <Td>{new Date(booking.checkInDate).toLocaleDateString()}</Td>
                          <Td>{new Date(booking.checkOutDate).toLocaleDateString()}</Td>
                          <Td>{booking.paymentMethod}</Td>
                          <Td><StatusBadge status={booking.bookingStatus}>{booking.bookingStatus}</StatusBadge></Td>
                          <Td>
                            {booking.bookingStatus === 'Pending' && booking.paymentMethod === 'Cash' && (
                              <ActionButton onClick={() => openModal('confirmPayment', booking)}>
                                <FaCheck /> Confirm Payment
                              </ActionButton>
                            )}
                            {booking.bookingStatus === 'Confirmed' && (
                              <ActionButton onClick={() => openModal('checkIn', booking)}>
                                <FaQrcode /> Check-in
                              </ActionButton>
                            )}
                            {booking.bookingStatus === 'Checked-in' && (
                              <ActionButton onClick={() => openModal('checkOut', booking)}>
                                <FaSignOutAlt /> Check-out
                              </ActionButton>
                            )}
                            {booking.bookingStatus !== 'Checked-out' && booking.bookingStatus !== 'Cancelled' && (
                              <ActionButton danger onClick={() => openModal('cancel', booking)}>
                                <FaTimes /> Cancel
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
                  {modalType === 'confirmPayment' && 'Confirm Payment'}
                  {modalType === 'checkIn' && 'Check-in Customer'}
                  {modalType === 'checkOut' && 'Check-out Customer'}
                  {modalType === 'cancel' && 'Cancel Booking'}
                </ModalTitle>
                <CloseButton onClick={closeModal}><FaTimes /></CloseButton>
              </ModalHeader>

              {modalError && <ErrorMessage>{modalError}</ErrorMessage>}

              {modalType === 'confirmPayment' && (
                <div>
                  <p>Confirm that the customer has paid for booking <strong>{selectedBooking.bookingID}</strong> in cash.</p>
                  <SubmitButton onClick={handleConfirmPayment} disabled={modalLoading}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaCheck />} Confirm Payment
                  </SubmitButton>
                </div>
              )}

              {modalType === 'checkIn' && (
                <div>
                  <FormGroup>
                    <Label htmlFor="checkInCode">Check-in Code</Label>
                    <Input
                      type="text"
                      id="checkInCode"
                      value={checkInCode}
                      onChange={(e) => setCheckInCode(e.target.value)}
                      placeholder="Enter check-in code"
                      required
                    />
                  </FormGroup>
                  <SubmitButton onClick={handleCheckIn} disabled={modalLoading || !checkInCode}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaQrcode />} Verify and Check-in
                  </SubmitButton>
                </div>
              )}

              {modalType === 'checkOut' && (
                <div>
                  <p>Confirm that the customer for booking <strong>{selectedBooking.bookingID}</strong> has checked out.</p>
                  <SubmitButton onClick={handleCheckOut} disabled={modalLoading}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaSignOutAlt />} Confirm Check-out
                  </SubmitButton>
                </div>
              )}

              {modalType === 'cancel' && (
                <div>
                  <p>Are you sure you want to cancel booking <strong>{selectedBooking.bookingID}</strong>?</p>
                  <SubmitButton onClick={handleCancelBooking} disabled={modalLoading}>
                    {modalLoading ? <FaSpinner className="spinner" /> : <FaTimes />} Cancel Booking
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