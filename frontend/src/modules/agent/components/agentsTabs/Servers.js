import React from 'react'
import { Form, Input, Space, Checkbox, Typography, Radio, Button } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Servers = ({agents, handleChange}) => {
  return (
    <div style={{ display: 'flex', gap: '24px', padding: '16px' }}>
      {/* Left Column - Server Type */}
      <div style={{ width: '250px' }}>
        <Form.Item label="Server Type">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox disabled>SAP MII Query Server</Checkbox>
            <Checkbox disabled>SAP MII Query Server (Before 12.2)</Checkbox>
            <Checkbox disabled>SAP NW RFC Server</Checkbox>
            <Checkbox disabled>SAP ODA RFC Server</Checkbox>
            <Checkbox disabled>SAP EWM RFC Server</Checkbox>
            <Checkbox checked >WebSocket Server</Checkbox>
            <Checkbox disabled>OPC UA Server</Checkbox>
            <Checkbox disabled>Pco Web Server</Checkbox>
          </Space>
        </Form.Item>
      </div>

      {/* Right Column - Settings */}
      <div style={{ flex: 1, border: '1px solid #f0f0f0', padding: '16px', borderRadius: '2px' }}>
        <Form layout="vertical">
          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '16px' }}>
            WebSocket Settings
          </Text>

          <Form.Item style={{ marginBottom: '24px' }}>
            <Checkbox
              name="servers.allowTagChanges"
              checked={agents.servers.serverSettings.allowTagChanges}
              onChange={e => handleChange({ target: { name: 'servers.allowTagChanges', value: e.target.checked } })}
            >
              Allow Changes to Tag Values
            </Checkbox>
          </Form.Item>

          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '16px' }}>
            Connection Settings
          </Text>

          <Form.Item style={{ marginBottom: '24px' }}>
            <Radio.Group
              name="servers.protocol"
              value={agents.servers.serverSettings.protocol}
              onChange={e => handleChange({ target: { name: 'servers.protocol', value: e.target.value } })}
            >
              <Space direction="vertical">
                <Radio value="unsecured">Unsecured Protocol</Radio>
                <Radio value="secured">Secured Protocol (WSS)</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '16px' }}>
            Communication Settings
          </Text>

          <Form.Item label="Port" style={{ marginBottom: '16px' }}>
            <Space>
              <Input
                name="servers.port"
                type="number"
                value={agents.servers.serverSettings.port || '8082'}
                onChange={e => handleChange({ target: { name: 'servers.port', value: e.target.value } })}
                style={{ width: '120px' }}
              />
              <Button icon={<FileOutlined />} size="small" style={{ padding: '4px 8px' }} />
            </Space>
          </Form.Item>

          <Form.Item label="Server Certificate" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                name="servers.serverCertificate"
                value={agents.servers.serverSettings.serverCertificate}
                style={{ flex: 1 }}
              />
              <Button size="small">Add</Button>
              <Button size="small">Delete</Button>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Checkbox
              name="servers.requestClientCertificate"
              checked={agents.servers.serverSettings.requestClientCertificate}
              onChange={e => handleChange({ target: { name: 'servers.requestClientCertificate', value: e.target.checked } })}
            >
              Request Client Certificate
            </Checkbox>
          </Form.Item>

          <Form.Item label="Client Root Certificate" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                name="servers.clientRootCertificate"
                value={agents.servers.serverSettings.clientRootCertificate}
                style={{ flex: 1 }}
              />
              <Button size="small">Add</Button>
              <Button size="small">Delete</Button>
            </div>
          </Form.Item>

          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '16px' }}>
            Message Format
          </Text>

          <Form.Item style={{ marginBottom: '24px' }}>
            <Radio.Group
              name="servers.messageFormat"
              value={agents.servers.serverSettings.messageFormat}
              onChange={e => handleChange({ target: { name: 'servers.messageFormat', value: e.target.value } })}
            >
              <Space direction="vertical">
                <Radio value="json">JSON</Radio>
                <Radio value="xml">XML</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Text type="secondary" style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '16px' }}>
            Maintain Destination System for WebSocket
          </Text>

          <Space style={{ marginBottom: '16px' }}>
            <Button size="small">Create Destination System</Button>
            <Button size="small">Delete Destination System</Button>
          </Space>

          <Form.Item label="Status">
            <Input
              value="Destination system used in configuration"
              disabled
              style={{ width: '100%' }}
              suffix={<div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a' }} />}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Servers;