import React from 'react'
import { Form, Input, InputNumber, Space, Checkbox, Typography, Select, Button, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, FileOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { startAgent, stopAgent } from '../../../../services/agent';

const { Text } = Typography;

const Host = ({agents, handleChange}) => {
  console.log(agents,'agesdfsfsdfnts');
  
  const handleStartAgent = async () => {
    try {
      const startAgents = await startAgent(agents.id);
      message.success(startAgents);
    } catch (error) {
      message.error('Failed to start agent');
    }
  } 

  const handleStopAgent = async () => {
    try {
      const stopAgents = await stopAgent(agents.id);
      message.success(stopAgents);
    } catch (error) {
      message.error('Failed to stop agent');
    }
  }



  return (
    <Form layout="vertical">
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Integration with SAP Digital Manufacturing Cloud
      </Text>

      <Form.Item>
        <Checkbox
          name="maintainedThroughSAP"
          checked={agents.maintainedThroughSAP}
          onChange={e => handleChange({ target: { name: 'maintainedThroughSAP', value: e.target.checked } })}
        >
          Maintained Through SAP DMC
        </Checkbox>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        General Settings
      </Text>

      <Form.Item label="Log Level">
        <Select
          name="logLevel"
          value={agents.logLevel || 'Error'}
          onChange={value => handleChange({ target: { name: 'logLevel', value } })}
        >
          <Select.Option value="Error">Error</Select.Option>
          {/* Add other log level options as needed */}
        </Select>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Settings for Windows Service
      </Text>

      <Form.Item>
        <Checkbox
          name="runAsExecutable"
          checked={agents.runAsExecutable}
          onChange={e => handleChange({ target: { name: 'runAsExecutable', value: e.target.checked } })}
        >
          Run Agent Instance as an Executable
        </Checkbox>
      </Form.Item>

      <Form.Item label="Service User Name">
        <Input
          name="serviceUserName"
          value={agents.serviceUserName}
          placeholder=".localsystem"
          onChange={e => handleChange({ target: { name: 'serviceUserName', value: e.target.value } })}
        />
      </Form.Item>

      <Form.Item label="Service User Password">
        <Input.Password
          name="serviceUserPassword"
          value={agents.serviceUserPassword}
          onChange={e => handleChange({ target: { name: 'serviceUserPassword', value: e.target.value } })}
        />
      </Form.Item>

      <Form.Item label="Service Start Mode">
        <Select
          name="serviceStartMode"
          value={agents.serviceStartMode || 'Manual'}
          onChange={value => handleChange({ target: { name: 'serviceStartMode', value } })}
        >
          <Select.Option value="Manual">Manual</Select.Option>
          {/* Add other start mode options as needed */}
        </Select>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="maintainDependentServices"
          checked={agents.maintainDependentServices}
          onChange={e => handleChange({ target: { name: 'maintainDependentServices', value: e.target.checked } })}
        >
          Maintain Dependent Services
        </Checkbox>
      </Form.Item>

      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Settings for Startup of the Agent Instance
      </Text>

      <Form.Item label="Startup Timeout">
        <Space>
          <InputNumber
            name="startupTimeout"
            value={agents.startupTimeout || 5}
            onChange={value => handleChange({ target: { name: 'startupTimeout', value } })}
            style={{ width: '120px' }}
          />
          <span>min</span>
        </Space>
      </Form.Item>

      <Form.Item label="Starting Group">
        <Space>
          <Select
            name="startingGroup"
            value={agents.startingGroup}
            style={{ width: '200px' }}
            onChange={value => handleChange({ target: { name: 'startingGroup', value } })}
          />
          {/* Add action buttons */}
          <Button icon={<PlayCircleOutlined onClick={handleStartAgent}/>} />
          <Button icon={<PauseCircleOutlined />} />
          <Button icon={<FileOutlined />} />
          <Button icon={<EditOutlined />} />
          <Button icon={<CloseOutlined onClick={handleStopAgent}/>} />
        </Space>
      </Form.Item>

      <Form.Item>
        <Checkbox
          name="mustBeStoppedIndividually"
          checked={agents.mustBeStoppedIndividually}
          onChange={e => handleChange({ target: { name: 'mustBeStoppedIndividually', value: e.target.checked } })}
        >
          Agent Instance Must Be Stopped Individually
        </Checkbox>
      </Form.Item>
    </Form>
  )
}

export default Host