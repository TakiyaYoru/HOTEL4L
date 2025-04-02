import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaSearch, FaHeart, FaHeartBroken } from 'react-icons/fa';
import '../styles/RoomsPage.css';
import { fetchRooms, fetchRoomTypes } from '../services/api';

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
          fetchRooms(),
          fetchRoomTypes()
        ]);
        
        console.log('API Rooms Data:', roomsData);
        console.log('API Room Types Data:', roomTypesData);
        
        // Xử lý dữ liệu phòng từ API
        const processedRooms = roomsData.map(room => {
          // Lấy loại phòng từ roomType đã được nested trong API response
          const roomType = room.roomType;
          
          // Xác định ảnh dựa trên loại phòng
          let imagePath1, imagePath2;
          switch(roomType.rTypeID) {
            case 'SGL':
              imagePath1 = 'Images/Rooms/standard-room-1.jpg';
              imagePath2 = 'Images/Rooms/standard-room-2.jpg';
              break;
            case 'DBL':
              imagePath1 = 'Images/Rooms/deluxe-room-1.jpg';
              imagePath2 = 'Images/Rooms/deluxe-room-2.jpg';
              break;
            case 'TWN':
              imagePath1 = 'Images/Rooms/family-room-1.jpg';
              imagePath2 = 'Images/Rooms/family-room-2.jpg';
              break;
            case 'KIN':
              imagePath1 = 'Images/Rooms/executive-suite-1.jpg';
              imagePath2 = 'Images/Rooms/executive-suite-2.jpg';
              break;
            case 'FAM':
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
            bed: roomType.rTypeID === 'TWN' ? 'Twin Beds' : 'King Bed',
            images: [imagePath1, imagePath2],
            description: `Experience luxury and comfort in our ${roomType.typeName.replace('_', ' ')}. This spacious ${roomType.area} sqft room can accommodate up to ${roomType.maxGuests} guests.`
          };
        });
        
        setRooms(processedRooms);
        setFilteredRooms(processedRooms);
        setRoomTypes(roomTypesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load rooms. Please try again later.');
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
    
    let results = [...rooms]; 
    
    if (filters.type && filters.type !== "All Types") {
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
      // Nếu phòng đã yêu thích, xóa nó khỏi danh sách
      updatedFavorites = updatedFavorites.filter(favRoom => favRoom.id !== room.id);
    } else {
      // Nếu phòng chưa yêu thích, thêm nó vào danh sách
      updatedFavorites.push(room);
    }

    // Cập nhật localStorage
    localStorage.setItem('favoriteRooms', JSON.stringify(updatedFavorites));
    setFavoriteRooms(updatedFavorites);
  };
  
  // Lấy danh sách các loại phòng từ API để hiển thị trong bộ lọc
  const getRoomTypeOptions = () => {
    if (roomTypes.length === 0) return null;
    
    return roomTypes.map(type => (
      <option key={type.id} value={type.name}>
        {type.name}
      </option>
    ));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Our Rooms & Suites</h1>
          <p>Discover the perfect accommodation for your stay</p>
        </div>
      </div>
      
      <div className="container">
        <div className="filter-section">
          <form className="filter-form" onSubmit={handleFilterSubmit}>
            <div className="filter-field">
              <label>Room Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                {roomTypes.length > 0 ? (
                  roomTypes.map(type => (
                    <option key={type.rTypeID} value={type.typeName.replace('_', ' ')}>
                      {type.typeName.replace('_', ' ')}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Single Room">Single Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Twin Room">Twin Room</option>
                    <option value="King Room">King Room</option>
                    <option value="Family Room">Family Room</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="filter-field">
              <label>Guests</label>
              <select name="capacity" value={filters.capacity} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            
            <div className="filter-field">
              <label>Price Range</label>
              <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
                <option value="">Any Price</option>
                <option value="100-200">$100 - $200</option>
                <option value="200-300">$200 - $300</option>
                <option value="300-500">$300 - $500</option>
                <option value="500-1000">$500+</option>
              </select>
            </div>
            
            <button className="filter-button" type="submit">
              <FaSearch />
              Filter Rooms
            </button>
          </form>
        </div>
        
        <section className="rooms-section">
        {loading ? (
          <div className="loading-container">
            <h3>Loading rooms...</h3>
          </div>
        ) : error ? (
          <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button 
              className="btn" 
              onClick={() => window.location.reload()}
            >
              Try Again
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
                    console.error(`Error loading image: ${e.target.src}`);
                    e.target.src = 'Images/Rooms/standard-room-1.jpg'; // Fallback image
                  }}
                />
                <div className="room-info">
                  <h3 className="room-name">{room.name}</h3>
                  <div className="room-price">
                    ${room.price}<span>/ night</span>
                  </div>
                  <div className="room-features">
                    <div>{room.size} sqft</div>
                    <div>{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</div>
                    <div>{room.bed}</div>
                  </div>
                  
                  <Link to={`/rooms/${room.id}`} className="btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No Rooms Found</h3>
            <p>Try adjusting your filters to find available rooms.</p>
            <button 
              className="btn" 
              onClick={() => {
                setFilters({ type: '', capacity: '', priceRange: '' });
                setFilteredRooms(rooms);
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
      </div>
    </>
  );
}

export default RoomsPage;
