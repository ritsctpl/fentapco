import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa"; // Icon for settings
import "./LandingScreen.css";

const LandingScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Settings Icon */}
      <div className="settings-icon" onClick={() => navigate("/settings")}>
        <FaCog size={30} />
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button onClick={() => navigate("/source")}>Source</button>
        <button onClick={() => navigate("/destination")}>Destination</button>
        <button onClick={() => navigate("/agent")}>Agent</button>
      </div>
    </div>
  );
};

export default LandingScreen;
