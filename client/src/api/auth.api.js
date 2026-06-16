import api from '@/lib/axios';

export const signUp = async ({ name, email, password }) => {
  const response = await api.post('/api/auth/signUp', {
    name,
    email,
    password,
  });
  return response.data;
};

export const signIn = async ({ email, password }) => {
  const response = await api.post('/api/auth/signIn', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const logoutAll = async () => {
  const response = await api.post('/api/auth/logout-all');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/api/auth/verify/${token}`);
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post('/api/auth/resend-verification', { email });
  return response.data;
};

export const getLoggedInDevices = async () => {
  const response = await api.get('/api/auth/info-loggedIn-devices');
  return response.data;
};
