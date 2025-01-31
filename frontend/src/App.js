import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingScreen from "./components/LandingScreen";
import Settings from "./components/Settings";
import Dashboard from "./components/Dashboard";

const App = () => (
  <Router>
    <Routes>
      {/* <Route path="/" element={<LandingScreen />} />
      <Route path="/settings" element={<Settings />} /> */}
      {/* <Route path="/dashboard/*" element={<Dashboard />} /> */}
      <Route path="/*" element={<Dashboard />} />
      <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
      <Route path="/source" element={<Navigate to="/dashboard/source" replace />} />
      <Route path="/destination" element={<Navigate to="/dashboard/destination" replace />} />
      <Route path="/agent" element={<Navigate to="/dashboard/agent" replace />} />
    </Routes>
  </Router>
);

export default App;