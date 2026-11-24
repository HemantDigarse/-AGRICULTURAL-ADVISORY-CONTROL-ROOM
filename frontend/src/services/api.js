import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agri_access_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
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
export const uploadSchemeDocument = (file, details = {}) => {
  const formData = new FormData();
  formData.append('name', details.name || file.name.replace(/\.[^.]+$/, ''));
  formData.append('description', details.description || `Uploaded document: ${file.name}`);
  formData.append('document', file);
  if (details.eligibility) formData.append('eligibility', details.eligibility);
  if (details.benefits) formData.append('benefits', details.benefits);
  if (details.applicationProcess) formData.append('application_process', details.applicationProcess);
  if (details.category) formData.append('category', details.category);
  return api.post('/schemes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Alerts
export const getAlerts = (requestId) => api.get(`/alerts/${requestId}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// SSE stream URL builder
export const getStreamUrl = (requestId) => {
  const token = localStorage.getItem('agri_access_token');
  const query = token ? '?access_token=' + encodeURIComponent(token) : '';
  return '/api/advisory/' + requestId + '/stream' + query;
};

// Authentication
export const registerAccount = (data) => api.post('/auth/register', data);
export const loginAccount = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');

export default api;
