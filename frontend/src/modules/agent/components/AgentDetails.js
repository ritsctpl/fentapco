import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Space, Popconfirm, Typography } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
// import Host from './agentsTabs/Host';
// import Servers from './agentsTabs/Servers';
// import TagQuery from './agentsTabs/TagQuery';
// import NotificationProcessing from './agentsTabs/NotificationProcessing';
import { FaLongArrowAltRight } from "react-icons/fa";
// import SourceDetail from '../../source/components/SourceDetail';
// import Log from './agentsTabs/Log';
// import SubscriptionItems from './agentsTabs/SubscriptionItems';
import { deleteAgent } from '../../../services/agent';
import SourceDetails from '../../source/components/SourceDetails';

const { Text } = Typography;

const AgentDetail = ({ agents, onBack }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [agent, setAgent] = useState({
    // Common fields
    id: '',
    sourceSystem: '',
    instanceName: '',
    instanceDescription: '',

    host: {
      maintainedThroughSAP: false,
      logLevel: 'Error',
      runAsExecutable: false,
      serviceUserName: '.localsystem',
      serviceUserPassword: '',
      serviceStartMode: 'Manual',
      maintainDependentServices: false,
      startupTimeout: 5,
      startingGroup: '',
      mustBeStoppedIndividually: false
    },
    servers: {
      serverType: 'WebSocket Server',
      serverSettings: {
        allowTagChanges: false,
        protocol: 'unsecured',
        port: '8082',
        serverCertificate: '',
        requestClientCertificate: false,
        clientRootCertificate: '',
        messageFormat: 'json'
      }
    },
    // Add new fields
    log: {
      startDate: null,
      endDate: null,
      filterLevel: '',
      numberOfEntries: 1000,
      searchType: 'Messages',
      searchText: ''
    },
    tagQuery: {
      cacheMode: 'Access to Cache, to Data Source as Required',
      mask: '',
      alias: ''
    },
    notificationProcessing: {
      storageMethod: 'In Memory Only',
      resendFailedMessages: false,
      keepExpiredMessages: false,
      processMessagesInOrder: false,
      keepCopiesInJournal: false,
      makeMessagesRecoverable: false,
      maxQueuedMessages: 1000,
      maxDispatchThreads: 5,
      enhancedProcessing: 'none',
      dynamicLinkLibrary: '',
      class: '',
      status: ''
    },
    subscriptionItems: [],
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const currentAgentId = agents;

    if (currentAgentId) {
      const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
      const agentData = allAgents.find(a => a.id === currentAgentId);

      if (agentData) {
        setAgent(prev => ({
          ...prev,
          ...agentData,
          host: { ...prev.host, ...agentData.host },
        }));
      }
    }
  }, [agents, activeTab]);

  useEffect(() => {
    const savedAgent = localStorage.getItem('agentDetails');
    if (savedAgent) {
      try {
        const parsedAgent = JSON.parse(savedAgent);
        setAgent(prev => ({
          ...prev,
          ...parsedAgent
        }));
      } catch (error) {
        console.error('Error parsing saved agent details:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setAgent(prev => ({
      ...prev,
      [name]: value
    }));

    // Save to localStorage after update
    const updatedAgent = {
      ...agent,
      [name]: value
    };
    localStorage.setItem('agentDetails', JSON.stringify(updatedAgent));

    // If this is part of the agents list, update that too
    const agents = JSON.parse(localStorage.getItem('agents') || '[]');
    const updatedAgents = agents.map(a =>
      a.id === agent.id ? updatedAgent : a
    );
    localStorage.setItem('agents', JSON.stringify(updatedAgents));
  };

  const handleUpdate = () => {
    const agents = JSON.parse(localStorage.getItem('agents') || '[]');
    const updatedAgents = agents.map(a =>
      a.id === agent.id ? { ...agent } : a
    );
    localStorage.setItem('agents', JSON.stringify(updatedAgents));
    onBack();
  };

  // const MQTTItems = [
  //   {
  //     key: '0',
  //     label: 'Host',
  //     children: <Host agents={agent} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '1',
  //     label: 'Log',
  //     children: <Log agents={agent} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '2',
  //     label: 'Servers',
  //     children: <Servers agents={agent} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '3',
  //     label: 'Tag Query',
  //     children: <TagQuery agents={agent} handleChange={handleChange} />,
  //   },
  //   {
  //     key: '4',
  //     label: 'Subscription Items',
  //     children: <SubscriptionItems 
  //       agents={agent} 
  //       handleChange={handleChange}
  //     />,
  //   },
  //   {
  //     key: '5',
  //     label: 'Notification Processing',
  //     children: <NotificationProcessing agents={agent} handleChange={handleChange} />,
  //   },
  // ];

  const handleDeleteConfirm = async (agentId) => {
    const deleteAgents = await deleteAgent(agentId);
    const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
    const updatedAgents = allAgents.filter(agent => agent.id.toString() !== agentId.toString());
    localStorage.setItem('agents', JSON.stringify(updatedAgents));
    onBack();
  };

  const routeSourceSystem = (sourceSystem) => {
    const sources = JSON.parse(localStorage.getItem('sources') || '[]');
    const sourceObj = sources?.find(source => source.name === sourceSystem);
    setSelectedSource(sourceObj?.id);
  };

  if (selectedSource) {
    // return <SourceDetail sources={selectedSource} onBack={onBack} />;
    return <SourceDetails sources={selectedSource} onBack={onBack} />;
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
            onClick={() => routeSourceSystem(agent.sourceSystem)} 
            style={{ cursor: 'pointer' }}
          >
            {agent.sourceSystem} <FaLongArrowAltRight style={{ marginLeft: '5px', marginTop: '3px' }} />
          </Text>
          <Text style={{ fontSize: '16px', fontWeight: 600, marginLeft: '20px' }}>Agent Instance {agent.instanceName}</Text>
        </div>
        <Space size="middle"> 
          <Popconfirm
            title="Are you sure you want to delete this agent?"
            onConfirm={() => handleDeleteConfirm(agent.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button type="primary" onClick={handleUpdate}>Update Agent</Button>
          <Button onClick={onBack}>Cancel</Button>
        </Space>
      </div>

      {/* <Card style={{ marginTop: '20px' }}>
        <Tabs
          items={MQTTItems}
          defaultActiveKey="0"
          onChange={setActiveTab}
          className="agent-detail-tabs"
        />
      </Card> */}
    </div>
  );
};

export default AgentDetail;
