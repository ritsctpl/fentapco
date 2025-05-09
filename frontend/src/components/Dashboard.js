import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GrResources } from "react-icons/gr";
import { GiTargetShot } from "react-icons/gi";
import { SiIobroker } from "react-icons/si";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Menu, Avatar } from 'antd';
import './style.css';
import Sources from '../modules/source/components/Sources';
import AgentScreen from '../modules/agent/components/Agent';
import Destination from '../modules/destinations';

const items = [
  {
    key: '1',
    icon: <GrResources />,
    label: 'Sources',
  },
  {
    key: '2',
    icon: <GiTargetShot />,
    label: 'Destinations',
  },
  {
    key: '3',
    icon: <SiIobroker />,
    label: 'Agents',
  },
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  const location = useLocation();

  // Update selected key based on current path
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    switch(path) {
      case 'source':
        setSelectedKey('1');
        break;
      case 'destination':
        setSelectedKey('2');
        break;
      case 'agent':
        setSelectedKey('3');
        break;
      case 'subscription':
        setSelectedKey('4');
        break;
      default:
        setSelectedKey('1');
    }
  }, [location]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    switch(e.key) {
      case '1':
        navigate('/dashboard/source');
        break;
      case '2':
        navigate('/dashboard/destination');
        break;
      case '3':
        navigate('/dashboard/agent');
        break;
      default:
        navigate('/dashboard/source');
    }
  };
  
  const renderContent = () => {
    switch(selectedKey) {
      case '1':
        return <Sources />;
      case '2':
        return <Destination />;
      case '3':
        return <AgentScreen />;
      default:
        return <Sources />;
    }
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <Button
            type="text"
            onClick={toggleCollapsed}
            className="collapse-button"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <h1>Pco Integration</h1>
        </div>
        
        <div className="header-right">
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            onClick={() => {
              setSelectedKey('5');
              navigate('/dashboard/settings');
            }} 
          />
          <Button type="text" icon={<UserOutlined />} />
          <Button type="text" icon={<BellOutlined />} />
          <div className="user-status">
            <Avatar size="small" />
            <span>Offline</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="sidebar" style={{ width: collapsed ? 80 : 256 }}>
          <Menu
            defaultSelectedKeys={['1']}
            selectedKeys={[selectedKey]}
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
            items={items}
            onClick={handleMenuClick}
            style={{ height: '100%' }}
          />
        </div>
        <div className="content-area" style={{marginLeft: collapsed ? '80px' : '256px', height: '100%'}}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
