import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Space, Popconfirm, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { FaLongArrowAltRight } from "react-icons/fa";
import SourceDetail from '../../source/components/SourceDetail';
import AgentDetail from './AgentDetails';
// import Notification from './agentNotificationTabs/Notification';
// import MessageDelivery from './agentNotificationTabs/MessageDelivery';
// import Output from './agentNotificationTabs/output';
// import AgentDestination from './agentNotificationTabs/AgentDestination';

const { Text } = Typography;

const AgentNotification = ({ agentId, notificationId, onBack }) => {

  
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedInstance, setSelectedInstance] = useState(null);

  const [notification, setNotification] = useState({
    // Notification tab fields
    enabled: false,
    triggerType: 'Always',
    triggerSubscription: 'onlyUsed',
    
    // Output tab fields
    output: [],
    
    // Message Delivery tab fields
    maxRetries: 0,
    retryInterval: 0,
    keepLastMessage: 'Keep All Messages',
    deleteAfter: 60,
    lifetimeDays: 0,
    lifetimeHours: 0,
    lifetimeMinutes: 0,
    fixedNumberMessages: false,
    fixedNumber: 0,
    maxAccumulationTime: false,
    accumulationTime: 0,
    processExactlyOnce: false,
    
    // Destination tab fields
    destination: []
  });
  
  const [notificationDatas, setNotificationDatas] = useState({
    // Common fields
    id: '',
    notification: '',
    description: '',
  });
  
  useEffect(() => { 
    console.log(notificationDatas,'notificationDatas');
  }, [notificationDatas]);
  
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    const currentAgentId = agentId;
    const currentNotificationId = notificationId;
    
    if (currentAgentId) {
      const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
      const agentData = allAgents.find(a => a.id === currentAgentId);
      
      if (agentData) {
        setNotification(prev => ({
          ...prev,
          ...agentData,
          host: { ...prev.host, ...agentData.host },
        }));
      }
    }

    if (currentNotificationId) {
      const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
      const currentAgent = allAgents.find(agent => agent.id === currentAgentId);
      
      if (currentAgent && currentAgent.notifications) {
        const notificationData = currentAgent.notifications.find(n => n.id === currentNotificationId);
        if (notificationData) {
          setNotificationDatas(prev => ({ ...prev, ...notificationData }));
        }
      }
    }
  }, [agentId, notificationId, activeTab]);

  useEffect(() => {
    if (agentId && notificationId) {
      const agents = JSON.parse(localStorage.getItem('agents') || '[]');
      const currentAgent = agents.find(a => a.id === agentId);
      
      if (currentAgent) {
        const currentNotification = currentAgent.notifications.find(
          n => n.id === notificationId
        );

        if (currentNotification) {
          // Set all the notification data
          setNotification({
            ...currentNotification,
            destination: currentNotification.destination || []
          });
        }
      }
    }
  }, [agentId, notificationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [tab, field] = name.split('.');

    if (field) {
      setNotification(prev => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [field]: value
        }
      }));
    } else {
      setNotification(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdate = () => {
    const agents = JSON.parse(localStorage.getItem('agents') || '[]');
    const updatedAgents = agents.map(agent => {
      if (agent.id === agentId) {
        // Find the specific notification to update
        const updatedNotifications = agent.notifications.map(n => {
          if (n.id === notificationId) {
            return {
              ...n,
              // Basic notification info
              notification: n.notification,
              description: n.description,
              
              // Tab specific data
              notificationTab: {
                enabled: notification.enabled,
                triggerType: notification.triggerType,
                triggerSubscription: notification.triggerSubscription
              },
              output: notification.output || [],
              messageDelivery: {
                maxRetries: notification.maxRetries,
                retryInterval: notification.retryInterval,
                keepLastMessage: notification.keepLastMessage,
                deleteAfter: notification.deleteAfter,
                lifetimeDays: notification.lifetimeDays,
                lifetimeHours: notification.lifetimeHours,
                lifetimeMinutes: notification.lifetimeMinutes,
                fixedNumberMessages: notification.fixedNumberMessages,
                fixedNumber: notification.fixedNumber,
                maxAccumulationTime: notification.maxAccumulationTime,
                accumulationTime: notification.accumulationTime,
                processExactlyOnce: notification.processExactlyOnce
              },
              destination: notification.destination || []
            };
          }
          return n;
        });

        return {
          ...agent,
          notifications: updatedNotifications
        };
      }
      return agent;
    });

    localStorage.setItem('agents', JSON.stringify(updatedAgents));
    onBack();
  };

  // const NotificationItems = [
  //   {
  //     key: '0',
  //     label: 'Notification',
  //     children: <Notification agents={notification} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '1',
  //     label: 'Output',
  //     children: <Output agents={notification} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '2',
  //     label: 'Message Delivery',
  //     children: <MessageDelivery agents={notification} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '3',
  //     label: 'Destination',
  //     children: <AgentDestination agents={notification} handleChange={handleChange} />,
  //   },
  // ];

  const handleDeleteConfirm = (notificationId) => {
    const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
    const updatedAgents = allAgents.map(agent => {
      if (!agent.notifications) {
        return agent;
      }
      const hasNotification = agent.notifications.some(n => n.id === notificationId);
      if (!hasNotification) return agent;
      const result = {
        ...agent,
        notifications: agent.notifications.filter(n => n.id !== notificationId)
      };
      return result;
    });
    
    localStorage.setItem('agents', JSON.stringify(updatedAgents));
    onBack();
  };

  const handleBack = () => {
    setSelectedSource(null);
    setSelectedInstance(null);

  };

  const routeSourceSystem = (sourceSystem) => {
    const sources = JSON.parse(localStorage.getItem('sources') || '[]');
    const sourceObj = sources?.find(source => source.name === sourceSystem);
    setSelectedSource(sourceObj?.id);
  };

  if (selectedSource) {
    return <SourceDetail sources={selectedSource} onBack={handleBack} />;
  }

  const routeInstanceSystem = (instanceSystem) => {
    const agentsList = JSON.parse(localStorage.getItem('agents') || '[]');
    const agentObj = agentsList?.find(agent => agent.notification === instanceSystem);
    setSelectedInstance(agentObj?.id);
  };

  if (selectedInstance) {
    return <AgentDetail agents={selectedInstance} onBack={handleBack} />;
  }

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />}>
          Back to Agents
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text 
            className="agent-detail-title" 
            onClick={() => routeSourceSystem(notification.sourceSystem)} 
            style={{ cursor: 'pointer' }}
          >
            {notification.sourceSystem} <FaLongArrowAltRight style={{ marginLeft: '5px', marginTop: '3px' }} />
          </Text>
          <Text 
            className="agent-detail-title" 
            onClick={() => routeInstanceSystem(notification.notification)} 
            style={{ cursor: 'pointer', marginLeft: '20px' }}
          >
            {notification.instanceName} <FaLongArrowAltRight style={{ marginLeft: '5px', marginTop: '3px' }} />
          </Text>
          <Text style={{ fontSize: '16px', fontWeight: 600, marginLeft: '20px' }}>
            Agent Instance {notificationDatas.notification || ''}
          </Text>
        </div>
        <Space size="middle"> 
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            onConfirm={() => handleDeleteConfirm(notificationDatas.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button type="primary" onClick={handleUpdate}>Update Agent Notification</Button>
          <Button onClick={onBack}>Cancel</Button>
        </Space>
      </div>

      {/* <Card style={{ marginTop: '20px' }}>
        <Tabs
          items={NotificationItems}
          defaultActiveKey="0"
          onChange={setActiveTab}
          className="agent-detail-tabs"
        />
      </Card> */}
    </div>
  );
};

export default AgentNotification;
