import React from 'react'
import { Form, Input, InputNumber, Space, Checkbox, Typography, Select, Button, Radio } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, FileOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Notification = ({agents, handleChange}) => {
  return (
    <Form layout="vertical">
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Trigger
      </Text>

      <Form.Item>
        <Checkbox
          name="enabled"
          checked={agents.enabled}
          onChange={e => handleChange({ target: { name: 'enabled', value: e.target.checked } })}
        >
          Enabled
        </Checkbox>
      </Form.Item>

      <Form.Item label="Trigger Type">
        <Select
          name="triggerType"
          value={agents.triggerType || 'Always'}
          style={{ width: '100%' }}
          onChange={value => handleChange({ target: { name: 'triggerType', value } })}
        >
          <Select.Option value="Always">Always</Select.Option>
          <Select.Option value="On True">On Error</Select.Option>
          <Select.Option value="On false">On Success</Select.Option>
          <Select.Option value="On Warning">While True</Select.Option>
          <Select.Option value="On Information">While False</Select.Option>
        </Select>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Triggering Subscription Items
      </Text>

      <Form.Item>
        <Radio.Group 
          name="triggerSubscription"
          value={agents.triggerSubscription}
          onChange={e => handleChange({ target: { name: 'triggerSubscription', value: e.target.value } })}
        >
          <Space direction="vertical">
            <Radio value="onlyUsed">Only Subscription Items Used in Trigger Condition</Radio>
            <Radio value="usedInCondition">Subscription Items Used in Trigger Condition or Output Expressions</Radio>
            <Radio value="all">All Subscription Items</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    </Form>
  )
}

export default Notification;