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
        
        console.log('Dữ liệu phòng từ API:', roomsData);
        console.log('Dữ liệu loại phòng từ API:', roomTypesData);
        
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
          
          // Dịch tên loại phòng sang tiếng Việt
          const roomName = roomType.typeName.replace('_', ' ');
          const translatedRoomName = roomName === 'Standard Room' ? 'Phòng Tiêu Chuẩn' :
                                    roomName === 'Deluxe Room' ? 'Phòng Cao Cấp' :
                                    roomName === 'Family Room' ? 'Phòng Gia Đình' :
                                    roomName === 'Suite Room' ? 'Phòng Suite' :
                                    roomName === 'Executive Suite' ? 'Căn Hộ Hạng Sang' :
                                    roomName === 'Presidential Suite' ? 'Căn Hộ Tổng Thống' : roomName;
          
          // Tạo đối tượng phòng với cấu trúc phù hợp cho frontend
          return {
            id: room.roomID,
            name: translatedRoomName,
            type: translatedRoomName,
            price: roomType.price,
            capacity: roomType.maxGuests,
            size: roomType.area,
            status: room.roomStatus,
            roomTypeId: roomType.rTypeID,
            bed: roomType.rTypeID === 'TWN' ? 'Hai Giường Đơn' : 'Giường King',
            images: [imagePath1, imagePath2],
            description: `Trải nghiệm sự sang trọng và thoải mái tại ${translatedRoomName} của chúng tôi. Căn phòng rộng ${roomType.area} m² này có thể chứa tối đa ${roomType.maxGuests} khách.`
          };
        });
        
        setRooms(processedRooms);
        setFilteredRooms(processedRooms);
        setRoomTypes(roomTypesData);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleBookNow = () => {
    // Trong ứng dụng thực tế, điều này sẽ chuyển hướng đến trang đặt phòng với ngày và số khách đã chọn
    console.log('Đặt phòng với:', { checkInDate, checkOutDate, guests });
  };
  
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Trải Nghiệm Sự Sang Trọng Chưa Từng Có</h1>
          <p className="hero-subtitle">
            Đến với sự kết hợp hoàn hảo giữa sự thoải mái, thanh lịch và dịch vụ xuất sắc tại khách sạn sang trọng của chúng tôi.
          </p>
          <Link to="/rooms" className="btn">
            Khám Phá Phòng Của Chúng Tôi
          </Link>
          
          <div className="booking-bar">
            <div className="booking-field">
              <label>
                <FaCalendarAlt style={{ marginRight: '5px' }} />
                Nhận Phòng
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
                Trả Phòng
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
                Số Khách
              </label>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Khách' : 'Khách'}
                  </option>
                ))}
              </select>
            </div>
            
            <button className="booking-button" onClick={handleBookNow}>
              Kiểm Tra Tình Trạng Phòng
            </button>
          </div>
        </div>
      </section>
      
      <section className="featured-rooms">
        <div className="container text-center">
          <h2 className="section-title">Phòng Nổi Bật Của Chúng Tôi</h2>
          <p>Trải nghiệm sự kết hợp hoàn hảo giữa sự thoải mái và sang trọng trong những căn phòng được thiết kế tỉ mỉ của chúng tôi.</p>
          
          {loading ? (
            <div className="loading-container">
              <h3>Đang Tải...</h3>
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Lỗi</h3>
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
                      console.error(`Lỗi khi tải hình ảnh: ${e.target.src}`);
                      e.target.src = 'Images/Rooms/standard-room-1.jpg'; // Hình ảnh dự phòng
                    }}
                  />
                  <div className="room-info">
                    <h3 className="room-name">{room.name}</h3>
                    <div className="room-price">
                      {room.price}đ <span>/ đêm</span>
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
          )}
          
          <div style={{ marginTop: '40px' }}>
            <Link to="/rooms" className="btn">
              Xem Tất Cả Phòng
            </Link>
          </div>
        </div>
      </section>
      
      <section className="services">
        <div className="container text-center">
          <h2 className="section-title">Dịch Vụ Của Chúng Tôi</h2>
          <p>Chúng tôi cung cấp nhiều loại dịch vụ để đảm bảo kỳ nghỉ của bạn thoải mái và đáng nhớ.</p>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <FaConciergeBell />
              </div>
              <h3 className="service-title">Dịch Vụ Phòng 24/7</h3>
              <p>Đội ngũ nhân viên tận tâm của chúng tôi sẵn sàng phục vụ bạn suốt ngày đêm để đảm bảo kỳ nghỉ thoải mái.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaSpa />
              </div>
              <h3 className="service-title">Spa & Chăm Sóc Sức Khỏe</h3>
              <p>Tái tạo năng lượng cho cơ thể và tâm hồn với các liệu pháp spa cao cấp và cơ sở vật chất chăm sóc sức khỏe của chúng tôi.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaUtensils />
              </div>
              <h3 className="service-title">Ẩm Thực Tinh Tế</h3>
              <p>Thưởng thức những trải nghiệm ẩm thực tuyệt vời tại các nhà hàng của chúng tôi với đa dạng phong cách ẩm thực.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaSwimmingPool />
              </div>
              <h3 className="service-title">Hồ Bơi</h3>
              <p>Tận hưởng cảm giác sảng khoái khi bơi trong hồ bơi của chúng tôi hoặc thư giãn bên hồ bơi với ly đồ uống yêu thích.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaUsers />
              </div>
              <h3 className="service-title">Không Gian Sự Kiện</h3>
              <p>Tổ chức các sự kiện đặc biệt, cuộc họp và hội nghị tại không gian thanh lịch và được trang bị đầy đủ của chúng tôi.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaCalendarAlt />
              </div>
              <h3 className="service-title">Tổ Chức Tour Du Lịch</h3>
              <p>Khám phá thành phố và các điểm tham quan với các gói tour tùy chỉnh và hướng dẫn viên chuyên nghiệp của chúng tôi.</p>
            </div>
          </div>
          
          <div style={{ marginTop: '40px' }}>
            <Link to="/services" className="btn">
              Khám Phá Tất Cả Dịch Vụ
            </Link>
          </div>
        </div>
      </section>
      
      <section className="testimonials">
        <div className="container text-center">
          <h2 className="section-title">Cảm Nhận Của Khách Hàng</h2>
          <p>Đọc những cảm nhận từ các khách hàng hài lòng đã trải nghiệm dịch vụ của chúng tôi.</p>
          
          <div style={{ marginTop: '50px' }}>
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Một trải nghiệm tuyệt vời! Nhân viên vô cùng chu đáo, phòng ốc sang trọng và tiện nghi hàng đầu. Tôi rất mong chờ được quay lại lần nữa."
              </p>
              <div className="testimonial-author">
                <div className="author-image" style={{ backgroundColor: '#ddd' }}></div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Khách Hàng Doanh Nhân</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Chúng tôi đã kỷ niệm ngày cưới tại khách sạn này và mọi thứ đều hoàn hảo. Bữa tối lãng mạn, liệu pháp spa và căn phòng với tầm nhìn tuyệt đẹp đã khiến kỳ nghỉ trở nên khó quên."
              </p>
              <div className="testimonial-author">
                <div className="author-image" style={{ backgroundColor: '#ddd' }}></div>
                <div className="author-info">
                  <h4>Michael & Emily Davis</h4>
                  <p>Cặp Đôi</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Là người thường xuyên đi công tác, tôi đã ở nhiều khách sạn, nhưng nơi này nổi bật với dịch vụ xuất sắc và sự chú trọng đến từng chi tiết. Đây giờ là lựa chọn hàng đầu của tôi mỗi khi đến thành phố."
              </p>
              <div className="testimonial-author">
                <div className="author-image" style={{ backgroundColor: '#ddd' }}></div>
                <div className="author-info">
                  <h4>Robert Chen</h4>
                  <p>Khách Hàng Thường Xuyên</p>
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