import React from 'react';
import { Form, Input, InputNumber, Select, Typography, Space, Checkbox, Button } from 'antd';

const { Text } = Typography;

const OPCUASession = ({ source, handleChange }) => {
  return (
    <Form layout="vertical">
    <Form.Item>
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Discovery
      </Text>

      <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
        {/* Protocol Selection - Aligned left */}
        <div style={{ marginBottom: '16px' }}>
          <Checkbox
            checked={source.session.opcTcp}
            onChange={e => handleChange({ target: { name: 'session.opcTcp', value: e.target.checked } })}
            style={{ marginRight: '24px' }}
          >
            OPC TCP
          </Checkbox>
          <Checkbox
            checked={source.session.http}
            onChange={e => handleChange({ target: { name: 'session.http', value: e.target.checked } })}
            style={{ marginRight: '24px' }}
          >
            HTTP
          </Checkbox>
          <Checkbox
            checked={source.session.httpPrivate}
            onChange={e => handleChange({ target: { name: 'session.httpPrivate', value: e.target.checked } })}
          >
            HTTP (Private)
          </Checkbox>
        </div>

        {/* Discovery Server Row */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <Form.Item label="Discovery Server" style={{ marginBottom: 0 }}>
              <Select
                value={source.session.discoveryServer}
                onChange={value => handleChange({ target: { name: 'session.discoveryServer', value } })}
                style={{ width: '100%' }}
              >
                <Select.Option value="localhost">localhost</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Button style={{ marginTop: 29 }}>Browse Domain</Button>
          <Button style={{ marginTop: 29 }}>Start Discovery</Button>
        </div>

        {/* Server Endpoint Row */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <Form.Item label="Server Endpoint" style={{ marginBottom: 0 }}>
              <Input
                name="session.serverEndpoint"
                value={source.session.serverEndpoint}
                onChange={e => handleChange({ target: { name: 'session.serverEndpoint', value: e.target.value } })}
              />
            </Form.Item>
          </div>
          <Button style={{ marginTop: 29 }}>Select Endpoint</Button>
        </div>

        {/* Update Server Configuration */}
        <div style={{ marginTop: '8px' }}>
          <Checkbox
            checked={source.session.updateServerConfig}
            onChange={e => handleChange({ target: { name: 'session.updateServerConfig', value: e.target.checked } })}
          >
            Update Server Configuration on Connection
          </Checkbox>
        </div>
      </Space>
    </Form.Item>

    <Form.Item>
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Session
      </Text>

      <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
        <Form.Item label="Name" style={{ marginBottom: 8 }}>
          <Input
            value={source.session.sessionName}
            onChange={e => handleChange({ target: { name: 'session.sessionName', value: e.target.value } })}
            placeholder="SAPClientSession"
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Form.Item label="Keep-Alive Interval" style={{ flex: 1, marginBottom: 0 }}>
            <InputNumber
              value={source.session.keepAliveInterval}
              onChange={value => handleChange({ target: { name: 'session.keepAliveInterval', value } })}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Package Sizes for Services
        </Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="Reading"
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              value={source.session.readingSize || 0}
              onChange={value => handleChange({ target: { name: 'session.readingSize', value } })}
              min={0}
              style={{ width: '100px' }}
            />
          </Form.Item>

          <Form.Item
            label="Writing"
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              value={source.session.writingSize || 0}
              onChange={value => handleChange({ target: { name: 'session.writingSize', value } })}
              min={0}
              style={{ width: '100px' }}
            />
          </Form.Item>

          <Form.Item
            label="Browsing"
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              value={source.session.browsingSize || 0}
              onChange={value => handleChange({ target: { name: 'session.browsingSize', value } })}
              min={0}
              style={{ width: '100px' }}
            />
          </Form.Item>
        </Space>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox
            checked={source.session.tolerantTypeCheck}
            onChange={e => handleChange({ target: { name: 'session.tolerantTypeCheck', value: e.target.checked } })}
          >
            Tolerant Type Check
          </Checkbox>

          <Checkbox
            checked={source.session.structuredDataTypes}
            onChange={e => handleChange({ target: { name: 'session.structuredDataTypes', value: e.target.checked } })}
          >
            Support for Structured Data Types
          </Checkbox>

          <Checkbox
            checked={source.session.abstractDataTypes}
            onChange={e => handleChange({ target: { name: 'session.abstractDataTypes', value: e.target.checked } })}
          >
            Support for Abstract Data Types
          </Checkbox>
        </Space>

        <Form.Item label="Acceptable Status Code" style={{ marginBottom: 8 }}>
          <Select
            value={source.session.acceptableStatusCode}
            onChange={value => handleChange({ target: { name: 'session.acceptableStatusCode', value } })}
            style={{ width: '100%' }}
          >
            <Select.Option value="atLeastGood">At Least Good</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Pending Requests" style={{ marginBottom: 0 }}>
          <InputNumber
            value={source.session.pendingRequests}
            onChange={value => handleChange({ target: { name: 'session.pendingRequests', value } })}
            min={0}
            style={{ width: '100px' }}
          />
        </Form.Item>
      </Space>
    </Form.Item>
  </Form>
  );
};

export default OPCUASession; 