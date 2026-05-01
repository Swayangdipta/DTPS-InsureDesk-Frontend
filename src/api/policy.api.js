import api from './axios';

export const policyApi = {
  // List with filters + pagination
  getAll:         (params)      => api.get('/policies', { params }),

  // Single
  getById:        (id)          => api.get(`/policies/${id}`),

  // CRUD
  create:         (data)        => api.post('/policies', data),
  update:         (id, data)    => api.put(`/policies/${id}`, data),
  remove:         (id)          => api.delete(`/policies/${id}`),

  // Special
  toggleBookmark: (id)          => api.put(`/policies/${id}/bookmark`),
  bulkImport:     (data)        => api.post('/policies/bulk-import', data),
  getRenewals:    (params)      => api.get('/policies/renewals', { params }),
};
