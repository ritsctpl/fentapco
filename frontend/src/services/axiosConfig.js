// import axios from "axios";

// // Create an Axios instance with the backend base URL
// const api = axios.create({
//   baseURL: "http://localhost:8787", // Update this to match your Spring Boot backend
//   timeout: 10000, // Optional: Set a timeout
//   headers: {
//     "Content-Type": "application/json", // Optional: Specify default headers
//   },
// });

// // Export the instance
// export default api;




import axios from "axios";
 
// Function to get the backend IP from server.properties
const getBackendURL = async () => {
  try {
    const response = await fetch("/server.properties");
    const text = await response.text();
    // Parse the properties file
    const lines = text.split("\n");
    let serverAddress = "";
    let serverPort = "";
 
    lines.forEach((line) => {
      if (line.startsWith("server.address")) {
        serverAddress = line.split("=")[1].trim();
      }
      if (line.startsWith("server.port")) {
        serverPort = line.split("=")[1].trim();
      }
    });
 
    return `http://${serverAddress}:${serverPort}`;
  } catch (error) {
    console.error("Error fetching server.properties:", error);
    return "http://localhost:8787"; // Fallback in case of failure
  }
};
 
// Create an Axios instance dynamically
const api = axios.create({
  baseURL: await getBackendURL(), // Fetch the backend URL dynamically
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
 
export default api;