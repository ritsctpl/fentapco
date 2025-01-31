import api from "./axiosConfig";

// Fetch all settings
export const fetchNotifications = async () => {
  const response = await api.get("/api/notifications"); // Backend endpoint for notifications
  return response.data;
};

export const fetchNotificationById = async (id) => {
  const response = await api.get(`/api/notifications/${id}`); // Backend endpoint for notifications
  return response.data;
};

// Save a new setting
export const createNotification = async (notification) => {
  const response = await api.post("/api/notifications", notification);
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/api/notifications/${notificationId}`);
  return response.data;
};