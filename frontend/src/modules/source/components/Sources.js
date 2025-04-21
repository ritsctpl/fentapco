import React, { useState, useEffect } from 'react';
import { Button, Table, Popconfirm, Space } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import SourceForm from './SourceForm';
import '../style.css';
import { createSource, fetchSourceById, fetchSources, deleteSource } from '../../../services/source';
import SourceDetails from './SourceDetails';

const Sources = () => {
  const [sources, setSources] = useState([]);
  const [pcoSources, setPcoSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(0);
  const [call, setCall] = useState(0);

  useEffect(() => {
    const fetchDataSources = async () => {
      console.log('fetch');
      const sources = await fetchSources();
      setPcoSources(sources);
      setSources(sources);
    };
    fetchDataSources();
  }, [call]);

  const handleSourceClick = async (source) => {
    setSelectedSource(source);
  };

  const handleBack = () => {
    setSelectedSource(null);
    setCall(call + 1);
  };

  const handleAddSource = () => {
    setSelectedSource('new');
  };

  if (selectedSource === 'new') {
    return <SourceForm onBack={handleBack} />;
  }

  if (selectedSource) {
    return <SourceDetails sources={selectedSource} onBack={handleBack} />;
  }

  const handleCopyConfirm = async (sourceToCopy) => {
    const { id, ...sourceData } = sourceToCopy;
    const sourceToAdd = {
      ...sourceData,
      name: `${sourceToCopy.name}_Copy`
    };
    const newSource = await createSource(sourceToAdd);
    setCall(call + 1);
  };

  const handleDeleteConfirm = async (sourceId) => {
    await deleteSource(sourceId);
    setCall(call + 1);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      // render: (text, record) => (
      //   <a onClick={() => handleSourceClick(record)}>{text}</a>
      // ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Endpoint URL',
      dataIndex: 'endpointUrl',
      key: 'endpointUrl',
      render: (text) => text.length > 30 ? text.substring(0, 30) + '...' : text,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="middle">
          <Popconfirm
            title="Create a copy of this source?"
            onConfirm={() => handleCopyConfirm(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              icon={<CopyOutlined style={{ color: '#3179ED' }}/>}
            />
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to delete this source?"
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
        </div>
      ),
    },
  ];

  return (
    <div className="sources-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Sources</h2>
        <Button type="primary" onClick={handleAddSource}>Add Source</Button>
      </div>
      <Table 
        dataSource={sources} 
        columns={columns} 
        rowKey="id"
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleSourceClick(record),
          style: { cursor: 'pointer' }
        })}
      />
    </div>
  );
};

export default Sources; 