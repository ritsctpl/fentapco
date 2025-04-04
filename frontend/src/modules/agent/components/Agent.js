import React, { useState, useEffect } from 'react';
import { Button, Popconfirm, Table, Modal, Form, Input, Select, message, TreeSelect } from 'antd';
import { CopyOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, CarryOutOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import '../style.css';
import AgentForm from './AgentForm';
import AgentDetails from './AgentDetails';
import AgentNotification from './AgentNotification';
import { MdOutlineNotificationAdd } from 'react-icons/md';
import { createAgent, deleteAgent, fetchAgents, getSubscribedTags, getSubscriptionTag, startAgent, stopAgent } from '../../../services/agent';
import { createNotification, deleteNotification } from '../../../services/notificationService';
import { getAllNodes } from '../../../services/source';
import { fetchDestinations } from '../../../services/destination';

const AgentScreen = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(0);
  const [call, setCall] = useState(0);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [form] = Form.useForm();
  const [actionType, setActionType] = useState(null);
  const [condition, setCondition] = useState('none');
  // const [treeData, setTreeData] = useState([]);
  const [nodeId, setNodeId] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [subscribedTags, setSubscribedTags] = useState([]);
  const [tagAliasRows, setTagAliasRows] = useState([{ name: '', nodeId: '' }]);

  useEffect(() => {
    const fetchDataAgents = async () => {
      const agents = await fetchAgents();
      console.log(agents, 'agents');

      setAgents(agents);
    };
    fetchDataAgents();
  }, [call]);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const fetchedDestination = await fetchDestinations();
        setDestinations(fetchedDestination);
      } catch (error) {
        console.error('Error fetching sources:', error);
      }
    };
    loadDestinations();
  }, []);

  const handleAgentClick = (agent) => {
    setSelectedAgent('new');
    setCurrentAgent(agent);
  };

  const handleNotificationClick = async (notification, agent) => {
    console.log(notification, 'notification');
    setIsNotificationModalVisible(true);
    
    // Set the destination field with the destination name
    form.setFieldsValue({
      ...notification,
      destination: notification.destination.name
    });
    
    // Set the selected destination for the dropdown
    setSelectedDestination(notification.destination);
    
    setSelectedNotification(notification);
    
    // If you have tag alias mapping, set it
    if (notification.tagAliasMap) {
      const tagAliasRows = Object.entries(notification.tagAliasMap).map(([name, nodeId]) => ({
        name,
        nodeId
      }));
      setTagAliasRows(tagAliasRows);
    }
  };

  const handleBack = () => {
    setSelectedAgent(null);
    setSelectedNotification(null);
    setCall(call + 1);
  };

  const handleAddAgent = () => {
    setSelectedAgent('new');
    setCurrentAgent(null);
  };

  const handleCopyConfirm = async (agentToCopy) => {
    const { id, ...rest } = agentToCopy;
    const agentToAdd = {
      ...rest,
      name: `${rest.name}_Copy`
    };

    const createCopyAgent = await createAgent(agentToAdd);
  };

  const handleAddNotification = async (agent) => {
    
    setCurrentAgent(agent);
    setIsNotificationModalVisible(true);
    
    try {
      console.log('call');
      const fetchedSubscribedTags = await getSubscribedTags(agent.id);
      // Transform the array of strings into the format needed for Select options
      const formattedTags = fetchedSubscribedTags.map(tag => ({
        key: tag,
        value: tag,
        title: tag
      }));
      setSubscribedTags(formattedTags);
    } catch (error) {
      console.error('Error fetching subscribed tags:', error);
    }
  };

  const handleAddTagAliasRow = () => {
    setTagAliasRows([...tagAliasRows, { name: '', nodeId: '' }]);
  };

  const handleTagAliasChange = (index, field, value) => {
    const newRows = [...tagAliasRows];
    newRows[index][field] = value;
    setTagAliasRows(newRows);
  };

  const handleRemoveTagAliasRow = (index) => {
    const newRows = tagAliasRows.filter((_, i) => i !== index);
    setTagAliasRows(newRows);
  };

  const resetTagAliasTable = () => {
    setTagAliasRows([{ name: '', nodeId: '' }]);
  };

  const handleNotificationSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // Create tagAliasMap from rows
      const tagAliasMap = {};
      tagAliasRows.forEach(row => {
        if (row.name && row.nodeId) {
          tagAliasMap[row.name] = row.nodeId;
        }
      });

      const newNotification = {
        ...values,
        destination: selectedDestination,
        condition: values.condition ? values.condition : 'none',
        agentId: currentAgent?.id,
        tagAliasMap
      };

      console.log(newNotification, 'newNotification');

      const createNotifications = await createNotification(newNotification);
      
      const newNotificationData = {
        ...createNotifications,
        id: createNotifications.id,
      };
      
      const updatedAgents = agents.map(agent => {
        if (agent.id === currentAgent.id) {
          return {
            ...agent,
            notifications: [...(agent.notifications || []), newNotificationData]
          };
        }
        return agent;
      });

      setAgents(updatedAgents);
      setIsNotificationModalVisible(false);
      form.resetFields();
      resetTagAliasTable();
      message.success('Notification Created');
      
      // const subscriptionTag = await getSubscriptionTag(nodeId, currentAgent.id, createNotifications?.id);
      // if (subscriptionTag) {
      //   message.success('Subscription Created');
      // } else {
      //   message.error('Failed to Subscribe');
      // }
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Failed to create notification');
      }
    }
  };

  const handleStartAgent = async (record) => {
    message.destroy();
    try {
      const startAgents = await startAgent(record.id);
      message.success(startAgents);
    } catch (error) {
      message.error('Failed to start agent');
    }
  }

  const handleStopAgent = async (record) => {
    message.destroy();
    try {
      const stopAgents = await stopAgent(record.id);
      message.success(stopAgents);
    } catch (error) {
      message.error('Failed to stop agent');
    }
  }

  const handleDeleteAgent = async (agentId) => {
    const deleteAgents = await deleteAgent(agentId);
    setCall(call + 1);
  };

  if (selectedAgent === 'new') {
    return <AgentForm onBack={handleBack} agent={currentAgent} />;
  }

  if (selectedAgent && selectedNotification) {
    return <AgentNotification agentId={selectedAgent} notificationId={selectedNotification} onBack={handleBack} />;
  }

  if (selectedAgent) {
    return <AgentDetails agents={selectedAgent} onBack={handleBack} />;
  }


  const handleDeleteNotification = async (notificationId) => {
    const deleteNotifications = await deleteNotification(notificationId);
    setCall(call + 1);
  }

  const handleDestinationChange = (value) => {
    const destination = destinations.find(destination => destination.name === value);
    setSelectedDestination(destination);
  };


  return (
    <div className="agents-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Agents</h2>
        <Button type="primary" onClick={() => handleAddAgent(agents)}>Add Agent</Button>
      </div>
      <Table
        dataSource={agents}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <Table
              dataSource={record.notifications || []}
              rowKey="id"
              pagination={false}
              showHeader={record.notifications?.length > 0 ? true : false}
              onRow={(notification) => ({
                onClick: (e) => {
                  handleNotificationClick(notification, record);
                }
              })}
              columns={[
                {
                  title: 'Notification Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                    title: 'Description ',
                  dataIndex: 'description',
                  key: 'description',
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) =>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Popconfirm
                        title="Are you sure you want to delete this Notification?"
                        onConfirm={(e) => {
                          handleDeleteNotification(record.id);
                        }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                        />
                      </Popconfirm>
                    </div>
                }
              ]}
            />
          ),
          rowExpandable: (record) => true,
        }}
        onRow={(record) => ({
          onClick: () => handleAgentClick(record),
          style: { cursor: 'pointer' }
        })}
        columns={[
          {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (text) => text.name || 'N/A'
          },
          {
            title: 'Agent Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <div onClick={(e) => e.stopPropagation()}>
                {/* <Popconfirm
                  title="Create a copy of this agent?"
                  onConfirm={() => handleCopyConfirm(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    icon={<CopyOutlined style={{ color: '#3179ED', fontSize: '16px' }} />}
                    title="Copy Agent"
                  />
                </Popconfirm> */}
                <Button
                  type="text"
                  icon={<PlayCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />}
                  onClick={() => handleStartAgent(record)}
                  title="Start Agent"
                />
                <Button
                  type="text"
                  icon={<PauseCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />}
                  onClick={() => handleStopAgent(record)}
                  title="Stop Agent"
                />
                <Button
                  type="text"
                  icon={<MdOutlineNotificationAdd style={{ color: '#578E7E', fontSize: '20px' }} />}
                  onClick={() => handleAddNotification(record)}
                  title="Add Notification"
                />
                <Popconfirm
                  title="Are you sure you want to delete this agent?"
                  onConfirm={() => handleDeleteAgent(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                    title="Delete Agent"
                  />
                </Popconfirm>
              </div>
            )
          }
        ]}
        pagination={false}
      />

      <Modal
        title={selectedNotification ? "View Notification" : "Add Notification"}
        open={isNotificationModalVisible}
        onCancel={() => {
          setIsNotificationModalVisible(false);
          form.resetFields();
          setActionType(null);
          setCondition('none');
          setSelectedNotification(null);
          resetTagAliasTable();
        }}
        footer={selectedNotification ? null : [
          <Button key="cancel" onClick={() => {
            setIsNotificationModalVisible(false);
            form.resetFields();
            setActionType(null);
            setCondition('none');
            setSelectedNotification(null);
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleNotificationSubmit}>
            OK
          </Button>
        ]}
        width={700}
        bodyStyle={{ 
          height: '65vh',
          overflow: 'auto',
          paddingRight: '20px'
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Destination"
            name="destination"
            initialValue=""
            rules={[{ required: true, message: 'Please select destination' }]}
          >
            <Select onChange={(value) => handleDestinationChange(value)}>
              {destinations.map(destination => (
                <Select.Option key={destination.id} value={destination.name}>
                  {destination.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nodeId"
            label="Node ID"
            rules={[{ required: true, message: 'Please enter node ID' }]}
          >
            <Select onChange={(value) => setNodeId(value)}>
              {subscribedTags.map(tag => (
                <Select.Option key={tag.value} value={tag.value}>
                  {tag.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="condition"
            label="Condition"
          // rules={[{ required: true, message: 'Please enter condition' }]}
          >
            <Select
              onChange={(value) => setCondition(value)}
              defaultValue="none"
              options={[
                { label: 'Greater Than', value: 'greaterThan' },
                { label: 'Less Than', value: 'lessThan' },
                { label: 'Equal', value: 'equal' },
                { label: 'Between', value: 'between' },
                { label: 'None', value: 'none' },
              ]}
            />
          </Form.Item>
          {
            condition === 'between' && (
              <Form.Item
                name="minimum"
                label="Minimum"
                rules={[{ required: true, message: 'Please enter minimum' }]}
              >
                <Input type="number" />
              </Form.Item>
            )
          }

          {
            condition === 'between' && (
              <Form.Item
                name="maximum"
                label="Maximum"
                rules={[{ required: true, message: 'Please enter maximum' }]}
              >
                <Input type="number" />
              </Form.Item>
            )
          }

          {
            (condition === 'greaterThan' || condition === 'lessThan' || condition === 'equal') && (
              <Form.Item
                name="value"
                label="Value"
                rules={[{ required: true, message: 'Please enter value' }]}
              >
                <Input type="number" />
              </Form.Item>
            )
          }


          {/* <Form.Item
            name="actionType"
            label="Action Type"
            rules={[{ required: true, message: 'Please select action type' }]}
          >
            <Select
              onChange={(value) => setActionType(value)}
              options={[
                { label: 'Email', value: 'email' },
                { label: 'Log', value: 'log' },
                { label: 'Camel Route', value: 'camelRoute' }
              ]}
            />
          </Form.Item> */}

          {/* {actionType === 'email' && (
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter email' }]}
            >
              <Input />
            </Form.Item>
          )}

          {actionType === 'camelRoute' && (
            <Form.Item
              name="routeUrl"
              label="Route URL"
              rules={[{ required: true, message: 'Please enter route URL' }]}
            >
              <Input />
            </Form.Item>
          )} */}

          <Form.Item
            name="apiUrl"
            label="Api URL"
          >
            <Input />
          </Form.Item>


          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="messageTemplate"
            label="Message Template"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span>Tag Alias Mapping</span>
              <Button 
                type="primary" 
                onClick={handleAddTagAliasRow}
                icon={<PlusOutlined />}
              >
                Add Tag
              </Button>
            </div>
            <Table 
              dataSource={tagAliasRows}
              pagination={false}
              rowKey={(record, index) => index}
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                  width: '35%',
                  render: (text, record, index) => (
                    <Input
                      value={text}
                      onChange={(e) => handleTagAliasChange(index, 'name', e.target.value)}
                      placeholder="Enter alias name"
                      style={{ width: '100%' }}
                    />
                  )
                },
                {
                  title: 'Node ID',
                  dataIndex: 'nodeId',
                  key: 'nodeId',
                  width: '45%',
                  render: (text, record, index) => (
                    <Select
                      value={text}
                      onChange={(value) => handleTagAliasChange(index, 'nodeId', value)}
                      style={{ width: '100%' }}
                    >
                      {subscribedTags.map(tag => (
                        <Select.Option key={tag.value} value={tag.value}>
                          {tag.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_, record, index) => (
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                      onClick={() => handleRemoveTagAliasRow(index)}
                      disabled={tagAliasRows.length === 1}
                    />
                  )
                }
              ]}
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentScreen; 