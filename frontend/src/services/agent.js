import api from "./axiosConfig";

// Fetch all settings
export const fetchAgents = async () => {
  const response = await api.get("/agents"); // Backend endpoint for settings
  return response.data;
};

export const fetchAgentById = async (id) => {
  const response = await api.get(`/agents/${id}`); // Backend endpoint for settings
  return response.data;
};

// Save a new setting
export const createAgent = async (agent) => {
  const response = await api.post("/api/agents", agent);
  return response.data;
};

export const deleteAgent = async (agentId) => {
  const response = await api.delete(`/api/agents/${agentId}`);
  return response.data;
};

export const startAgent = async (agentId) => {
  const response = await api.post(`/api/agents/${agentId}/start`);
  console.log(response.data,'responsecccc');
  return response.data;
};

export const stopAgent = async (agentId) => {
  const response = await api.post(`/api/agents/${agentId}/stop`);
  return response.data;
};

// Test a connection
export const testConnection = async (testPayload) => {
  const response = await api.post("/agents/test", testPayload);
  return response.data;
};
