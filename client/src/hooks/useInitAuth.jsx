import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const useInitAuth = () => {
  const { user, accessToken, setAccessToken, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      // If we have user in localStorage but no accessToken → try refresh
      if (user && !accessToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
            {},
            { withCredentials: true },
          );
          const newAccessToken = response.data.data.accessToken;
          setAccessToken(newAccessToken);
        } catch {
          // Refresh failed — session truly expired, clear everything
          clearAuth();
        }
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  return isInitializing;
};

export default useInitAuth;
