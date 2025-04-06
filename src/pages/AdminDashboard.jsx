import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { services } from '../services';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaCheck, 
  FaTimes, 
  FaBed, 
  FaHotel, 
  FaCalendarAlt, 
  FaUsers, 
  FaCog,
  FaArrowRight,
  FaSave
} from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #b8860b;
  }
`;

const SectionSubtitle = styled.h3`
  font-size: 1.4rem;
  margin: 30px 0 15px;
  color: #444;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #b8860b;
  }
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
  color: ${props => props.delete ? '#e74c3c' : '#3498db'};
  font-size: 1.1rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.delete ? '#c0392b' : '#2980b9'};
    transform: scale(1.2);
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-top: 20px;
  padding: 25px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease;
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

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 15px;
  
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
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #d4af37;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CancelButton = styled(SubmitButton)`
  background-color: #6c757d;
  margin-top: 10px;
  
  &:hover {
    background-color: #5a6268;
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
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
    if (props.status === 'Available') return '#2ecc71';
    if (props.status === 'Booked') return '#e74c3c';
    if (props.status === 'Maintaining') return '#f39c12';
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

function AdminDashboard() {
  const { currentUser, isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for rooms
  const [roomFormData, setRoomFormData] = useState({
    roomID: '',
    roomStatus: 'Available',
    rTypeID: ''
  });
  
  // Form state for room types
  const [roomTypeFormData, setRoomTypeFormData] = useState({
    rTypeID: '',
    typeName: '',
    price: '',
    maxGuests: '',
    area: ''
  });
  
  // Form state for employees
  const [employeeFormData, setEmployeeFormData] = useState({
    employeeID: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee'
  });
  
  // Edit mode state
  const [editMode, setEditMode] = useState({
    room: false,
    roomType: false,
    employee: false
  });
  
  // Original ID for editing (to handle ID changes)
  const [originalId, setOriginalId] = useState({
    roomID: '',
    rTypeID: '',
    employeeID: ''
  });
  
  // Fetch rooms, room types, and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsData, roomTypesData, employeesData] = await Promise.all([
          services.api.room.fetchRooms(),
          services.api.room.fetchRoomTypes(),
          services.api.employee.fetchEmployees()
        ]);
        
        setRooms(roomsData);
        setRoomTypes(roomTypesData);
        setEmployees(employeesData);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Nếu người dùng không phải là admin hoặc manager, chuyển hướng về trang chủ
  if (!isAdmin && !isManager) {
    return <Navigate to="/" />;
  }
  
  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoomTypeInputChange = (e) => {
    const { name, value } = e.target;
    setRoomTypeFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editMode.room) {
        await services.api.room.updateRoom(originalId.roomID, roomFormData);
        alert('Phòng đã được cập nhật thành công!');
      } else {
        await services.api.room.createRoom(roomFormData);
        alert('Phòng đã được tạo thành công!');
      }
      
      const roomsData = await services.api.room.fetchRooms();
      setRooms(roomsData);
      
      setRoomFormData({
        roomID: '',
        roomStatus: 'Available',
        rTypeID: ''
      });
      setEditMode(prev => ({ ...prev, room: false }));
      setOriginalId(prev => ({ ...prev, roomID: '' }));
      
      setLoading(false);
    } catch (err) {
      console.error(`Lỗi khi ${editMode.room ? 'cập nhật' : 'tạo'} phòng:`, err);
      setError(`Không thể ${editMode.room ? 'cập nhật' : 'tạo'} phòng. Vui lòng thử lại.`);
      setLoading(false);
    }
  };
  
  const handleRoomTypeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editMode.roomType) {
        await services.api.room.updateRoomType(originalId.rTypeID, roomTypeFormData);
        alert('Loại phòng đã được cập nhật thành công!');
      } else {
        await services.api.room.createRoomType(roomTypeFormData);
        alert('Loại phòng đã được tạo thành công!');
      }
      
      const roomTypesData = await services.api.room.fetchRoomTypes();
      setRoomTypes(roomTypesData);
      
      setRoomTypeFormData({
        rTypeID: '',
        typeName: '',
        price: '',
        maxGuests: '',
        area: ''
      });
      setEditMode(prev => ({ ...prev, roomType: false }));
      setOriginalId(prev => ({ ...prev, rTypeID: '' }));
      
      setLoading(false);
    } catch (err) {
      console.error(`Lỗi khi ${editMode.roomType ? 'cập nhật' : 'tạo'} loại phòng:`, err);
      setError(`Không thể ${editMode.roomType ? 'cập nhật' : 'tạo'} loại phòng. Vui lòng thử lại.`);
      setLoading(false);
    }
  };
  
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editMode.employee) {
        await services.api.employee.updateEmployee(originalId.employeeID, employeeFormData);
        alert('Nhân viên đã được cập nhật thành công!');
      } else {
        await services.api.employee.createEmployee(employeeFormData);
        alert('Tài khoản nhân viên đã được tạo thành công!');
      }
      
      const employeesData = await services.api.employee.fetchEmployees();
      setEmployees(employeesData);
      
      setEmployeeFormData({
        employeeID: '',
        name: '',
        email: '',
        password: '',
        role: 'Employee'
      });
      setEditMode(prev => ({ ...prev, employee: false }));
      setOriginalId(prev => ({ ...prev, employeeID: '' }));
      
      setLoading(false);
    } catch (err) {
      console.error(`Lỗi khi ${editMode.employee ? 'cập nhật' : 'tạo'} nhân viên:`, err);
      setError(`Không thể ${editMode.employee ? 'cập nhật' : 'tạo'} nhân viên. Vui lòng thử lại.`);
      setLoading(false);
    }
  };
  
  const handleEditRoom = (room) => {
    setOriginalId(prev => ({ ...prev, roomID: room.roomID }));
    setRoomFormData({
      roomID: room.roomID,
      roomStatus: room.roomStatus,
      rTypeID: room.rTypeID
    });
    setEditMode(prev => ({ ...prev, room: true }));
    document.getElementById('roomForm').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleEditRoomType = (type) => {
    setOriginalId(prev => ({ ...prev, rTypeID: type.rTypeID }));
    setRoomTypeFormData({
      rTypeID: type.rTypeID,
      typeName: type.typeName,
      price: type.price,
      maxGuests: type.maxGuests,
      area: type.area
    });
    setEditMode(prev => ({ ...prev, roomType: true }));
    document.getElementById('roomTypeForm').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleEditEmployee = (employee) => {
    setOriginalId(prev => ({ ...prev, employeeID: employee.employeeID }));
    setEmployeeFormData({
      employeeID: employee.employeeID,
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role
    });
    setEditMode(prev => ({ ...prev, employee: true }));
    document.getElementById('employeeForm').scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleCancelEdit = (formType) => {
    if (formType === 'room') {
      setRoomFormData({
        roomID: '',
        roomStatus: 'Available',
        rTypeID: ''
      });
      setEditMode(prev => ({ ...prev, room: false }));
      setOriginalId(prev => ({ ...prev, roomID: '' }));
    } else if (formType === 'roomType') {
      setRoomTypeFormData({
        rTypeID: '',
        typeName: '',
        price: '',
        maxGuests: '',
        area: ''
      });
      setEditMode(prev => ({ ...prev, roomType: false }));
      setOriginalId(prev => ({ ...prev, rTypeID: '' }));
    } else if (formType === 'employee') {
      setEmployeeFormData({
        employeeID: '',
        name: '',
        email: '',
        password: '',
        role: 'Employee'
      });
      setEditMode(prev => ({ ...prev, employee: false }));
      setOriginalId(prev => ({ ...prev, employeeID: '' }));
    }
  };
  
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) {
      try {
        setLoading(true);
        await services.api.room.deleteRoom(roomId);
        const roomsData = await services.api.room.fetchRooms();
        setRooms(roomsData);
        setLoading(false);
        alert('Phòng đã được xóa thành công!');
      } catch (err) {
        console.error('Lỗi khi xóa phòng:', err);
        setError('Không thể xóa phòng. Vui lòng thử lại.');
        setLoading(false);
      }
    }
  };
  
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      try {
        setLoading(true);
        await services.api.employee.deleteEmployee(employeeId);
        const employeesData = await services.api.employee.fetchEmployees();
        setEmployees(employeesData);
        setLoading(false);
        alert('Nhân viên đã được xóa thành công!');
      } catch (err) {
        console.error('Lỗi khi xóa nhân viên:', err);
        setError('Không thể xóa nhân viên. Vui lòng thử lại.');
        setLoading(false);
      }
    }
  };
  
  const getRoomTypeName = (rTypeID) => {
    const roomType = roomTypes.find(type => type.rTypeID === rTypeID);
    return roomType ? roomType.typeName.replace('_', ' ') : 'Không xác định';
  };

  return (
    <div className="container">
      <DashboardContainer>
        <DashboardHeader>
          <DashboardTitle>Bảng Điều Khiển Quản Trị</DashboardTitle>
          <p>Chào mừng, {currentUser?.name || 'Quản trị viên'}!</p>
        </DashboardHeader>

        <DashboardContent>
          <TabContainer>
            <TabButtons>
              <TabButton 
                $active={activeTab === 'rooms'} 
                onClick={() => setActiveTab('rooms')}
              >
                <FaBed /> Quản Lý Phòng
              </TabButton>
              <TabButton 
                $active={activeTab === 'roomTypes'} 
                onClick={() => setActiveTab('roomTypes')}
              >
                <FaHotel /> Quản Lý Loại Phòng
              </TabButton>
              <TabButton 
                $active={activeTab === 'bookings'} 
                onClick={() => setActiveTab('bookings')}
              >
                <FaCalendarAlt /> Quản Lý Đặt Phòng
              </TabButton>
              <TabButton 
                $active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')}
              >
                <FaUsers /> Quản Lý Người Dùng
              </TabButton>
            </TabButtons>
            
            {activeTab === 'rooms' && (
              <TabContent>
                <SectionTitle><FaBed /> Quản Lý Phòng</SectionTitle>
                
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : (
                  <>
                    <h3>Danh Sách Phòng</h3>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Mã Phòng</Th>
                          <Th>Loại Phòng</Th>
                          <Th>Trạng Thái</Th>
                          <Th>Giá</Th>
                          <Th>Số Khách Tối Đa</Th>
                          <Th>Diện Tích (m²)</Th>
                          <Th>Hành Động</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map(room => (
                          <tr key={room.roomID}>
                            <Td>{room.roomID}</Td>
                            <Td>{getRoomTypeName(room.rTypeID)}</Td>
                            <Td>
                              <StatusBadge status={room.roomStatus}>
                                {room.roomStatus === 'Available' ? 'Còn Trống' : 
                                 room.roomStatus === 'Booked' ? 'Đã Đặt' : 
                                 room.roomStatus === 'Maintaining' ? 'Đang Bảo Trì' : 'Không Xác Định'}
                              </StatusBadge>
                            </Td>
                            <Td>${room.roomType.price}</Td>
                            <Td>{room.roomType.maxGuests}</Td>
                            <Td>{room.roomType.area}</Td>
                            <Td>
                              <ActionButton onClick={() => handleEditRoom(room)}>
                                <FaEdit />
                              </ActionButton>
                              <ActionButton 
                                delete 
                                onClick={() => handleDeleteRoom(room.roomID)}
                              >
                                <FaTrash />
                              </ActionButton>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    
                    <h3>{editMode.room ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}</h3>
                    <Form id="roomForm" onSubmit={handleRoomSubmit}>
                      <FormGroup>
                        <Label htmlFor="roomID">Mã Phòng</Label>
                        <Input 
                          type="text" 
                          id="roomID" 
                          name="roomID" 
                          value={roomFormData.roomID} 
                          onChange={handleRoomInputChange}
                          placeholder="Ví dụ: 101A"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="rTypeID">Loại Phòng</Label>
                        <Select 
                          id="rTypeID" 
                          name="rTypeID" 
                          value={roomFormData.rTypeID} 
                          onChange={handleRoomInputChange}
                          required
                        >
                          <option value="">Chọn Loại Phòng</option>
                          {roomTypes.map(type => (
                            <option key={type.rTypeID} value={type.rTypeID}>
                              {type.typeName.replace('_', ' ')} (${type.price})
                            </option>
                          ))}
                        </Select>
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="roomStatus">Trạng Thái Phòng</Label>
                        <Select 
                          id="roomStatus" 
                          name="roomStatus" 
                          value={roomFormData.roomStatus} 
                          onChange={handleRoomInputChange}
                          required
                        >
                          <option value="Available">Còn Trống</option>
                          <option value="Booked">Đã Đặt</option>
                          <option value="Maintaining">Đang Bảo Trì</option>
                        </Select>
                      </FormGroup>
                      
                      <SubmitButton type="submit" disabled={loading}>
                        {loading ? (editMode.room ? 'Đang Cập Nhật...' : 'Đang Thêm...') : (editMode.room ? 'Cập Nhật Phòng' : 'Thêm Phòng')}
                      </SubmitButton>
                      
                      {editMode.room && (
                        <SubmitButton 
                          type="button" 
                          onClick={() => handleCancelEdit('room')}
                          style={{ 
                            backgroundColor: '#6c757d',
                            marginTop: '10px'
                          }}
                        >
                          Hủy Chỉnh Sửa
                        </SubmitButton>
                      )}
                    </Form>
                  </>
                )}
              </TabContent>
            )}
            
            {activeTab === 'roomTypes' && (
              <TabContent>
                <h2>Quản Lý Loại Phòng</h2>
                
                {loading ? (
                  <p>Đang tải...</p>
                ) : error ? (
                  <p style={{ color: 'red' }}>{error}</p>
                ) : (
                  <>
                    <h3>Danh Sách Loại Phòng</h3>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Mã Loại Phòng</Th>
                          <Th>Tên Loại Phòng</Th>
                          <Th>Giá</Th>
                          <Th>Số Khách Tối Đa</Th>
                          <Th>Diện Tích (m²)</Th>
                          <Th>Hành Động</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomTypes.map(type => (
                          <tr key={type.rTypeID}>
                            <Td>{type.rTypeID}</Td>
                            <Td>{type.typeName.replace('_', ' ')}</Td>
                            <Td>${type.price}</Td>
                            <Td>{type.maxGuests}</Td>
                            <Td>{type.area}</Td>
                            <Td>
                              <ActionButton onClick={() => handleEditRoomType(type)}>
                                <FaEdit />
                              </ActionButton>
                              <ActionButton delete>
                                <FaTrash />
                              </ActionButton>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    
                    <h3>Thêm Loại Phòng Mới</h3>
                    <Form id="roomTypeForm" onSubmit={handleRoomTypeSubmit}>
                      <FormGroup>
                        <Label htmlFor="rTypeID">Mã Loại Phòng</Label>
                        <Input 
                          type="text" 
                          id="rTypeID" 
                          name="rTypeID" 
                          value={roomTypeFormData.rTypeID} 
                          onChange={handleRoomTypeInputChange}
                          placeholder="Ví dụ: SGL, DBL, KIN"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="typeName">Tên Loại Phòng</Label>
                        <Input 
                          type="text" 
                          id="typeName" 
                          name="typeName" 
                          value={roomTypeFormData.typeName} 
                          onChange={handleRoomTypeInputChange}
                          placeholder="Ví dụ: Phòng Đơn"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="price">Giá</Label>
                        <Input 
                          type="number" 
                          id="price" 
                          name="price" 
                          value={roomTypeFormData.price} 
                          onChange={handleRoomTypeInputChange}
                          placeholder="Ví dụ: 100"
                          min="0"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="maxGuests">Số Khách Tối Đa</Label>
                        <Input 
                          type="number" 
                          id="maxGuests" 
                          name="maxGuests" 
                          value={roomTypeFormData.maxGuests} 
                          onChange={handleRoomTypeInputChange}
                          placeholder="Ví dụ: 2"
                          min="1"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="area">Diện Tích (m²)</Label>
                        <Input 
                          type="number" 
                          id="area" 
                          name="area" 
                          value={roomTypeFormData.area} 
                          onChange={handleRoomTypeInputChange}
                          placeholder="Ví dụ: 30"
                          min="0"
                          required
                        />
                      </FormGroup>
                      
                      <SubmitButton type="submit" disabled={loading}>
                        {loading ? 'Đang Thêm...' : 'Thêm Loại Phòng'}
                      </SubmitButton>
                    </Form>
                  </>
                )}
              </TabContent>
            )}
            
            {activeTab === 'bookings' && (
              <TabContent>
                <h2>Quản Lý Đặt Phòng</h2>
                <p>Quản lý các đặt phòng tại đây.</p>
              </TabContent>
            )}
            
            {activeTab === 'users' && (
              <TabContent>
                <SectionTitle><FaUsers /> Quản Lý Người Dùng</SectionTitle>
                
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : (
                  <>
                    <h3>Danh Sách Nhân Viên</h3>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Mã Nhân Viên</Th>
                          <Th>Tên</Th>
                          <Th>Email</Th>
                          <Th>Vai Trò</Th>
                          <Th>Hành Động</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map(employee => (
                          <tr key={employee.employeeID}>
                            <Td>{employee.employeeID}</Td>
                            <Td>{employee.name}</Td>
                            <Td>{employee.email}</Td>
                            <Td>{employee.role === 'Employee' ? 'Nhân Viên' : 'Quản Lý'}</Td>
                            <Td>
                              <ActionButton onClick={() => handleEditEmployee(employee)}>
                                <FaEdit />
                              </ActionButton>
                              <ActionButton 
                                delete 
                                onClick={() => handleDeleteEmployee(employee.employeeID)}
                              >
                                <FaTrash />
                              </ActionButton>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    
                    <h3>{editMode.employee ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3>
                    <Form id="employeeForm" onSubmit={handleEmployeeSubmit}>
                      <FormGroup>
                        <Label htmlFor="employeeID">Mã Nhân Viên</Label>
                        <Input 
                          type="text" 
                          id="employeeID" 
                          name="employeeID" 
                          value={employeeFormData.employeeID} 
                          onChange={handleEmployeeInputChange}
                          placeholder="Ví dụ: EMP001"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="name">Tên</Label>
                        <Input 
                          type="text" 
                          id="name" 
                          name="name" 
                          value={employeeFormData.name} 
                          onChange={handleEmployeeInputChange}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          type="email" 
                          id="email" 
                          name="email" 
                          value={employeeFormData.email} 
                          onChange={handleEmployeeInputChange}
                          placeholder="Ví dụ: nhanvien@khachsan.com"
                          required
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="password">Mật Khẩu {editMode.employee && '(Để trống nếu không thay đổi)'}</Label>
                        <Input 
                          type="password" 
                          id="password" 
                          name="password" 
                          value={employeeFormData.password} 
                          onChange={handleEmployeeInputChange}
                          placeholder="Nhập mật khẩu"
                          required={!editMode.employee}
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label htmlFor="role">Vai Trò</Label>
                        <Select 
                          id="role" 
                          name="role" 
                          value={employeeFormData.role} 
                          onChange={handleEmployeeInputChange}
                          required
                        >
                          <option value="Employee">Nhân Viên</option>
                          {isAdmin && <option value="Manager">Quản Lý</option>}
                        </Select>
                      </FormGroup>
                      
                      <SubmitButton type="submit" disabled={loading}>
                        {loading ? (editMode.employee ? 'Đang Cập Nhật...' : 'Đang Thêm...') : (editMode.employee ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên')}
                      </SubmitButton>
                      
                      {editMode.employee && (
                        <SubmitButton 
                          type="button" 
                          onClick={() => handleCancelEdit('employee')}
                          style={{ 
                            backgroundColor: '#6c757d',
                            marginTop: '10px'
                          }}
                        >
                          Hủy Chỉnh Sửa
                        </SubmitButton>
                      )}
                    </Form>
                  </>
                )}
              </TabContent>
            )}
          </TabContainer>
        </DashboardContent>
      </DashboardContainer>
    </div>
  );
}

export default AdminDashboard;