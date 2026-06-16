import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to='/sign-in' replace />;
  }

  return children;
};

export default ProtectedRoute;
