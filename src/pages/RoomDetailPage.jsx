import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaBed, FaWifi, FaTv, FaSnowflake, FaUtensils, FaCheck, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../contexts/AuthContext';
import { services } from '../services';
import { ROOM_TYPES, ROOM_STATUS } from '../services/constants';
import '../styles/RoomDetailPage.css';

function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, openLoginModal } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [guests, setGuests] = useState(1);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomServices, setRoomServices] = useState([]);
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        
        // Fetch all rooms and room types
        const [allRoomsData, roomTypesData] = await Promise.all([
          services.api.room.fetchRooms(),
          services.api.room.fetchRoomTypes()
        ]);
        
        console.log('API Rooms Data:', allRoomsData);
        console.log('API Room Types Data:', roomTypesData);
        
        // Tìm phòng theo ID
        const roomData = allRoomsData.find(room => room.roomID === id);
        
        if (!roomData) {
          setError('Room not found');
          setLoading(false);
          return;
        }
        
        // Xử lý dữ liệu phòng từ API
        const processRoomData = (room) => {
          // Lấy loại phòng từ roomType đã được nested trong API response
          const roomType = room.roomType;
          
          // Xác định ảnh dựa trên loại phòng
          let imagePath1, imagePath2;
          switch(roomType.rTypeID) {
            case ROOM_TYPES.SINGLE:
              imagePath1 = '/images/Rooms/standard-room-1.jpg';
              imagePath2 = '/images/Rooms/standard-room-2.jpg';
              break;
            case ROOM_TYPES.DOUBLE:
              imagePath1 = '/images/Rooms/deluxe-room-1.jpg';
              imagePath2 = '/images/Rooms/deluxe-room-2.jpg';
              break;
            case ROOM_TYPES.TWIN:
              imagePath1 = '/images/Rooms/family-room-1.jpg';
              imagePath2 = '/images/Rooms/family-room-2.jpg';
              break;
            case ROOM_TYPES.KING:
              imagePath1 = '/images/Rooms/executive-suite-1.jpg';
              imagePath2 = '/images/Rooms/executive-suite-2.jpg';
              break;
            case ROOM_TYPES.FAMILY:
              imagePath1 = '/images/Rooms/penthouse-suite-1.jpg';
              imagePath2 = '/images/Rooms/penthouse-suite-2.jpg';
              break;
            default:
              imagePath1 = '/images/Rooms/standard-room-1.jpg';
              imagePath2 = '/images/Rooms/standard-room-2.jpg';
          }
          
          // Tạo đối tượng phòng với cấu trúc phù hợp cho frontend
          return {
            id: room.roomID,
            name: roomType.typeName.replace('_', ' '),
            type: roomType.typeName.replace('_', ' '),
            price: roomType.price,
            capacity: roomType.maxGuests,
            size: roomType.area,
            status: room.roomStatus,
            roomTypeId: roomType.rTypeID,
            bed: roomType.rTypeID === ROOM_TYPES.TWIN ? 'Twin Beds' : 'King Bed',
            view: roomType.rTypeID === ROOM_TYPES.KING || roomType.rTypeID === ROOM_TYPES.FAMILY ? 'Ocean View' : 'City View',
            images: [imagePath1, imagePath2],
            description: `Experience luxury and comfort in our ${roomType.typeName.replace('_', ' ')}. This spacious ${roomType.area} sqft room can accommodate up to ${roomType.maxGuests} guests.`
          };
        };
        
        // Xử lý phòng hiện tại
        const processedRoom = processRoomData(roomData);
        setRoom(processedRoom);
        setGuests(processedRoom.capacity || 1);
        setRoomTypes(roomTypesData);
        
        // Xử lý tất cả các phòng
        const processedRooms = allRoomsData.map(processRoomData);
        
        // Tìm các phòng liên quan
        const related = processedRooms
          .filter(r => r.id !== id && (r.roomTypeId === processedRoom.roomTypeId || Math.abs(r.price - processedRoom.price) < 50))
          .slice(0, 3);
          
        setRelatedRooms(related);
        
        // Lấy dịch vụ và tiện nghi của phòng
        try {
          const roomTypeId = roomData.roomType.rTypeID;
          
          // Lấy dịch vụ theo loại phòng
          const servicesList = await services.api.service.fetchServicesByRoomType(roomTypeId);
          console.log(`Services for room type ${roomTypeId}:`, servicesList);
          setRoomServices(servicesList || []);
          
          // Lấy tiện nghi theo loại phòng
          const amenities = await services.api.service.fetchAmenitiesByRoomType(roomTypeId);
          console.log(`Amenities for room type ${roomTypeId}:`, amenities);
          setRoomAmenities(amenities || []);
        } catch (err) {
          console.error('Error fetching room services and amenities:', err);
          // Không set error để tránh ảnh hưởng đến việc hiển thị phòng
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(services.utils.api.handleApiError(err));
        setLoading(false);
      }
    };
    
    fetchRoomData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>Loading room details...</h3>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="error-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn" 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              background: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="container">
        <div className="not-found-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>Room Not Found</h3>
          <p>The room you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/rooms" 
            style={{ 
              display: 'inline-block',
              padding: '10px 20px', 
              background: 'var(--primary-color)', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '4px', 
              marginTop: '20px'
            }}
          >
            Browse All Rooms
          </Link>
        </div>
      </div>
    );
  }
  
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const roomTotal = room.price * nights;
  const tax = roomTotal * 0.1;
  const total = roomTotal + tax;
  
  const handleBookNow = async (e) => {
    e.preventDefault();
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!currentUser) {
      // Nếu chưa đăng nhập, hiển thị modal đăng nhập
      openLoginModal('/booking');
      return;
    }

    // Kiểm tra tính khả dụng của phòng
    try {
      const availability = await services.api.room.checkRoomAvailability(
        room.id,
        services.utils.format.formatDateForApi(checkInDate),
        services.utils.format.formatDateForApi(checkOutDate)
      );

      if (!availability.isAvailable) {
        setError('Room is not available for the selected dates');
        return;
      }
    } catch (err) {
      console.error('Error checking room availability:', err);
      setError(services.utils.api.handleApiError(err));
      return;
    }
    
    // Nếu đã đăng nhập và phòng khả dụng, tiếp tục quá trình đặt phòng
    const bookingData = {
      roomId: room.id,
      roomName: room.name,
      checkInDate: services.utils.format.formatDateForApi(checkInDate),
      checkOutDate: services.utils.format.formatDateForApi(checkOutDate),
      guests,
      nights,
      price: room.price,
      roomImage: room.images[0], 
      total
    };

    localStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Navigate to the booking page with the booking data
    navigate('/booking', {
      state: bookingData
    });
  };
  
  return (
    <div className="container">
      <div className="room-detail-container">
        <div className="room-header">
          <div className="room-title">
            <h1>{room.name}</h1>
            <p>{room.type} Room</p>
            <p className="room-id">Room ID: {room.id}</p>
          </div>
          <div className="room-price">
            ${services.utils.format.formatCurrency(room.price)} <span>/ night</span>
          </div>
        </div>
        
        <div className="room-gallery">
          <div className="main-image" style={{ backgroundImage: `url(${room.images[0]})` }} />
          {room.images.slice(1, 3).map((image, index) => (
            <div key={index} className="small-image" style={{ backgroundImage: `url(${image})` }} />
          ))}
        </div>
        
        <div className="room-content">
          <div className="room-description">
            <h2>Room Description</h2>
            <p>{room.description}</p>
            
            <div className="room-features-container">
              <div className="room-features">
                <h3>Room Features</h3>
                <div className="features-list">
                  <div>
                    <FaUsers />
                    <span>{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                  <div>
                    <FaBed />
                    <span>{room.bed}</span>
                  </div>
                  <div>
                    <FaCheck />
                    <span>{room.size} sqft</span>
                  </div>
                  <div>
                    <FaCheck />
                    <span>{room.view} View</span>
                  </div>
                  
                  {/* Hiển thị các dịch vụ từ API */}
                  {roomServices && roomServices.length > 0 ? (
                    roomServices.map((service, index) => (
                      <div key={index}>
                        <FaCheck />
                        <span>{service.serviceName}</span>
                      </div>
                    ))
                  ) : (
                    <div>
                      <FaCheck />
                      <span>No additional services</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="room-amenities">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {/* Hiển thị các tiện nghi từ API */}
                {roomAmenities && roomAmenities.length > 0 ? (
                  roomAmenities.map((amenity, index) => (
                    <div key={index}>
                      <FaCheck />
                      <span>{amenity.amenityName}</span>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Hiển thị các tiện nghi mặc định nếu không có dữ liệu từ API */}
                    <div>
                      <FaWifi />
                      <span>Free WiFi</span>
                    </div>
                    <div>
                      <FaTv />
                      <span>Flat-screen TV</span>
                    </div>
                    <div>
                      <FaSnowflake />
                      <span>Air Conditioning</span>
                    </div>
                    <div>
                      <FaUtensils />
                      <span>Mini Bar</span>
                    </div>
                    <div>
                      <FaCheck />
                      <span>Room Service</span>
                    </div>
                    <div>
                      <FaCheck />
                      <span>Safe</span>
                    </div>
                    <div>
                      <FaCheck />
                      <span>Coffee Maker</span>
                    </div>
                    <div>
                      <FaCheck />
                      <span>Hairdryer</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="booking-card">
            <h3 className="booking-title">Book This Room</h3>
            <form className="booking-form" onSubmit={handleBookNow}>
              <div className="booking-field">
                <label>
                  <FaCalendarAlt style={{ marginRight: '5px' }} />
                  Check In
                </label>
                <DatePicker
                  selected={checkInDate}
                  onChange={date => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  className="date-picker"
                  dateFormat={services.constants.DATE_FORMATS.DISPLAY}
                />
              </div>
              
              <div className="booking-field">
                <label>
                  <FaCalendarAlt style={{ marginRight: '5px' }} />
                  Check Out
                </label>
                <DatePicker
                  selected={checkOutDate}
                  onChange={date => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date(checkInDate.getTime() + 86400000)}
                  className="date-picker"
                  dateFormat={services.constants.DATE_FORMATS.DISPLAY}
                />
              </div>
              
              <div className="booking-field">
                <label>
                  <FaUsers style={{ marginRight: '5px' }} />
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="booking-total">
                <div>
                  <span>${services.utils.format.formatCurrency(room.price)} x {nights} nights</span>
                  <span>${services.utils.format.formatCurrency(roomTotal)}</span>
                </div>
                <div>
                  <span>Tax (10%)</span>
                  <span>${services.utils.format.formatCurrency(tax)}</span>
                </div>
                <div className="total">
                  <span>Total</span>
                  <span>${services.utils.format.formatCurrency(total)}</span>
                </div>
              </div>
              
              <button className="booking-button" type="submit">
                Book Now
              </button>
            </form>
          </div>
        </div>
        
        <section className="related-rooms">
          <h3>You May Also Like</h3>
          <div className="related-rooms-grid">
            {relatedRooms.map(relatedRoom => (
              <div className="related-room-card" key={relatedRoom.id}>
                <img src={relatedRoom.images[0]} alt={relatedRoom.name} className="related-room-image" />
                <div className="related-room-info">
                  <h4>{relatedRoom.name}</h4>
                  <div className="price">
                    ${services.utils.format.formatCurrency(relatedRoom.price)}<span>/ night</span>
                  </div>
                  <Link to={`/rooms/${relatedRoom.id}`} className="btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RoomDetailPage;
