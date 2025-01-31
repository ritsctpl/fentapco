import React from 'react';
import { Form, Input, InputNumber, Select, Typography, Space, Checkbox } from 'antd';

const { Text } = Typography;

const OPCUASession = ({ destination, handleChange }) => {
  return (
    <Form layout="vertical">
      {/* Client Configuration */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        Client Configuration
      </Text>
      <Form.Item label="Name">
        <Input
          value={destination.session.name}
          onChange={e => handleChange({ target: { name: 'session.name', value: e.target.value } })}
          placeholder="OPC_UA_SRC"
        />
      </Form.Item>

      {/* Discovery Section */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        Discovery
      </Text>

      <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
        {/* Protocol Selection */}
        <div style={{ marginBottom: '16px' }}>
          <Checkbox
            checked={destination.session.opcTcp}
            onChange={e => handleChange({ target: { name: 'session.opcTcp', value: e.target.checked } })}
            style={{ marginRight: '24px' }}
          >
            OPC TCP
          </Checkbox>
          <Checkbox
            checked={destination.session.http}
            onChange={e => handleChange({ target: { name: 'session.http', value: e.target.checked } })}
            style={{ marginRight: '24px' }}
          >
            HTTP
          </Checkbox>
          <Checkbox
            checked={destination.session.httpPrivate}
            onChange={e => handleChange({ target: { name: 'session.httpPrivate', value: e.target.checked } })}
          >
            HTTP (Private)
          </Checkbox>
        </div>

        <Form.Item label="Discovery Server">
          <Select
            value={destination.session.discoveryServer}
            onChange={value => handleChange({ target: { name: 'session.discoveryServer', value } })}
            style={{ width: '100%' }}
          >
            <Select.Option value="localhost">localhost</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Server Endpoint">
          <Input
            value={destination.session.serverEndpoint}
            onChange={e => handleChange({ target: { name: 'session.serverEndpoint', value: e.target.value } })}
          />
        </Form.Item>

        <Checkbox
          checked={destination.session.updateServerConfig}
          onChange={e => handleChange({ target: { name: 'session.updateServerConfig', value: e.target.checked } })}
        >
          Update Server Configuration on Connection
        </Checkbox>
      </Space>

      {/* Session Section */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Session
      </Text>

      <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
        <Form.Item label="Name">
          <Input
            value={destination.session.sessionName}
            onChange={e => handleChange({ target: { name: 'session.sessionName', value: e.target.value } })}
            placeholder="SAPClientSession"
          />
        </Form.Item>

        <Form.Item label="Keep-Alive Interval">
          <InputNumber
            value={destination.session.keepAliveInterval}
            onChange={value => handleChange({ target: { name: 'session.keepAliveInterval', value } })}
            min={0}
            style={{ width: '100px' }}
            addonAfter="s"
          />
        </Form.Item>

        {/* Package Sizes Section */}
        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '8px', marginBottom: '8px' }}>
          Package Sizes for Services
        </Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Reading">
            <InputNumber
              value={destination.session.readingSize}
              onChange={value => handleChange({ target: { name: 'session.readingSize', value } })}
              min={0}
              style={{ width: '100px' }}
            />
          </Form.Item>

          <Form.Item label="Writing">
            <InputNumber
              value={destination.session.writingSize}
              onChange={value => handleChange({ target: { name: 'session.writingSize', value } })}
              min={0}
              style={{ width: '100px' }}
            />
          </Form.Item>

          <Form.Item label="Browsing">
            <InputNumber
              value={destination.session.browsingSize}
              onChange={value => handleChange({ target: { name: 'session.browsingSize', value } })}
              min={0}
              style={{ width: '100px' }}
            />
          </Form.Item>
        </Space>

        {/* Data Type Support */}
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox
            checked={destination.session.tolerantTypeCheck}
            onChange={e => handleChange({ target: { name: 'session.tolerantTypeCheck', value: e.target.checked } })}
          >
            Tolerant Type Check
          </Checkbox>

          <Checkbox
            checked={destination.session.structuredDataTypes}
            onChange={e => handleChange({ target: { name: 'session.structuredDataTypes', value: e.target.checked } })}
          >
            Support for Structured Data Types
          </Checkbox>

          <Checkbox
            checked={destination.session.abstractDataTypes}
            onChange={e => handleChange({ target: { name: 'session.abstractDataTypes', value: e.target.checked } })}
          >
            Support for Abstract Data Types
          </Checkbox>
        </Space>

        <Form.Item label="Acceptable Status Code">
          <Select
            value={destination.session.acceptableStatusCode}
            onChange={value => handleChange({ target: { name: 'session.acceptableStatusCode', value } })}
            style={{ width: '100%' }}
          >
            <Select.Option value="atLeastGood">At Least Good</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Pending Requests">
          <InputNumber
            value={destination.session.pendingRequests}
            onChange={value => handleChange({ target: { name: 'session.pendingRequests', value } })}
            min={0}
            style={{ width: '100px' }}
          />
        </Form.Item>

        {/* Tag Persistence */}
        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Tag Persistence
        </Text>

        <Checkbox
          checked={destination.session.useUrlForNamespace}
          onChange={e => handleChange({ target: { name: 'session.useUrlForNamespace', value: e.target.checked } })}
        >
          Use URL for Storing the Namespace Information of Tag Node IDs
        </Checkbox>
      </Space>
    </Form>
  );
};

export default OPCUASession; 