import api from './axios';

export const categoryApi = {
  getAll:  ()          => api.get('/categories'),
  getById: (id)        => api.get(`/categories/${id}`),
  create:  (data)      => api.post('/categories', data),
  update:  (id, data)  => api.put(`/categories/${id}`, data),
  remove:  (id)        => api.delete(`/categories/${id}`),
};

export const brokerHouseApi = {
  getAll:  ()          => api.get('/broker-houses'),
  getById: (id)        => api.get(`/broker-houses/${id}`),
  create:  (data)      => api.post('/broker-houses', data),
  update:  (id, data)  => api.put(`/broker-houses/${id}`, data),
  remove:  (id)        => api.delete(`/broker-houses/${id}`),
};

export const companyApi = {
  // Pass { brokerHouse: id } in params to drive cascading dropdown
  getAll:  (params)    => api.get('/companies', { params }),
  getById: (id)        => api.get(`/companies/${id}`),
  create:  (data)      => api.post('/companies', data),
  update:  (id, data)  => api.put(`/companies/${id}`, data),
  remove:  (id)        => api.delete(`/companies/${id}`),
};
