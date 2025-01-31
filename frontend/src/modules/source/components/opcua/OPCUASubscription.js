import React from 'react';
import { Form, Input, InputNumber, Space, Typography, Select, Checkbox } from 'antd';

const { Text } = Typography;

const OPCUASubscription = ({ source, handleChange }) => {
  return (
    <Form layout="vertical">
    <Form.Item>
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '16px' }}>
        Subscription Parameters
      </Text>

      <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '2px', marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="Display Name"
            style={{ marginBottom: 8 }}
          >
            <Input
              placeholder="SAPClient_DefaultSubscription"
              value={source.subscription.displayName}
              onChange={e => handleChange({ target: { name: 'subscription.displayName', value: e.target.value } })}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} align="baseline">
            <Form.Item
              label="Event Interval"
              style={{ marginBottom: 8 }}
            >
              <Space>
                <InputNumber
                  value={source.subscription.eventInterval || 1000}
                  onChange={value => handleChange({ target: { name: 'subscription.eventInterval', value } })}
                  style={{ width: '100px' }}
                />
                <span>ms</span>
              </Space>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} align="baseline">
            <Form.Item
              label="Keep-Alive Interval"
              style={{ marginBottom: 8 }}
            >
              <Space>
                <InputNumber
                  value={source.subscription.keepAliveInterval || 10}
                  onChange={value => handleChange({ target: { name: 'subscription.keepAliveInterval', value } })}
                  style={{ width: '100px' }}
                />
                <span>s</span>
              </Space>
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} align="baseline">
            <Form.Item
              label="Lifetime Interval"
              style={{ marginBottom: 8 }}
            >
              <Space>
                <InputNumber
                  value={source.subscription.lifetimeInterval || 1000}
                  onChange={value => handleChange({ target: { name: 'subscription.lifetimeInterval', value } })}
                  style={{ width: '100px' }}
                />
                <span>s</span>
              </Space>
            </Form.Item>
          </Space>

          <Form.Item
            label="Maximum Notifications Per Event"
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              value={source.subscription.maxNotificationsPerEvent || 10}
              onChange={value => handleChange({ target: { name: 'subscription.maxNotificationsPerEvent', value } })}
              style={{ width: '100px' }}
            />
          </Form.Item>

          <Form.Item
            label="Acceptable Status Code"
            style={{ marginBottom: 8 }}
          >
            <Select
              value={source.subscription.acceptableStatusCode || 'Any Status Code'}
              onChange={value => handleChange({ target: { name: 'subscription.acceptableStatusCode', value } })}
              style={{ width: '200px' }}
            >
              <Select.Option value="Any Status Code">Any Status Code</Select.Option>
              {/* Add other status code options as needed */}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Checkbox
              checked={source.subscription.enableEditMode}
              onChange={e => handleChange({ target: { name: 'subscription.enableEditMode', value: e.target.checked } })}
            >
              Enable Edit Mode for Subscription Items
            </Checkbox>
          </Form.Item>
        </Space>
      </div>

      {/* Monitored Item Parameters Section */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '16px' }}>
        Monitored Item Parameters
      </Text>

      <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '2px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item
            label="Queue Size"
            style={{ marginBottom: 8 }}
          >
            <InputNumber
              value={source.subscription.queueSize || 10}
              onChange={value => handleChange({ target: { name: 'subscription.queueSize', value } })}
              style={{ width: '100px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Checkbox
              checked={source.subscription.discardOldest}
              onChange={e => handleChange({ target: { name: 'subscription.discardOldest', value: e.target.checked } })}
            >
              Discard Oldest
            </Checkbox>
          </Form.Item>
        </Space>
      </div>
    </Form.Item>
  </Form>
  );
};

export default OPCUASubscription; 