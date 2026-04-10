import api from "./axios";

export const login = async (data) => {
  const response = await api.post("/Auth/login", data);
  if (response.data.token) {
    localStorage.setItem("smartpm_token", response.data.token);
  }
  return response;
};

export const register = async (data) => {
  const response = await api.post("/Auth/register", data);
  if (response.data.token) {
    localStorage.setItem("smartpm_token", response.data.token);
  }
  return response;
};
