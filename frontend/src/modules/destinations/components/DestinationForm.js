// src/components/DestinationForm.js

import React from 'react';
import { Form, Input, Button, Select, Typography, Space, Card, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createDestination } from '../../../services/destination';

const DestinationForm = ({ onBack }) => {

  const onFinish = async (values) => {
    const createdDestination = await createDestination(values);
    const existingDestinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    const newDestination = {
        ...values,
        id: createdDestination.id,  
    };
    localStorage.setItem('destinations', JSON.stringify([...existingDestinations, newDestination]));
    onBack();
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column'  }}>
      <div style={{padding: '10px'}}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined style={{ fontSize: '16px', justifyContent: 'start' }} />}>
          Back to Destinations
        </Button>
      </div>
      <Card style={{ marginTop: '10px' }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Add Destination System
        </Typography.Title>

        <Form onFinish={onFinish} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Destination Name"
                name="name"
                rules={[{ required: true, message: 'Please input destination name!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Destination System Type"
                name="type"
                initialValue="opcua"
              >
                <Select>
                  <Select.Option value="opcua">OPC UA</Select.Option>
                  <Select.Option value="mqtt">MQTT</Select.Option>
                  <Select.Option value="kafka">Kafka</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input Description!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row> 

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button type="primary" htmlType="submit" size="middle">
                Create Destination
              </Button>
              <Button size="middle" onClick={() => onBack()}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default DestinationForm;
