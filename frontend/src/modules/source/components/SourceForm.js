// src/components/SourceForm.js

import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, Space, Card, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createSource } from '../../../services/source';

const SourceForm = ({ onBack }) => {

  const [sourceType, setSourceType] = useState('opcua');

  const onFinish = async (values) => {
    const existingSources = JSON.parse(localStorage.getItem('sources') || '[]');
    const createdSource = await createSource(values);
    const newSource = {
      id: createdSource.id,
      ...values
    };
    localStorage.setItem('sources', JSON.stringify([...existingSources, newSource]));
    onBack();
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column'  }}>
      <div style={{ paddingTop: '10px' }}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined style={{ fontSize: '16px', justifyContent: 'start' }} />}>
          Back to Sources
        </Button>
      </div>
      <Card style={{ marginTop: '20px' }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Add Source System
        </Typography.Title>

        <Form onFinish={onFinish} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Source Name"
                name="name"
                rules={[{ required: true, message: 'Please input source name!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Source System Type"
                name="type"
                initialValue="opcua"
              >
                <Select onChange={(value) => {
                  setSourceType(value);
                }}>
                  <Select.Option value="opcua">OPC UA</Select.Option>
                  <Select.Option value="mqtt">MQTT</Select.Option>
                  <Select.Option value="kafka">Kafka</Select.Option>
                  <Select.Option value="tcp">TCP</Select.Option>
                  <Select.Option value="udp">UDP</Select.Option>
                  <Select.Option value="ftp">FTP</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="User Name"
                name="username"
                rules={[{ required: true, message: 'Please input user name!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input password!' }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          {sourceType === 'opcua' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Security Mode"
                name="securityMode"
                rules={[{ required: true, message: 'Please input security mode!' }]}
              >
                <Select>
                  <Select.Option value="None">None</Select.Option>
                  <Select.Option value="Sign">Sign</Select.Option>
                  <Select.Option value="SignAndEncrypt">SignAndEncrypt</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Security Policy"
                name="securityPolicy"
                rules={[{ required: true, message: 'Please input security policy!' }]}
              >
                <Select>
                  <Select.Option value="Basic256Sha256">Basic256Sha256</Select.Option>
                  <Select.Option value="Basic256">Basic256</Select.Option>
                  <Select.Option value="Aes256_Sha256">Aes256_Sha256</Select.Option>
                  <Select.Option value="Aes256">Aes256</Select.Option>
                </Select>
              </Form.Item>
              </Col>
              </Row>
          )}

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="URI"
                name="endpointUrl"
                initialValue="opc.tcp://localhost:53530/OPCUA/SimulationServer"
                rules={[{ required: true, message: 'Please input URI!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row> 
          

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button type="primary" htmlType="submit" size="middle">
                Create Source
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

export default SourceForm;
