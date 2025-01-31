import api from "./axiosConfig";

// Fetch all settings
export const fetchSettings = async () => {
  const response = await api.get("/settings"); // Backend endpoint for settings
  return response.data;
};

// Save a new setting
export const saveSetting = async (setting) => {
  const response = await api.post("/settings", setting);
  return response.data;
};

// Test a connection
export const testConnection = async (testPayload) => {
  const response = await api.post("/settings/test", testPayload);
  return response.data;
};
