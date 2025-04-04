// src/components/SourceForm.js

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Typography, Space, Card, Row, Col, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createSource, testSourceConnection } from '../../../services/source';

const SourceForm = ({ onBack, sources }) => {

  const [sourceType, setSourceType] = useState('opcua');
  const [securityMode, setSecurityMode] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (sources) {
      form.setFieldsValue({
        name: sources.name,
        type: sources.type,
        username: sources.username,
        password: sources.password,
        endpointUrl: sources.endpointUrl,
        securityMode: sources.securityMode,
        securityPolicy: sources.securityPolicy,
      });
      setSecurityMode(sources.securityMode);
    }
  }, [sources, form]);

  // Add effect to handle security policy when security mode changes
  useEffect(() => {
    if (securityMode === 'None') {
      form.setFieldsValue({ securityPolicy: 'None' });
    } else if (securityMode === 'Sign' || securityMode === 'SignAndEncrypt') {
      form.setFieldsValue({ securityPolicy: 'Aes256_Sha256' });
    }
  }, [securityMode, form]);

  const onFinish = async (values) => {
    if (!sources) {
      console.log('call');
      // const existingSources = JSON.parse(localStorage.getItem('sources') || '[]');
      const createdSource = await createSource(values);
      const newSource = {
        id: createdSource.id,
        ...values
      };
      // localStorage.setItem('sources', JSON.stringify([...existingSources, newSource]));
      onBack();
    }
    else{
      console.log('called');
      
      const testSource = await testSourceConnection(sources.id);
      if(testSource === true){
        message.success('Connected Successfully');
      }
      else{
        message.error('Connection Failed');
      }
    }
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {
        !sources && (
          <div style={{ paddingTop: '10px' }}>
            <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined style={{ fontSize: '16px', justifyContent: 'start' }} />}>
              Back to Sources
            </Button>
          </div>
        )
      }
      <Card style={{ marginTop: '20px' }}>
        {
          !sources && (
            <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Add Source System
            </Typography.Title>
          )
        }

        <Form onFinish={onFinish} layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Source Name"
                name="name"
                rules={[{ required: true, message: 'Please input source name!' }]}
              >
                <Input disabled={sources ? true : false}/>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Source System Type"
                name="type"
                initialValue="opcua"
              >
                <Select disabled={sources ? true : false} onChange={(value) => {
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
                // rules={[{ required: true, message: 'Please input user name!' }]}
              >
                <Input disabled={sources ? true : false}/>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                // rules={[{ required: true, message: 'Please input password!' }]}
              >
                <Input.Password disabled={sources ? true : false} />
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
                  <Select 
                    disabled={sources ? true : false}
                    onChange={(value) => setSecurityMode(value)}
                  >
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
                  <Select disabled={sources ? true : false || securityMode === 'None'}>
                    {securityMode === 'None' ? (
                      <Select.Option value="None">None</Select.Option>
                    ) : (
                      <>
                        <Select.Option value="Basic256Sha256">Basic256Sha256</Select.Option>
                        <Select.Option value="Basic256">Basic256</Select.Option>
                        <Select.Option value="Aes256_Sha256">Aes256_Sha256</Select.Option>
                        <Select.Option value="Aes256">Aes256</Select.Option>
                      </>
                    )}
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
                <Input disabled={sources ? true : false} />
              </Form.Item>
            </Col>
          </Row>


          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button type="primary" htmlType="submit" size="middle">
                {sources ? 'Test Source' : 'Create Source'}
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
