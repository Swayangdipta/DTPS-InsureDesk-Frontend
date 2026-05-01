import api from './axios';

export const authApi = {
  login:          (data)           => api.post('/auth/login', data),
  register:       (data)           => api.post('/auth/register', data),
  getMe:          ()               => api.get('/auth/me'),
  changePassword: (data)           => api.put('/auth/change-password', data),
};
