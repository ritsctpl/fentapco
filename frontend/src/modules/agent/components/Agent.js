import React, { useState, useEffect } from 'react';
import { Button, Popconfirm, Table, Modal, Form, Input, Select, message, TreeSelect } from 'antd';
import { CopyOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, CarryOutOutlined, DownOutlined } from '@ant-design/icons';
import '../style.css';
import AgentForm from './AgentForm';
import AgentDetails from './AgentDetails';
import AgentNotification from './AgentNotification';
import { MdOutlineNotificationAdd } from 'react-icons/md';
import { createAgent, deleteAgent, fetchAgents, getSubscriptionTag, startAgent, stopAgent } from '../../../services/agent';
import { createNotification, deleteNotification } from '../../../services/notificationService';
import { getAllNodes } from '../../../services/source';

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
  const [treeData, setTreeData] = useState([]);
  const [nodeId, setNodeId] = useState(null);

  useEffect(() => {
    // const storedAgents = localStorage.getItem('agents');
    // if (storedAgents) {
    //   setAgents(JSON.parse(storedAgents));
    // }
    const fetchDataAgents = async () => {
      const agents = await fetchAgents();
      console.log(agents,'agents');
      
      setAgents(agents);
    };
    fetchDataAgents();
  }, [call]);

  const handleAgentClick = (agent) => {
    setSelectedAgent('new');
    setCurrentAgent(agent);
  };

  const handleNotificationClick = async (notification, agent) => {
    // setSelectedAgent(agent?.id);
    // setSelectedNotification(notification?.id);
    setIsNotificationModalVisible(true);
    form.setFieldsValue(notification);
    setSelectedNotification(notification);
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

    // const newAgentData = {
    //   ...createCopyAgent,
    //   id: createCopyAgent.id,
    // }

    // const updatedAgents = [...agents, newAgentData];
    // localStorage.setItem('agents', JSON.stringify(updatedAgents));
    // setAgents(updatedAgents);
  };

  const handleAddNotification = async (agent) => {
    setCurrentAgent(agent);
    setIsNotificationModalVisible(true);
    const nodes = await getAllNodes(agent.source.id);
    const objectsNode = nodes.children.find(node => node.displayName === "Objects");

    if (objectsNode) {
      const mapNode = (node) => ({
        value: node.nodeId,
        title: node.displayName,
        icon: <CarryOutOutlined />,
        children: node.children && node.children.length > 0
          ? node.children.map(mapNode)
          : undefined
      });

      const treeDatas = objectsNode.children.map(mapNode);
      setTreeData(treeDatas);
    }
  };

  const handleNotificationSubmit = async () => {
    try {
      // Validate all form fields
      await form.validateFields();
      
      const values = form.getFieldsValue();
      const newNotification = {
        ...values,
        condition: values.condition ? values.condition : 'none',
        agentId: currentAgent?.id
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

      const subscriptionTag = await getSubscriptionTag(nodeId, currentAgent.id, createNotifications?.id);
      if (subscriptionTag) {
        message.success('Subscription Created');
      } else {
        message.error('Failed to Subscribe');
      }
    } catch (error) {
      // Form validation error or API error
      if (error.errorFields) {
        // This is a form validation error
        message.error('Please fill in all required fields');
      } else {
        // This is an API or other error
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
    // const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
    // const updatedAgents = allAgents.filter(agent => agent.id.toString() !== agentId.toString());
    // localStorage.setItem('agents', JSON.stringify(updatedAgents));
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
    // const allAgents = JSON.parse(localStorage.getItem('agents') || '[]');
    // const updatedAgents = allAgents.map(agent => {
    //   if (!agent.notifications) {
    //     return agent;
    //   }
    //   const hasNotification = agent.notifications.some(n => n.id === notificationId);
    //   if (!hasNotification) return agent;
    //   const result = {
    //     ...agent,
    //     notifications: agent.notifications.filter(n => n.id !== notificationId)
    //   };
    //   return result;
    // });

    // localStorage.setItem('agents', JSON.stringify(updatedAgents));
    setCall(call + 1);
  }

  // const handleGetNodes = async () => {
  //   const nodes = await getAllNodes(currentAgent.source.id);
  //   console.log(nodes, 'nodes');

  //   // Find the Objects node which contains the device data
  //   const objectsNode = nodes.children.find(node => node.displayName === "Objects");

  //   if (objectsNode) {
  //     const mapNode = (node) => ({
  //       value: node.nodeId,
  //       title: node.displayName,
  //       icon: <CarryOutOutlined />,
  //       children: node.children && node.children.length > 0
  //         ? node.children.map(mapNode)
  //         : undefined
  //     });

  //     const treeDatas = objectsNode.children.map(mapNode);
  //     setTreeData(treeDatas);
  //   }
  // }



  // const treeData = [
  //   {
  //     value: 'parent 1',
  //     title: 'parent 1',
  //     icon: <CarryOutOutlined />,
  //     children: [
  //       {
  //         value: 'parent 1-0',
  //         title: 'parent 1-0',
  //         icon: <CarryOutOutlined />,
  //         children: [
  //           {
  //             value: 'leaf1',
  //             title: 'leaf1',
  //             icon: <CarryOutOutlined />,
  //           },
  //           {
  //             value: 'leaf2',
  //             title: 'leaf2',
  //             icon: <CarryOutOutlined />,
  //           },
  //         ],
  //       },
  //       {
  //         value: 'parent 1-1',
  //         title: 'parent 1-1',
  //         icon: <CarryOutOutlined />,
  //         children: [
  //           {
  //             value: 'sss',
  //             title: 'sss',
  //             icon: <CarryOutOutlined />,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];


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
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Action Type',
                  dataIndex: 'actionType',
                  key: 'actionType',
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
          setIsNotificationModalVisible(false);
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
      >
        <Form
          form={form}
          layout="vertical"
        >
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
            <TreeSelect
              // suffixIcon={<DownOutlined onClick={handleGetNodes}/>}
              treeData={treeData}
              onChange={(value) => {
                setNodeId(value);
              }}
            />
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


          <Form.Item
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
          </Form.Item>

          {actionType === 'email' && (
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
          )}

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentScreen; 