import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../services/constants';

// Các đường dẫn yêu cầu đăng nhập qua modal
const MODAL_AUTH_PATHS = {
  BOOKING: '/booking',
  FAVORITES: '/favorites',
  MY_BOOKINGS: '/my-bookings'
};

function PrivateRoute({ children, roles }) {
  const { currentUser, openLoginModal } = useAuth();
  const location = useLocation();

  // Nếu người dùng chưa đăng nhập
  if (!currentUser) {
    // Mở modal đăng nhập nếu đang ở trang đặt phòng, trang yêu thích hoặc trang đặt phòng của tôi
    if (Object.values(MODAL_AUTH_PATHS).includes(location.pathname)) {
      openLoginModal(location.pathname);
      return null; // Không render gì cả, modal sẽ được hiển thị
    }
    
    // Chuyển hướng đến trang đăng nhập cho các trang khác
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Nếu có yêu cầu về vai trò
  if (roles) {
    // Xử lý vai trò admin (manager)
    if (roles === 'admin' && currentUser.role === USER_ROLES.MANAGER) {
      return children;
    }
    
    // Kiểm tra xem người dùng có vai trò phù hợp không
    const hasRequiredRole = Array.isArray(roles)
      ? roles.includes(currentUser.role)
      : currentUser.role === roles;

    // Nếu không có vai trò phù hợp, chuyển hướng đến trang chủ
    if (!hasRequiredRole) {
      return <Navigate to="/" />;
    }
  }

  // Nếu mọi thứ đều ổn, hiển thị nội dung
  return children;
}

export default PrivateRoute;
