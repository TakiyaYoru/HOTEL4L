import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaSearch } from 'react-icons/fa';
import { services } from '../services';
import { ROOM_TYPES, ROOM_STATUS } from '../services/constants';
import '../styles/RoomsPage.css';

function RoomsPage() {
  const [filters, setFilters] = useState({
    type: '',
    capacity: '',
    priceRange: '',
  });
  
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [favoriteRooms, setFavoriteRooms] = useState(JSON.parse(localStorage.getItem('favoriteRooms')) || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch rooms và room types từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsData, roomTypesData] = await Promise.all([
          services.api.room.fetchRooms(),
          services.api.room.fetchRoomTypes()
        ]);
        
        console.log('API Rooms Data:', roomsData);
        console.log('API Room Types Data:', roomTypesData);
        
        // Xử lý dữ liệu phòng từ API
        const processedRooms = roomsData
          .filter(room => room.roomStatus === ROOM_STATUS.AVAILABLE) // Chỉ lấy phòng có status 'Available'
          .map(room => {
            const roomType = room.roomType;
            
            // Xác định ảnh dựa trên loại phòng
            let imagePath1, imagePath2;
            switch(roomType.rTypeID) {
              case ROOM_TYPES.SINGLE:
                imagePath1 = 'Images/Rooms/standard-room-1.jpg';
                imagePath2 = 'Images/Rooms/standard-room-2.jpg';
                break;
              case ROOM_TYPES.DOUBLE:
                imagePath1 = 'Images/Rooms/deluxe-room-1.jpg';
                imagePath2 = 'Images/Rooms/deluxe-room-2.jpg';
                break;
              case ROOM_TYPES.TWIN:
                imagePath1 = 'Images/Rooms/family-room-1.jpg';
                imagePath2 = 'Images/Rooms/family-room-2.jpg';
                break;
              case ROOM_TYPES.KING:
                imagePath1 = 'Images/Rooms/executive-suite-1.jpg';
                imagePath2 = 'Images/Rooms/executive-suite-2.jpg';
                break;
              case ROOM_TYPES.FAMILY:
                imagePath1 = 'Images/Rooms/penthouse-suite-1.jpg';
                imagePath2 = 'Images/Rooms/penthouse-suite-2.jpg';
                break;
              default:
                imagePath1 = 'Images/Rooms/standard-room-1.jpg';
                imagePath2 = 'Images/Rooms/standard-room-2.jpg';
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
              bed: roomType.rTypeID === ROOM_TYPES.TWIN ? 'Hai Giường Đơn' : 'Giường King',
              images: [imagePath1, imagePath2],
              description: `Trải nghiệm sự sang trọng và thoải mái tại ${roomType.typeName.replace('_', ' ')} của chúng tôi. Căn phòng rộng ${roomType.area} mét vuông này có thể chứa tối đa ${roomType.maxGuests} khách.`
            };
          });
        
        setRooms(processedRooms);
        setFilteredRooms(processedRooms);
        setRoomTypes(roomTypesData);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError(services.utils.api.handleApiError(err));
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    setFavoriteRooms(JSON.parse(localStorage.getItem('favoriteRooms')) || []);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    
    let results = [...rooms]; // rooms đã được lọc chỉ chứa phòng 'Available'
    
    if (filters.type && filters.type !== "Tất Cả Loại Phòng") {
      results = results.filter(room => room.type.toLowerCase() === filters.type.toLowerCase());
    }
    
    if (filters.capacity) {
      const capacity = parseInt(filters.capacity);
      results = results.filter(room => room.capacity >= capacity);
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      results = results.filter(room => room.price >= min && (max ? room.price <= max : true));
    }
    
    setFilteredRooms(results); 
  };  

  const handleFavoriteToggle = (room) => {
    let updatedFavorites = [...favoriteRooms];

    if (updatedFavorites.some(favRoom => favRoom.id === room.id)) {
      updatedFavorites = updatedFavorites.filter(favRoom => favRoom.id !== room.id);
    } else {
      updatedFavorites.push(room);
    }

    localStorage.setItem('favoriteRooms', JSON.stringify(updatedFavorites));
    setFavoriteRooms(updatedFavorites);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Phòng & Căn Hộ Của Chúng Tôi</h1>
          <p>Khám phá nơi lưu trú hoàn hảo cho kỳ nghỉ của bạn</p>
        </div>
      </div>
      
      <div className="container">
        <div className="filter-section">
          <form className="filter-form" onSubmit={handleFilterSubmit}>
            <div className="filter-field">
              <label>Loại Phòng</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">Tất Cả Loại Phòng</option>
                {roomTypes.length > 0 ? (
                  roomTypes.map(type => (
                    <option key={type.rTypeID} value={type.typeName.replace('_', ' ')}>
                      {type.typeName.replace('_', ' ') === 'Single Room' ? 'Phòng Đơn' :
                       type.typeName.replace('_', ' ') === 'Double Room' ? 'Phòng Đôi' :
                       type.typeName.replace('_', ' ') === 'Twin Room' ? 'Phòng Hai Giường' :
                       type.typeName.replace('_', ' ') === 'King Room' ? 'Phòng King' :
                       type.typeName.replace('_', ' ') === 'Family Room' ? 'Phòng Gia Đình' :
                       type.typeName.replace('_', ' ')}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Single Room">Phòng Đơn</option>
                    <option value="Double Room">Phòng Đôi</option>
                    <option value="Twin Room">Phòng Hai Giường</option>
                    <option value="King Room">Phòng King</option>
                    <option value="Family Room">Phòng Gia Đình</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="filter-field">
              <label>Số Khách</label>
              <select name="capacity" value={filters.capacity} onChange={handleFilterChange}>
                <option value="">Bất Kỳ</option>
                <option value="1">1 Khách</option>
                <option value="2">2 Khách</option>
                <option value="3">3 Khách</option>
                <option value="4">4+ Khách</option>
              </select>
            </div>
            
            <div className="filter-field">
              <label>Khoảng Giá</label>
              <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
                <option value="">Bất Kỳ Giá Nào</option>
                <option value="100-200">100$ - 200$</option>
                <option value="200-300">200$ - 300$</option>
                <option value="300-500">300$ - 500$</option>
                <option value="500-1000">500$+</option>
              </select>
            </div>
            
            <button className="filter-button" type="submit">
              <FaSearch />
              Lọc Phòng
            </button>
          </form>
        </div>
        
        <section className="rooms-section">
          {loading ? (
            <div className="loading-container">
              <h3>Đang tải danh sách phòng...</h3>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Lỗi</h3>
              <p>{error}</p>
              <button 
                className="btn" 
                onClick={() => window.location.reload()}
              >
                Thử Lại
              </button>
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="rooms-grid">
              {filteredRooms.map(room => (
                <div className="room-card" key={room.id}>
                  <img 
                    src={room.images[0]} 
                    alt={room.name} 
                    className="related-room-image" 
                    onError={(e) => {
                      console.error(`Lỗi khi tải hình ảnh: ${e.target.src}`);
                      e.target.src = 'Images/Rooms/standard-room-1.jpg'; // Hình ảnh dự phòng
                    }}
                  />
                  <div className="room-info">
                    <h3 className="room-name">
                      {room.name === 'Single Room' ? 'Phòng Đơn' :
                       room.name === 'Double Room' ? 'Phòng Đôi' :
                       room.name === 'Twin Room' ? 'Phòng Hai Giường' :
                       room.name === 'King Room' ? 'Phòng King' :
                       room.name === 'Family Room' ? 'Phòng Gia Đình' :
                       room.name}
                    </h3>
                    <div className="room-id">
                      Mã Phòng: {room.id}
                    </div>
                    <div className="room-price">
                      {services.utils.format.formatCurrency(room.price)}<span>/đêm</span>
                    </div>
                    <div className="room-features">
                      <div>{room.size} m²</div>
                      <div>{room.capacity} {room.capacity === 1 ? 'Khách' : 'Khách'}</div>
                      <div>{room.bed}</div>
                    </div>
                    <Link to={`/rooms/${room.id}`} className="btn-outline">
                      Xem Chi Tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>Không Tìm Thấy Phòng Trống</h3>
              <p>Hãy thử điều chỉnh bộ lọc để tìm phòng phù hợp.</p>
              <button 
                className="btn" 
                onClick={() => {
                  setFilters({ type: '', capacity: '', priceRange: '' });
                  setFilteredRooms(rooms);
                }}
              >
                Đặt Lại Bộ Lọc
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default RoomsPage;