import React, { useState, useEffect } from 'react';
import { Button, Table, Popconfirm, Space } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import '../style.css';
import { createDestination, fetchDestinations, deleteDestination } from '../../../services/destination';
import DestinationForm from './DestinationForm';
import DestinationDetail from './DestinationDetails';

const DestinationMain = () => {
  const [destination, setDestination] = useState([]);
  const [pcoDestination, setPcoDestination] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(0);
  const [call, setCall] = useState(0);

  useEffect(() => {
    const fetchDataSources = async () => {
      const destinations = await fetchDestinations();
      setPcoDestination(destinations);
      setDestination(destinations);
    };
    fetchDataSources();
  }, [call]);

  const handleDestinationClick = async (source) => {
    setSelectedDestination(source);
  };

  const handleBack = () => {
    setSelectedDestination(null);
    setCall(call + 1);
  };

  const handleAddDestination = () => {
    setSelectedDestination('new');
  };

  if (selectedDestination === 'new') {
    return <DestinationForm onBack={handleBack} />;
  }

  if (selectedDestination) {
    return <DestinationDetail destination={selectedDestination} onBack={handleBack} />;
  }

  const handleCopyConfirm = async (destinationToCopy) => {
    const { id, ...destinationData } = destinationToCopy;
    const destinationToAdd = {
      ...destinationData,
      name: `${destinationToCopy.name}_Copy`
    };
    await createDestination(destinationToAdd);
    setCall(call + 1);
  };

  const handleDeleteConfirm = async (destinationId) => {
    await deleteDestination(destinationId);
    setCall(call + 1);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Protocol',
      dataIndex: 'protocol',
      key: 'protocol',
    },
    {
      title: 'Kafka Brokers',
      dataIndex: 'kafkaBrokers',
      key: 'kafkaBrokers',
      render: (text) => text?.length > 30 ? text.substring(0, 30) + '...' : text,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="middle">
            <Popconfirm
              title="Create a copy of this destination?"
              onConfirm={() => handleCopyConfirm(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<CopyOutlined style={{ color: '#3179ED' }} />}
              />
            </Popconfirm>
            <Popconfirm
              title="Are you sure you want to delete this destination?"
              onConfirm={() => handleDeleteConfirm(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
          <div
            style={{
              width: '8px',
              height: '8px',
              display: 'flex',
              justifyContent: 'end',
              borderRadius: '50%',
              backgroundColor: record.active ? '#52c41a' : '#ff4d4f',
              marginRight: '8px'
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="destination-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Destination</h2>
        <Button type="primary" onClick={handleAddDestination}>Add Destination</Button>
      </div>
      <Table
        dataSource={destination}
        columns={columns}
        rowKey="id"
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleDestinationClick(record),
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
};

export default DestinationMain; 