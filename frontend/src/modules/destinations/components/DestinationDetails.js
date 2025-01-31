import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Space, Popconfirm } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';

// MQTT 
import MQTTClient from './mqtt/MQTTClient';
import MQTTSecuritySettings from './mqtt/MQTTSecuritySettings';
import MQTTMessageSettings from './mqtt/MQTTMessageSettings';

// OPCUA
import OPCUASession from './opcua/OPCUASession';
import OPCUASecurity from './opcua/OPCUASecurity';
import OPCUAReliableConnection from './opcua/ReliableConnection';
import OPCUAMethod from './opcua/OPCUAMethod';

const DestinationDetail = ({ destinations, onBack, pcoDestinations }) => {
  const [destination, setDestination] = useState({
    id: '',
    name: '',
    type: 'opcua',
    client: {
      id: '',
      uri: '',
      username: '',
      password: '',
      responseTimeout: 10000,
      keepAliveInterval: 0,
      cleanSession: false,
    },
    messageSettings: {
      topicName: '',
      qos: '0',
      payloadType: 'JSON',
      payload: {}
    },
    security: {
      certificate: {
        origin: 'inherited',  
        value: ''
      }
    },
    session: {
      name: '',
      opcTcp: false,
      http: false,
      httpPrivate: false,
      discoveryServer: '',
      serverEndpoint: '',
      updateServerConfig: false,
      sessionName: '',
      keepAliveInterval: 0,
      readingSize: 0,
      writingSize: 0,
      browsingSize: 0,
      tolerantTypeCheck: false,
      structuredDataTypes: false,
      abstractDataTypes: false,
      acceptableStatusCode: '',
      pendingRequests: 0,
      useUrlForNamespace: false,
    },
    security: {
      applicationCertificate: '',
      sendCertificateChain: false,
      authenticationMode: 'Anonymous',
      sessionCertificate: '',
      username: '',
      password: '',
      trustedServerStoreType: 'File System',
      trustedServerFolder: '',
      rejectedServerStoreType: 'File System',
      rejectedServerFolder: '',
      trustedIssuerStoreType: 'File System',
      trustedIssuerFolder: '',
    },
    method: {
      name: '',
      description: '',
      inputParameters: [],
      outputParameters: []
    },
    reliableConnection: {
      inputParameters: [],
      outputParameters: []
    }
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const currentDestinationId = destinations;

    if (currentDestinationId) {
      const allDestinations = JSON.parse(localStorage.getItem('destinations') || '[]');
      const destinationData = allDestinations.find(d => d.id === currentDestinationId);
      
      if (destinationData) {
        setDestination(prev => ({
          ...prev,
          ...destinationData,
          client: { ...prev.client, ...destinationData.client },
          securitySettings: { ...prev.securitySettings, ...destinationData.securitySettings },
          messageSettings: { ...prev.messageSettings, ...destinationData.messageSettings },
          session: { ...prev.session, ...destinationData.session },
          security: { ...prev.security, ...destinationData.security },
          method: { ...prev.method, ...destinationData.method },
          reliableConnection: { ...prev.reliableConnection, ...destinationData.reliableConnection },
        }));
      }
    }
  }, [destinations, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [tab, field] = name.split('.');
    
    if (field) {
      setDestination(prev => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [field]: value
        }
      }));
    } else {
      setDestination(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdate = () => {
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    const updatedDestinations = destinations.map(d =>
      d.id === destination.id ? { ...destination } : d
    );
    localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
    onBack();
  };

  const MQTTItems = [
    {
      key: '0',
      label: 'Client',
      children: <MQTTClient destination={destination} handleChange={handleChange} />,
    },
    {
      key: '1',
      label: 'Security Settings',
      children: <MQTTSecuritySettings destination={destination} handleChange={handleChange} />,
    },
    {
      key: '2',
      label: 'Message Settings',
      children: <MQTTMessageSettings destination={destination} handleChange={handleChange} />,
    },
  ];

  const OPCUAItems = [
    {
      key: '0',
      label: 'Session',
      children: <OPCUASession destination={destination} handleChange={handleChange} />,
    },
    {
      key: '1',
      label: 'Security',
      children: <OPCUASecurity destination={destination} handleChange={handleChange} />,
    },
    {
      key: '2',
      label: 'Method',
      children: <OPCUAMethod destination={destination} handleChange={handleChange} />,
    },
    {
      key: '3',
      label: 'Reliable Connection',
      children: <OPCUAReliableConnection destination={destination} handleChange={handleChange} />,
    },
  ];

  const handleDeleteConfirm = (destinationId) => {
    const allDestinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    const updatedDestinations = allDestinations.filter(destination => destination.id.toString() !== destinationId.toString());
    localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
    onBack();
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />}>
          Back to Destinations
        </Button>
        <Space size="middle">
        <Popconfirm
            title="Are you sure you want to delete this destination?"
            onConfirm={() => handleDeleteConfirm(destination.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button type="primary" onClick={handleUpdate}>Update Destination</Button>
          <Button onClick={onBack}>Cancel</Button>
        </Space>
      </div>

      <Card style={{ marginTop: '20px' }}>
        <div style={{ height: 'calc(100vh - 230px)', overflow: 'auto' }}>
          {destination.type === 'mqtt' && (
            <Tabs items={MQTTItems} defaultActiveKey="0" onTabClick={setActiveTab} className="destination-detail-tabs" />
          )}
          {destination.type === 'opcua' && (
            <Tabs items={OPCUAItems} defaultActiveKey="0" onTabClick={setActiveTab} className="destination-detail-tabs" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default DestinationDetail;
