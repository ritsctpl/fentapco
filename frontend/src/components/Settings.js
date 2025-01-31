import React, { useState, useEffect } from "react";
import { fetchSettings, saveSetting, testConnection } from "../services/settings";
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Button, Avatar } from 'antd';
import './style.css';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
  });
  const navigate = useNavigate();

  // Fetch settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  // Handle input changes for new setting
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSetting({ ...newSetting, [name]: value });
  };

  // Save a new setting
  const handleSave = async () => {
    const saved = await saveSetting(newSetting);
    setSettings((prev) => [...prev, saved]); // Update the list
    setNewSetting({ key: "", value: "" }); // Reset form
  };

  // Test a connection
  const handleTestConnection = async () => {
    const result = await testConnection({ testKey: "example" });
    alert(result ? "Connection successful" : "Connection failed");
  };

  return (
    <div className="settings-container">
      <header className="dashboard-header">
        <div className="header-left">
          <Button
            type="text"
            onClick={() => navigate(-1)}
            className="collapse-button"
          >
            <MenuFoldOutlined />
          </Button>
          <h1>Settings</h1>
        </div>
        
        <div className="header-right">
          <Button type="text" icon={<UserOutlined />} />
          <Button type="text" icon={<BellOutlined />} />
          <div className="user-status">
            <Avatar size="small" />
            <span>Offline</span>
          </div>
        </div>
      </header>

      <div className="settings-content">
        <h2>Settings Page</h2>
        <ul>
          {settings.map((setting, index) => (
            <li key={index}>{`${setting.key}: ${setting.value}`}</li>
          ))}
        </ul>
        <div>
          <input
            name="key"
            value={newSetting.key}
            onChange={handleInputChange}
            placeholder="Key"
          />
          <input
            name="value"
            value={newSetting.value}
            onChange={handleInputChange}
            placeholder="Value"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleTestConnection}>Test Connection</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
