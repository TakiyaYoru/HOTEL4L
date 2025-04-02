import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function PrivateRoute({ children, roles }) {
  const { currentUser, openLoginModal } = useAuth();
  const location = useLocation();

  // Nếu người dùng chưa đăng nhập
  if (!currentUser) {
    // Mở modal đăng nhập nếu đang ở trang đặt phòng, trang yêu thích hoặc trang đặt phòng của tôi
    if (location.pathname === "/booking" || location.pathname === "/favorites" || location.pathname === "/my-bookings") {
      openLoginModal(location.pathname);
      return null; // Không render gì cả, modal sẽ được hiển thị
    }
    
    // Chuyển hướng đến trang đăng nhập cho các trang khác
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  // Nếu có yêu cầu về vai trò
  if (roles) {
    // Xử lý vai trò admin (manager)
    if (roles === 'admin' && currentUser.role === 'manager') {
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
