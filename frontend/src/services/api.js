import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Advisory endpoints
export const createAdvisory = (data) => api.post('/advisory/create', data);
export const getAdvisory = (requestId) => api.get(`/advisory/${requestId}`);
export const getAgentStatuses = (requestId) => api.get(`/advisory/${requestId}/agents`);
export const getAdvisoryResult = (requestId) => api.get(`/advisory/${requestId}/result`);

// Weather
export const getWeatherReport = (requestId) => api.get(`/weather/${requestId}`);

// Market
export const getMarketData = (requestId) => api.get(`/market/${requestId}`);

// Schemes
export const getSchemes = (requestId) => api.get(`/schemes/${requestId}`);
export const uploadSchemeDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/schemes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Alerts
export const getAlerts = (requestId) => api.get(`/alerts/${requestId}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// SSE stream URL builder
export const getStreamUrl = (requestId) => `/api/advisory/${requestId}/stream`;

export default api;
