import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.114:8787", 
  timeout: 10000,
  headers: {
      "Content-Type": "application/json", 
    },
  });
  
  export default api;


// import axios from "axios";

// const getBackendURL = () => {
//   const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
//   const port = window.location.port || 8787;  
  
//   const baseURL = isLocalhost 
//     ? `http://localhost:${port}`  
//     : `http://${window.location.hostname}:${port}`; 

//   return baseURL;
// };

// const api = axios.create({
//   baseURL: getBackendURL(),
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;
