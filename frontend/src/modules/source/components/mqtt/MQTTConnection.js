import React from 'react';
import { Form, Input, Select, Checkbox, Typography, Space } from 'antd';

const { Text } = Typography;

const MQTTConnection = ({ source, handleChange }) => {
  return (
    <Form layout="vertical">
      <Form.Item>
        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Last Will Settings
        </Text>
        <Form.Item label="Topic Name">
          <Input
            name="connection.topicName"
            value={source.connection.topicName}
            onChange={e => handleChange({ target: { name: 'connection.topicName', value: e.target.value } })}
          />
        </Form.Item>
        <Form.Item label="Message">
          <Input.TextArea
            rows={4}
            name="connection.message"
            value={source.connection.message}
            onChange={e => handleChange({ target: { name: 'connection.message', value: e.target.value } })}
          />
        </Form.Item>
        <Form.Item label="QoS">
          <Select
            name="connection.qos"
            value={source.connection.qos}
            onChange={value => handleChange({ target: { name: 'connection.qos', value } })}
          >
            <Select.Option value="0">0 - At most once</Select.Option>
            <Select.Option value="1">1 - At least once</Select.Option>
            <Select.Option value="2">2 - Exactly once</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={source.connection.retainMessage}
            onChange={e => handleChange({ target: { name: 'connection.retainMessage', value: e.target.checked } })}
          >
            Retain Message
          </Checkbox>
        </Form.Item>

        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Proxy Settings
        </Text>
        <Form.Item label="Proxy URI">
          <Input
            name="connection.proxyUri"
            value={source.connection.proxyUri}
            onChange={e => handleChange({ target: { name: 'connection.proxyUri', value: e.target.value } })}
          />
        </Form.Item>
        <Space style={{ width: '100%', marginTop: 16 }}>
          <Form.Item label="Proxy Username" style={{ flex: 1 }}>
            <Input
              name="connection.proxyUsername"
              value={source.connection.proxyUsername}
              onChange={e => handleChange({ target: { name: 'connection.proxyUsername', value: e.target.value } })}
            />
          </Form.Item>
          <Form.Item label="Proxy Password" style={{ flex: 1 }}>
            <Input.Password
              name="connection.proxyPassword"
              value={source.connection.proxyPassword}
              onChange={e => handleChange({ target: { name: 'connection.proxyPassword', value: e.target.value } })}
            />
          </Form.Item>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default MQTTConnection; 