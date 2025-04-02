import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaConciergeBell, FaSpa, FaUtensils, FaSwimmingPool } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchRooms, fetchRoomTypes } from '../services/api'; 
import '../styles/HomePage.css';

function HomePage() {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleBookNow = () => {
    // In a real app, this would navigate to the booking page with the selected dates and guests
    console.log('Booking with:', { checkInDate, checkOutDate, guests });
  };
  
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Experience Luxury Like Never Before</h1>
          <p className="hero-subtitle">
            Indulge in the perfect blend of comfort, elegance, and exceptional service at our luxury hotel.
          </p>
          <Link to="/rooms" className="btn">
            Explore Our Rooms
          </Link>
          
          <div className="booking-bar">
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
                minDate={checkInDate}
                className="date-picker"
              />
            </div>
            
            <div className="booking-field">
              <label>
                <FaUsers style={{ marginRight: '5px' }} />
                Guests
              </label>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>
            
            <button className="booking-button" onClick={handleBookNow}>
              Check Availability
            </button>
          </div>
        </div>
      </section>
      
      <section className="featured-rooms">
        <div className="container text-center">
          <h2 className="section-title">Our Featured Rooms</h2>
          <p>Experience the perfect blend of comfort and luxury in our carefully designed rooms.</p>
          
          {loading ? (
            <div className="loading-container">
              <h3>Loading...</h3>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.slice(0, 3).map(room => (
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
          )}
          
          <div style={{ marginTop: '40px' }}>
            <Link to="/rooms" className="btn">
              View All Rooms
            </Link>
          </div>
        </div>
      </section>
      
      <section className="services">
        <div className="container text-center">
          <h2 className="section-title">Our Services</h2>
          <p>We offer a wide range of services to make your stay comfortable and memorable.</p>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <FaConciergeBell />
              </div>
              <h3 className="service-title">24/7 Room Service</h3>
              <p>Our dedicated staff is available around the clock to cater to your needs and ensure a comfortable stay.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaSpa />
              </div>
              <h3 className="service-title">Spa & Wellness</h3>
              <p>Rejuvenate your body and mind with our premium spa treatments and wellness facilities.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaUtensils />
              </div>
              <h3 className="service-title">Fine Dining</h3>
              <p>Indulge in exquisite culinary experiences at our restaurants offering a variety of cuisines.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaSwimmingPool />
              </div>
              <h3 className="service-title">Swimming Pool</h3>
              <p>Take a refreshing dip in our swimming pool or relax by the poolside with your favorite drink.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaUsers />
              </div>
              <h3 className="service-title">Event Spaces</h3>
              <p>Host your special events, meetings, and conferences in our elegant and well-equipped spaces.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaCalendarAlt />
              </div>
              <h3 className="service-title">Tour Arrangements</h3>
              <p>Explore the city and its attractions with our customized tour packages and expert guides.</p>
            </div>
          </div>
          
          <div style={{ marginTop: '40px' }}>
            <Link to="/services" className="btn">
              Explore All Services
            </Link>
          </div>
        </div>
      </section>
      
      <section className="testimonials">
        <div className="container text-center">
          <h2 className="section-title">What Our Guests Say</h2>
          <p>Read testimonials from our satisfied guests who have experienced our hospitality.</p>
          
          <div style={{ marginTop: '50px' }}>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "An absolutely amazing experience! The staff was incredibly attentive, the room was luxurious, and the amenities were top-notch. I can't wait to come back for another stay."
              </p>
              <div className="testimonial-author">
                <div className="author-image" style={{ backgroundColor: '#ddd' }}></div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Business Traveler</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p className="testimonial-text">
                "We celebrated our anniversary at this hotel and it was perfect in every way. The romantic dinner arrangement, the spa treatment, and the beautiful room with a view made it unforgettable."
              </p>
              <div className="testimonial-author">
                <div className="author-image" style={{ backgroundColor: '#ddd' }}></div>
                <div className="author-info">
                  <h4>Michael & Emily Davis</h4>
                  <p>Couple</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p className="testimonial-text">
                "As someone who travels frequently for work, I've stayed in many hotels, but this one stands out for its exceptional service and attention to detail. It's now my go-to whenever I'm in town."
              </p>
              <div className="testimonial-author">
                <div className="author-image" style={{ backgroundColor: '#ddd' }}></div>
                <div className="author-info">
                  <h4>Robert Chen</h4>
                  <p>Frequent Traveler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;