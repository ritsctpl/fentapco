import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Space, Popconfirm } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';

// MQTT Components
import MQTTClient from './mqtt/MQTTClient';
import MQTTConnection from './mqtt/MQTTConnection';
import MQTTTagDefinition from './mqtt/MQTTTagDefinition';
import MQTTReliableConnection from './common/ReliableConnection';

// OPCUA Components
import OPCUASession from './opcua/OPCUASession';
import OPCUASecurity from './opcua/OPCUASecurity';
import OPCUASubscription from './opcua/OPCUASubscription';
import OPCUAReliableConnection from './common/ReliableConnection';
import { deleteSource } from '../../../services/source';

const SourceDetail = ({ sources, onBack }) => {
  const [source, setSource] = useState({
    // Common fields
    id: '',
    name: '',
    type: 'opcua',

    // Initialize all nested objects with empty values
    client: {
      uri: '',
      username: '',
      password: '',
      certification: '',
    },
    connection: {
      topicName: '',
      message: '',
      qos: '0',
      retainMessage: false,
      proxyUri: '',
      proxyUsername: '',
      proxyPassword: '',
    },
    tagDefinition: {
      selectedSubscriptions: '',
      subscriptionName: '',
      topicFilter: '',
      subscriptionQos: '0',
      payloadType: 'JSON',
    },
    reliableConnection: {
      maxRetries: 0,
      retryInterval: 0,
    },
    session: {
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
    subscription: {
      displayName: '',
      eventInterval: 1000,
      keepAliveInterval: 10,
      lifetimeInterval: 1000,
      maxNotificationsPerEvent: 10,
      acceptableStatusCode: 'Any Status Code',
      enableEditMode: false,
      queueSize: 10,
      discardOldest: false,
    },
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const currentSourceId = sources;

    if (currentSourceId) {
      const allSources = JSON.parse(localStorage.getItem('sources') || '[]');
      const sourceData = allSources.find(s => s.id === currentSourceId);
      
      if (sourceData) {
        setSource(prev => ({
          ...prev,
          ...sourceData,
          client: { ...prev.client, ...sourceData.client },
          connection: { ...prev.connection, ...sourceData.connection },
          tagDefinition: { ...prev.tagDefinition, ...sourceData.tagDefinition },
          reliableConnection: { ...prev.reliableConnection, ...sourceData.reliableConnection },
          session: { ...prev.session, ...sourceData.session },
          security: { ...prev.security, ...sourceData.security },
          subscription: { ...prev.subscription, ...sourceData.subscription },
        }));
      }
    }
  }, [sources, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [tab, field] = name.split('.');
    
    if (field) {
      setSource(prev => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [field]: value
        }
      }));
    } else {
      setSource(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdate = () => {
    const sources = JSON.parse(localStorage.getItem('sources') || '[]');
    const updatedSources = sources.map(s =>
      s.id === source.id ? { ...source } : s
    );
    localStorage.setItem('sources', JSON.stringify(updatedSources));
    onBack();
  };

  const MQTTItems = [
    {
      key: '0',
      label: 'Client',
      children: <MQTTClient source={source} handleChange={handleChange} />,
    },
    {
      key: '1',
      label: 'Connection',
      children: <MQTTConnection source={source} handleChange={handleChange} />,
    },
    {
      key: '2',
      label: 'Tag Definition',
      children: <MQTTTagDefinition source={source} handleChange={handleChange} />,
    },
    {
      key: '3',
      label: 'Reliable Connection',
      children: <MQTTReliableConnection source={source} handleChange={handleChange} />,
    },
  ];

  const OPCUAItems = [
    {
      key: '0',
      label: 'Session',
      children: <OPCUASession source={source} handleChange={handleChange} />,
    },
    {
      key: '1',
      label: 'Security',
      children: <OPCUASecurity source={source} handleChange={handleChange} />,
    },
    {
      key: '2',
      label: 'Subscription',
      children: <OPCUASubscription source={source} handleChange={handleChange} />,
    },
    {
      key: '3',
      label: 'Reliable Connection',
      children: <OPCUAReliableConnection source={source} handleChange={handleChange} />,
    },
  ];

  const handleDeleteConfirm = async (sourceId) => {
    const deleteSources = await deleteSource(sourceId);
    const allSources = JSON.parse(localStorage.getItem('sources') || '[]');
    const updatedSources = allSources.filter(source => source.id.toString() !== sourceId.toString());
    localStorage.setItem('sources', JSON.stringify(updatedSources));
    onBack();
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />}>
          Back to Sources
        </Button>
        <Space size="middle">
        <Popconfirm
            title="Are you sure you want to delete this source?"
            onConfirm={() => handleDeleteConfirm(source.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button type="primary" onClick={handleUpdate}>Update Source</Button>
          <Button onClick={onBack}>Cancel</Button>
        </Space>
      </div>

      <Card style={{ marginTop: '20px' }}>
        <div style={{ height: 'calc(100vh - 230px)', overflow: 'auto' }}>
          {source.type === 'mqtt' && (
            <Tabs items={MQTTItems} defaultActiveKey="0" onChange={setActiveTab} className="source-detail-tabs" />
          )}
          {source.type === 'opcua' && (
            <Tabs items={OPCUAItems} defaultActiveKey="0" onChange={setActiveTab} className="source-detail-tabs" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default SourceDetail;
