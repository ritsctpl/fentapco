import api from "./axiosConfig";

export const fetchSources = async () => {
  const response = await api.get("/api/sources"); 
  return response.data;
};  

export const fetchSourceById = async (id) => {
  const response = await api.get(`/api/sources/${id}`);
  return response.data;
};

export const createSource = async (source) => {
  const response = await api.post("/api/sources", source);
  return response.data;
};

export const deleteSource = async (id) => {
  const response = await api.delete(`/api/sources/${id}`);
  return response.data;
};

export const testSourceConnection = async (id) => {
  const response = await api.post(`/api/sources/${id}/test`);
  return response.data;
};

export const getAllNodes = async (id) => {
  console.log(id,'id');
  const response = await api.get(`/api/sources/${id}/all-nodes`);
  return response.data;
};  

export const getNodes = async (id) => {
  const response = await api.get(`/api/sources/${id}/nodes`);
  return response.data;
};
