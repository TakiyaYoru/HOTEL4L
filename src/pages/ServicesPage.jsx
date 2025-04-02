import React from 'react';
import { FaUtensils, FaSpa, FaSwimmingPool, FaDumbbell, FaGlassMartiniAlt, FaConciergeBell, FaWifi, FaCar } from 'react-icons/fa';
import '../styles/ServicesPage.css';

function ServicesPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Our Services</h1>
          <p>Experience luxury with our premium services and amenities</p>
        </div>
      </div>
      
      <section className="services-section">
        <div className="container">
          <div className="service-card">
            <div className="service-image" style={{ backgroundImage: `url('/images/Service/restaurant.jpg')` }}></div>
            <div className="service-content">
              <div className="service-icon">
                <FaUtensils />
              </div>
              <h2 className="service-title">Fine Dining Restaurant</h2>
              <p className="service-description">
                Indulge in exquisite culinary experiences at our fine dining restaurant. Our talented chefs create masterpieces using the freshest ingredients, offering a blend of international and local cuisines to satisfy your palate.
              </p>
              <ul className="service-features">
                <li>Gourmet breakfast, lunch, and dinner</li>
                <li>Extensive wine and cocktail selection</li>
                <li>Private dining options available</li>
                <li>Special dietary requirements accommodated</li>
              </ul>
            </div>
          </div>
          
          <div className="service-card service-card-reverse">
            <div className="service-image" style={{ backgroundImage: `url('/images/Service/spa.jpg')` }}></div>
            <div className="service-content">
              <div className="service-icon">
                <FaSpa />
              </div>
              <h2 className="service-title">Luxury Spa & Wellness</h2>
              <p className="service-description">
                Rejuvenate your body and mind at our luxury spa and wellness center. Our skilled therapists offer a range of treatments designed to relax, revitalize, and restore your well-being during your stay.
              </p>
              <ul className="service-features">
                <li>Massage therapies and body treatments</li>
                <li>Facial treatments and skincare</li>
                <li>Aromatherapy and relaxation techniques</li>
                <li>Couples' spa packages available</li>
              </ul>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-image" style={{ backgroundImage: `url('/images/Service/pool.jpg')` }}></div>
            <div className="service-content">
              <div className="service-icon">
                <FaSwimmingPool />
              </div>
              <h2 className="service-title">Swimming Pool & Lounge</h2>
              <p className="service-description">
                Take a refreshing dip in our pristine swimming pool or relax on the comfortable loungers while enjoying the serene atmosphere. Our pool area is designed to provide the perfect balance of relaxation and recreation.
              </p>
              <ul className="service-features">
                <li>Temperature-controlled swimming pool</li>
                <li>Poolside bar and refreshments</li>
                <li>Comfortable loungers and cabanas</li>
                <li>Towel service and pool attendants</li>
              </ul>
            </div>
          </div>
          
          <div className="service-card service-card-reverse">
            <div className="service-image" style={{ backgroundImage: `url('/images/Service/fitness.jpg')` }}></div>
            <div className="service-content">
              <div className="service-icon">
                <FaDumbbell />
              </div>
              <h2 className="service-title">Fitness Center</h2>
              <p className="service-description">
                Maintain your fitness routine in our state-of-the-art fitness center equipped with modern exercise machines and equipment. Our facility is designed to cater to all fitness levels and preferences.
              </p>
              <ul className="service-features">
                <li>Latest cardio and strength training equipment</li>
                <li>Personal training sessions available</li>
                <li>Yoga and fitness classes</li>
                <li>Open 24/7 for your convenience</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <section className="additional-services">
        <div className="container text-center">
          <h2 className="section-title">Additional Services</h2>
          <p>Enhancing your stay with our comprehensive range of services</p>
          
          <div className="services-grid">
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaGlassMartiniAlt />
              </div>
              <h3 className="small-service-title">Bar & Lounge</h3>
              <p>Unwind with your favorite drinks in our elegant bar and lounge area, offering a wide selection of premium beverages and cocktails.</p>
            </div>
            
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaConciergeBell />
              </div>
              <h3 className="small-service-title">Concierge Service</h3>
              <p>Our dedicated concierge team is available 24/7 to assist with reservations, recommendations, and any special requests during your stay.</p>
            </div>
            
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaWifi />
              </div>
              <h3 className="small-service-title">Complimentary Wi-Fi</h3>
              <p>Stay connected with high-speed internet access available throughout the hotel, ensuring seamless connectivity for work or leisure.</p>
            </div>
            
            <div className="small-service-card">
              <div className="small-service-icon">
                <FaCar />
              </div>
              <h3 className="small-service-title">Airport Transfer</h3>
              <p>Enjoy convenient and comfortable transportation between the airport and our hotel with our premium airport transfer service.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServicesPage;
