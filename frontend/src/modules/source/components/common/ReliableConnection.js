import React from 'react';
import { Form, InputNumber, Typography } from 'antd';

const { Text } = Typography;

const ReliableConnection = ({ source, handleChange }) => {
  return (
    <Form layout="vertical">
      <Form.Item>
        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Reliable Connection
        </Text>
        <Form.Item label="Max Number of Retries" style={{ marginBottom: 16 }}>
          <InputNumber
            name="reliableConnection.maxRetries"
            value={source.reliableConnection.maxRetries || 0}
            onChange={value => handleChange({ target: { name: 'reliableConnection.maxRetries', value } })}
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        <Form.Item label="Retry Interval" style={{ marginBottom: 16 }}>
          <InputNumber
            name="reliableConnection.retryInterval"
            value={source.reliableConnection.retryInterval || 0}
            onChange={value => handleChange({ target: { name: 'reliableConnection.retryInterval', value } })}
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>
      </Form.Item>
    </Form>
  );
};

export default ReliableConnection; 