import api from "./axiosConfig";

export const fetchDestinations = async () => {
  const response = await api.get("/api/destinations"); 
  return response.data;
};  

export const fetchDestinationById = async (id) => {
  const response = await api.get(`/api/destinations/${id}`);
  return response.data;
};

export const createDestination = async (destination) => {
  const response = await api.post("/api/destinations", destination);
  return response.data;
};

export const deleteDestination = async (id) => {
  const response = await api.delete(`/api/destinations/${id}`);
  return response.data;
};

export const testDestinationConnection = async (id) => {
  const response = await api.post(`/api/destinations/${id}/test`);
  return response.data;
};
