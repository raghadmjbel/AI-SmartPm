import api from "./axios";

export const getProjects = () => api.get("/Projects");

export const createProject = (data) =>
  api.post("/Projects", data);

export const updateProject = (id, data) =>
  api.put(`/Projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/Projects/${id}`);

export const getProject = (id) =>
  api.get(`/Projects/${id}`);

export const addSpecification = (id, data) =>
  api.post(`/Projects/${id}/projectspecifications`, data);

export const deleteSpecification = (projectId, specId) =>
  api.delete(`/Projects/${projectId}/projectspecifications/${specId}`);

export const generateArtifact = (id, type) =>
  api.post(`/Projects/${id}/generate/${type}?force=true`);

export const getArtifacts = (id) =>
  api.get(`/Projects/${id}/artifacts`);