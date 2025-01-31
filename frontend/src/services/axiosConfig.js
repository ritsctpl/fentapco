import axios from "axios";

// Create an Axios instance with the backend base URL
const api = axios.create({
  baseURL: "http://localhost:8787", // Update this to match your Spring Boot backend
  timeout: 10000, // Optional: Set a timeout
  headers: {
    "Content-Type": "application/json", // Optional: Specify default headers
  },
});

// Export the instance
export default api;
