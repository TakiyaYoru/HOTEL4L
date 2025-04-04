import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import MyBookingDetailPage from './pages/MyBookingDetailPage';
import PrivateRoute from './components/auth/PrivateRoute'; 
import { useAuth } from './contexts/AuthContext';
import FavoritePage from './pages/FavoritePage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LoginModal from './components/auth/LoginModal';

function App() {
  const { loading, loginModalOpen } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Header />
      <main>
        {/* Hiển thị LoginModal nếu loginModalOpen là true */}
        {loginModalOpen && <LoginModal />}
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Trang đặt phòng và thanh toán */}
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* Trang yêu thích và đặt phòng của tôi */}
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/my-bookings" element={
            <PrivateRoute>
              <MyBookingsPage />
            </PrivateRoute>
          } />
          <Route path="/my-bookings/:bookingId" element={
            <PrivateRoute>
              <MyBookingDetailPage />
            </PrivateRoute>
          } />
          
          {/* Trang cá nhân - yêu cầu đăng nhập */}
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          
          {/* Trang Admin - chỉ dành cho manager (admin) */}
          <Route path="/admin" element={
            <PrivateRoute roles="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          {/* Trang Employee - chỉ dành cho employee */}
          <Route path="/employee" element={
            <PrivateRoute roles="employee">
              <EmployeeDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
