import React from 'react'
import { Form, Input, InputNumber, Space, Checkbox, Typography, Select, Button, Radio } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, FileOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const MessageDelivery = ({agents, handleChange}) => {
  return (
    <Form layout="vertical">
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Reliable Connection
      </Text>

      <Form.Item label="Max. Number of Retries">
        <InputNumber
          name="maxRetries"
          value={agents.maxRetries || 0}
          min={0}
          style={{ width: '100%' }}
          onChange={value => handleChange({ target: { name: 'maxRetries', value } })}
        />
      </Form.Item>

      <Form.Item label="Retry Interval">
        <Space>
          <InputNumber
            name="retryInterval"
            value={agents.retryInterval || 0}
            min={0}
            style={{ width: '200px' }}
            onChange={value => handleChange({ target: { name: 'retryInterval', value } })}
          />
          <Text>s</Text>
        </Space>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Failed Messages Persistence
      </Text>

      <Form.Item label="Keep Last Message">
        <Select
          name="keepLastMessage"
          value={agents.keepLastMessage || 'Keep All Messages'}
          style={{ width: '100%' }}
          onChange={value => handleChange({ target: { name: 'keepLastMessage', value } })}
        >
          <Select.Option value="delete">Keep All Messages</Select.Option>
          <Select.Option value="keep">Keep First Message</Select.Option>
          <Select.Option value="deleteAfter">Keep Last Message</Select.Option>
          <Select.Option value="deleteAfter">Keep Message Untill Expiry</Select.Option>
          <Select.Option value="deleteAfter">Keep No Message</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Delete Messages After">
        <Space>
          <InputNumber
            name="deleteAfter"
            value={agents.deleteAfter || 60}
            min={0}
            style={{ width: '200px' }}
            onChange={value => handleChange({ target: { name: 'deleteAfter', value } })}
          />
          <Text>min</Text>
        </Space>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Lifetime
      </Text>

      <Form.Item>
        <Space>
          <InputNumber
            name="lifetimeDays"
            value={agents.lifetimeDays || 0}
            min={0}
            style={{ width: '100px' }}
            onChange={value => handleChange({ target: { name: 'lifetimeDays', value } })}
          />
          <Text>Days</Text>
          <InputNumber
            name="lifetimeHours"
            value={agents.lifetimeHours || 0}
            min={0}
            style={{ width: '100px' }}
            onChange={value => handleChange({ target: { name: 'lifetimeHours', value } })}
          />
          <Text>Hours</Text>
          <InputNumber
            name="lifetimeMinutes"
            value={agents.lifetimeMinutes || 0}
            min={0}
            style={{ width: '100px' }}
            onChange={value => handleChange({ target: { name: 'lifetimeMinutes', value } })}
          />
          <Text>Minutes</Text>
        </Space>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Message Bundling
      </Text>

      <Form.Item>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Checkbox
              name="fixedNumberMessages"
              checked={agents.fixedNumberMessages}
              onChange={e => handleChange({ target: { name: 'fixedNumberMessages', value: e.target.checked } })}
            >
              Fixed Number of Messages
            </Checkbox>
            <InputNumber
              name="fixedNumber"
              value={agents.fixedNumber || 0}
              min={0}
              disabled={!agents.fixedNumberMessages}
              style={{ width: '100px' }}
              onChange={value => handleChange({ target: { name: 'fixedNumber', value } })}
            />
          </Space>
          <Space>
            <Checkbox
              name="maxAccumulationTime"
              checked={agents.maxAccumulationTime}
              onChange={e => handleChange({ target: { name: 'maxAccumulationTime', value: e.target.checked } })}
            >
              Maximum Accumulation Time
            </Checkbox>
            <InputNumber
              name="accumulationTime"
              value={agents.accumulationTime || 0}
              min={0}
              disabled={!agents.maxAccumulationTime}
              style={{ width: '100px' }}
              onChange={value => handleChange({ target: { name: 'accumulationTime', value } })}
            />
            <Text>s</Text>
          </Space>
        </Space>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Notification Message Queue and Dispatch Settings
      </Text>

      <Form.Item>
        <Checkbox
          name="processExactlyOnce"
          checked={agents.processExactlyOnce}
          onChange={e => handleChange({ target: { name: 'processExactlyOnce', value: e.target.checked } })}
        >
          Process Notification Messages Exactly Once in Order
        </Checkbox>
      </Form.Item>
    </Form>
  )
}

export default MessageDelivery;