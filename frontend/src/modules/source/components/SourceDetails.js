import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Space, Popconfirm, Form } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteSource } from '../../../services/source';
import SourceForm from './SourceForm';


const SourceDetails = ({ sources, onBack }) => {

    const [form] = Form.useForm();

    useEffect(() => {
        if(sources){
           form.setFieldsValue(sources);
        }
    }, [sources]);

  const handleDeleteConfirm = async (sourceId) => {
    const deleteSources = await deleteSource(sourceId);
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
            onConfirm={() => handleDeleteConfirm(sources.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="large" />
          </Popconfirm>
        </Space>
      </div>

      <SourceForm sources={sources} onBack={onBack} />
    </div>
  );
};

export default SourceDetails;
