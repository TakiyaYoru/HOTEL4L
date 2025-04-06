import React from 'react';
import { FaUtensils, FaSpa, FaSwimmingPool, FaDumbbell, FaGlassMartiniAlt, FaConciergeBell, FaWifi, FaCar } from 'react-icons/fa';
import '../styles/ServicesPage.css';

function ServicesPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dịch Vụ Của Chúng Tôi</h1>
          <p>Trải nghiệm sự sang trọng với các dịch vụ và tiện nghi cao cấp của chúng tôi</p>
        </div>
      </div>
      
      <section className="services-section">
        <div className="container">
          <div className="service-card">
            <div className="service-content">
              <div className="service-icon">
                <FaUtensils />
              </div>
              <h2 className="service-title">Nhà Hàng Cao Cấp</h2>
              <p className="service-description">
                Thưởng thức những trải nghiệm ẩm thực tinh tế tại nhà hàng cao cấp của chúng tôi. Đội ngũ đầu bếp tài năng của chúng tôi tạo ra những kiệt tác ẩm thực từ những nguyên liệu tươi ngon nhất, mang đến sự kết hợp giữa ẩm thực quốc tế và địa phương để làm hài lòng khẩu vị của bạn.
              </p>
              <ul className="service-features">
                <li>Bữa sáng, bữa trưa và bữa tối cao cấp</li>
                <li>Lựa chọn rượu vang và cocktail phong phú</li>
                <li>Các lựa chọn ăn uống riêng tư</li>
                <li>Đáp ứng các yêu cầu chế độ ăn đặc biệt</li>
              </ul>
            </div>
          </div>
          
          <div className="service-card service-card-reverse">
            <div className="service-image" style={{ backgroundImage: `url('/images/Service/spa.jpg')` }}></div>
            <div className="service-content">
              <div className="service-icon">
                <FaSpa />
              </div>
              <h2 className="service-title">Spa & Sức Khỏe Sang Trọng</h2>
              <p className="service-description">
                Tái tạo năng lượng cho cơ thể và tâm hồn tại trung tâm spa và sức khỏe sang trọng của chúng tôi. Các chuyên viên lành nghề của chúng tôi cung cấp nhiều liệu pháp được thiết kế để thư giãn, phục hồi và cải thiện sức khỏe của bạn trong suốt kỳ nghỉ.
              </p>
              <ul className="service-features">
                <li>Liệu pháp massage và chăm sóc cơ thể</li>
                <li>Chăm sóc da mặt và làm đẹp</li>
                <li>Liệu pháp hương thơm và kỹ thuật thư giãn</li>
                <li>Các gói spa dành cho cặp đôi</li>
              </ul>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-content">
              <div className="service-icon">
                <FaSwimmingPool />
              </div>
              <h2 className="service-title">Hồ Bơi & Khu vực Thư Giãn</h2>
              <p className="service-description">
                Thư giãn với một lần bơi sảng khoái trong hồ bơi sạch sẽ của chúng tôi hoặc nghỉ ngơi trên những chiếc ghế dài thoải mái trong không gian yên bình. Khu vực hồ bơi của chúng tôi được thiết kế để mang lại sự cân bằng hoàn hảo giữa thư giãn và giải trí.
              </p>
              <ul className="service-features">
                <li>Hồ bơi điều chỉnh nhiệt độ</li>
                <li>Quầy bar bên hồ bơi và đồ uống giải khát</li>
                <li>Ghế dài và lều nghỉ thoải mái</li>
                <li>Dịch vụ khăn tắm và nhân viên hỗ trợ</li>
              </ul>
            </div>
          </div>
          
          <div className="service-card service-card-reverse">
            <div className="service-image" style={{ backgroundImage: `url('/images/Service/fitness.jpg')` }}></div>
            <div className="service-content">
              <div className="service-icon">
                <FaDumbbell />
              </div>
              <h2 className="service-title">Trung Tâm Thể Dục</h2>
              <p className="service-description">
                Duy trì thói quen tập luyện của bạn tại trung tâm thể dục hiện đại của chúng tôi, được trang bị các máy móc và thiết bị tập luyện tiên tiến. Cơ sở của chúng tôi được thiết kế để phù hợp với mọi cấp độ và sở thích tập luyện.
              </p>
              <ul className="service-features">
                <li>Thiết bị tập cardio và sức mạnh mới nhất</li>
                <li>Các buổi huấn luyện cá nhân</li>
                <li>Lớp yoga và thể dục</li>
                <li>Mở cửa 24/7 để thuận tiện cho bạn</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <section className="additional-services">
        <div className="container text-center">
          <h2 className="section-title">Dịch Vụ Bổ Sung</h2>
          <p>Nâng cao trải nghiệm của bạn với các dịch vụ đa dạng của chúng tôi</p>
          
          <div className="services-grid">
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaGlassMartiniAlt />
              </div>
              <h3 className="small-service-title">Quầy Bar & Khu vực Thư Giãn</h3>
              <p>Thư giãn với đồ uống yêu thích của bạn tại khu vực quầy bar và thư giãn sang trọng của chúng tôi, với nhiều lựa chọn đồ uống cao cấp và cocktail.</p>
            </div>
            
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaConciergeBell />
              </div>
              <h3 className="small-service-title">Dịch Vụ Hỗ Trợ Khách Hàng</h3>
              <p>Đội ngũ hỗ trợ khách hàng tận tâm của chúng tôi sẵn sàng 24/7 để hỗ trợ đặt chỗ, gợi ý và đáp ứng mọi yêu cầu đặc biệt trong suốt kỳ nghỉ của bạn.</p>
            </div>
            
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaWifi />
              </div>
              <h3 className="small-service-title">Wi-Fi Miễn Phí</h3>
              <p>Kết nối liên tục với truy cập internet tốc độ cao có sẵn khắp khách sạn, đảm bảo kết nối liền mạch cho công việc hoặc giải trí.</p>
            </div>
            
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaCar />
              </div>
              <h3 className="small-service-title">Dịch Vụ Đưa Đón Sân Bay</h3>
              <p>Thưởng thức dịch vụ đưa đón sân bay cao cấp, tiện lợi và thoải mái giữa sân bay và khách sạn của chúng tôi.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServicesPage;