import React from 'react'
import { Form, Select, Checkbox, Typography, InputNumber, Radio, Input, Button } from 'antd';

const { Text } = Typography;

const NotificationProcessing = ({agents, handleChange}) => {
  return (
    <Form layout="vertical">
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Notification Message Queue and Dispatch Settings
      </Text>

      <Form.Item label="Storage Method">
        <Select
          name="storageMethod"
          value={agents.storageMethod || 'In Memory Only'}
          style={{ width: '100%' }}
          onChange={value => handleChange({ target: { name: 'storageMethod', value } })}
        >
          <Select.Option value="In Memory Only">In Memory Only</Select.Option>
          <Select.Option value="In Memory and File System">In Memory and File System</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="resendFailedMessages"
          checked={agents.resendFailedMessages}
          onChange={e => handleChange({ target: { name: 'resendFailedMessages', value: e.target.checked } })}
        >
          Resend Failed Messages Automatically
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="keepExpiredMessages"
          checked={agents.keepExpiredMessages}
          onChange={e => handleChange({ target: { name: 'keepExpiredMessages', value: e.target.checked } })}
        >
          Keep Expired Messages
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="processMessagesInOrder"
          checked={agents.processMessagesInOrder}
          onChange={e => handleChange({ target: { name: 'processMessagesInOrder', value: e.target.checked } })}
        >
          Process Notification Messages Exactly Once in Order
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="keepCopiesInJournal"
          checked={agents.keepCopiesInJournal}
          onChange={e => handleChange({ target: { name: 'keepCopiesInJournal', value: e.target.checked } })}
        >
          Keep Copies of Queued Notification Messages in Journal Queue
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="makeMessagesRecoverable"
          checked={agents.makeMessagesRecoverable}
          onChange={e => handleChange({ target: { name: 'makeMessagesRecoverable', value: e.target.checked } })}
        >
          Make Queued Notification Messages Recoverable
        </Checkbox>
      </Form.Item>

      <Form.Item label="Max. Queued Messages">
        <InputNumber
          name="maxQueuedMessages"
          value={agents.maxQueuedMessages || 1000}
          onChange={value => handleChange({ target: { name: 'maxQueuedMessages', value } })}
        />
      </Form.Item>

      <Form.Item label="Max. Dispatch Threads">
        <InputNumber
          name="maxDispatchThreads"
          value={agents.maxDispatchThreads || 5}
          onChange={value => handleChange({ target: { name: 'maxDispatchThreads', value } })}
        />
        <span style={{ marginLeft: '8px' }}>x 8 CPU core(s) = 40 Maximum Dispatch Threads</span>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Enhanced Notification Processing
      </Text>

      <Form.Item>
        <Radio.Group
          name="enhancedProcessing"
          value={agents.enhancedProcessing || 'none'}
          onChange={e => handleChange({ target: { name: 'enhancedProcessing', value: e.target.value } })}
        >
          <Radio value="none">No Enhanced Notification Processing</Radio>
          <Radio value="destination">Destination System Calls with Response Processing</Radio>
          <Radio value="automatic">Automatic Configuration Backup</Radio>
          <Radio value="customer">Customer-Owned Enhancement</Radio>
        </Radio.Group>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Details of the Enhancement Implementation
      </Text>

      <Form.Item 
        label="Dynamic Link Library" 
        style={{ marginLeft: '24px', width: 'calc(100% - 24px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Input
            name="dynamicLinkLibrary"
            value={agents.dynamicLinkLibrary}
            disabled={agents.enhancedProcessing !== 'customer'}
            style={{ flex: 1 }}
          />
          <Button style={{ marginLeft: '8px', width: '80px' }}>Browse</Button>
        </div>
      </Form.Item>

      <Form.Item 
        label="Class" 
        style={{ marginLeft: '24px', width: 'calc(100% - 24px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Select
            name="class"
            value={agents.class}
            disabled={agents.enhancedProcessing !== 'customer'}
            style={{ flex: 1 }}
          />
          <Button style={{ marginLeft: '8px', width: '80px' }}>Reset</Button>
        </div>
      </Form.Item>

      <Text strong style={{ display: 'block', marginTop: '16px' }}>
        Maintain Destination System for Notification Enhancement
      </Text>

      <div style={{ marginTop: '8px' }}>
        <Button>Create Destination System</Button>
        <Button style={{ marginLeft: '8px' }}>Delete Destination System</Button>
      </div>

      <div style={{ marginTop: '16px' }}>
        <Form.Item label="Status">
        <Input
          name="status"
          value={agents.status}
          placeholder="Destination system not required"
          onChange={e => handleChange({ target: { name: 'status', value: e.target.value } })}
        />
      </Form.Item>
      </div>
    </Form>
  )
}

export default NotificationProcessing