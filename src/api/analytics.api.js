import api from './axios';

export const analyticsApi = {
  getOverview:   ()       => api.get('/analytics/overview'),
  getByCategory: ()       => api.get('/analytics/by-category'),
  getByBroker:   ()       => api.get('/analytics/by-broker'),
  getByCompany:  ()       => api.get('/analytics/by-company'),
  getTimeSeries: (params) => api.get('/analytics/time-series', { params }),
  getCalendar:   (params) => api.get('/analytics/calendar',    { params }),
};

// ── Export — triggers a file download ─────────────────────
const downloadFile = async (url, params, filename) => {
  const res = await api.get(url, { params, responseType: 'blob' });
  const href = URL.createObjectURL(new Blob([res.data]));
  const a    = document.createElement('a');
  a.href     = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
};

export const exportApi = {
  excel: (params) => downloadFile('/export/excel', params, `policies_${Date.now()}.xlsx`),
  csv:   (params) => downloadFile('/export/csv',   params, `policies_${Date.now()}.csv`),
  pdf:   (params) => downloadFile('/export/pdf',   params, `policies_${Date.now()}.pdf`),
};
