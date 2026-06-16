import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const PublicRoute = ({ children }) => {
  const { accessToken } = useAuthStore();

  if (accessToken) {
    return <Navigate to='/app' replace />;
  }

  return children;
};

export default PublicRoute;
