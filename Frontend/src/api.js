import axios from 'axios';

const API_BASE_URL = 'http://localhost:5054/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Projects API
export const projectsApi = {
  getAll: () => api.get('/Projects'),
  getById: (id) => api.get(`/Projects/${id}`),
  create: (data) => api.post('/Projects', data),
  update: (id, data) => api.put(`/Projects/${id}`, data),
  delete: (id) => api.delete(`/Projects/${id}`),
};

// Artifacts API
export const artifactsApi = {
  generate: (projectId, type, force = false) => api.post(`/Projects/${projectId}/generate/${type}?force=${force}`),
  getAll: (projectId) => api.get(`/Projects/${projectId}/artifacts`),
  getByType: (projectId, type) => api.get(`/Projects/${projectId}/artifacts/${type}`),
  delete: (projectId, artifactId) => api.delete(`/Projects/${projectId}/projectartifacts/${artifactId}`),
};

// Specifications API
export const specificationsApi = {
  add: (projectId, data) => api.post(`/Projects/${projectId}/projectspecifications`, data),
  delete: (projectId, specId) => api.delete(`/Projects/${projectId}/projectspecifications/${specId}`),
};

export default api;
