import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

const ProtectedRoute = () => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;