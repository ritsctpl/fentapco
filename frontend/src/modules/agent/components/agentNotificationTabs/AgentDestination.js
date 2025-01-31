import React, { useState, useEffect } from 'react'
import { Tree, Table, Button, Modal, Input, Select, Form } from 'antd'
import { PlusOutlined, DeleteOutlined, BranchesOutlined, ArrowRightOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import DestinationDetail from '../../../destinations/components/DestinationDetails';

const AgentDestination = ({ agents, handleChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameForm] = Form.useForm();
  const [showRightContent, setShowRightContent] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const destinationSystems = JSON.parse(localStorage.getItem('destinations') || '[]');

  // Get all destination systems including WebSocket
  const allDestinations = [
    { name: '/Destination System for WebSocket', isDefault: true },
    ...destinationSystems
  ];

  const handleAddDestination = () => {
    setIsModalOpen(true);
  };

  const updateDestinationData = (newTreeData) => {
    setTreeData(newTreeData);
    
    // Convert tree data to destination array format
    const destinationArray = newTreeData.reduce((acc, node) => {
      if (node.key === 'websocket') {
        // Add websocket children as destinations
        return [...acc, ...node.children.map(child => ({
          id: child.key,
          name: child.title.split('[')[0].trim(),
          destinationSystem: child.title.match(/\[(.*?)\]/)?.[1] || '',
          mapping: child.children?.[0]?.mappings || [] // Store mapping data if exists
        }))];
      } else {
        // Add non-websocket nodes as destinations
        return [...acc, {
          id: node.key,
          name: node.title.split('[')[0].trim(),
          destinationSystem: node.title.match(/\[(.*?)\]/)?.[1] || '',
          mapping: node.children?.[0]?.mappings || [] // Store mapping data if exists
        }];
      }
    }, []);

    // Update parent component's state
    handleChange({
      target: {
        name: 'destination',
        value: destinationArray
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let newTreeData = [...treeData];

      if (values.destinationSystem === '/Destination System for WebSocket') {
        newTreeData = [{
          title: `default [${values.destinationSystem}]`,
          key: 'websocket',
          children: []
        }];
      } else {
        const newNode = {
          title: `${values.name} [${values.destinationSystem}]`,
          key: `${Date.now()}`,
          children: [{
            title: 'Output Destination Mapping',
            key: `${Date.now()}-mapping`,
            mappings: [] // Initialize empty mappings array
          }]
        };

        if (newTreeData.length > 0 && newTreeData[0].key === 'websocket') {
          newTreeData = [{
            ...newTreeData[0],
            children: [...newTreeData[0].children, newNode]
          }];
        } else {
          newTreeData = [...newTreeData, newNode];
        }
      }

      updateDestinationData(newTreeData);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Destination System Variable',
      dataIndex: 'variable',
      key: 'variable',
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
    },
    {
      title: 'Notification Outputs',
      dataIndex: 'outputs',
      key: 'outputs',
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
    },
  ]

  // Update tree selection handler
  const onSelect = (selectedKeys, info) => {
    setSelectedNode(info.node);
    // Show right content only when Output Destination Mapping is selected
    setShowRightContent(info.node.title === 'Output Destination Mapping');
  };

  // Add delete handler
  const handleDelete = () => {
    if (!selectedNode) {
      Modal.warning({
        title: 'Warning',
        content: 'Please select a destination to delete',
      });
      return;
    }

    // Only prevent deletion of Output Destination Mapping nodes
    if (selectedNode.title === 'Output Destination Mapping') {
      Modal.warning({
        title: 'Warning',
        content: 'Cannot delete Output Destination Mapping',
      });
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this destination?',
      icon: <ExclamationCircleOutlined />,
      content: `This will delete "${selectedNode.title}"`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // If deleting the root WebSocket node, clear the entire tree
        if (selectedNode.key === 'websocket') {
          setTreeData([]);
        } else {
          // Otherwise, filter out the selected child node
          setTreeData(prevTreeData => [{
            ...prevTreeData[0],
            children: prevTreeData[0].children.filter(node => node.key !== selectedNode.key)
          }]);
        }
        setSelectedNode(null);
      },
    });
  };

  // Add rename handlers
  const handleRename = () => {
    if (!selectedNode) {
      Modal.warning({
        title: 'Warning',
        content: 'Please select a destination to rename',
      });
      return;
    }
    
    // Set initial value in rename form
    renameForm.setFieldsValue({
      oldName: selectedNode.title,
    });
    setIsRenameModalOpen(true);
  };

  const handleRenameOk = () => {
    renameForm.validateFields()
      .then(values => {
        const newTreeData = treeData.map(node => {
          if (node.key === selectedNode.key) {
            const destinationMatch = node.title.match(/\[(.*?)\]/);
            const destinationSystem = destinationMatch ? ` [${destinationMatch[1]}]` : '';
            return {
              ...node,
              title: `${values.newName}${destinationSystem}`
            };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => {
                if (child.key === selectedNode.key) {
                  const destinationMatch = child.title.match(/\[(.*?)\]/);
                  const destinationSystem = destinationMatch ? ` [${destinationMatch[1]}]` : '';
                  return {
                    ...child,
                    title: `${values.newName}${destinationSystem}`
                  };
                }
                return child;
              })
            };
          }
          return node;
        });

        updateDestinationData(newTreeData);
        setIsRenameModalOpen(false);
        renameForm.resetFields();
      });
  };

  const handleRenameCancel = () => {
    setIsRenameModalOpen(false);
    renameForm.resetFields();
  };

  // Get available destinations for dropdown
  const selectedDestinations = treeData.length > 0 
    ? [allDestinations[0].name, ...treeData[0].children.map(child => {
        const match = child.title.match(/\[(.*?)\]/);
        return match ? match[1] : '';
      })]
    : [];

  const availableDestinations = allDestinations.filter(
    system => !selectedDestinations.includes(system.name)
  );

  const handleBack = () => {
    setSelectedDestination(null);
  };

  // Add new handler for arrow button click
  const handleArrowClick = () => {
    if (!selectedNode) return;
    
    // Extract the destination system name from the node title
    const destinationMatch = selectedNode.title.match(/\[(.*?)\]/);
    if (!destinationMatch) return;
    
    const destinationName = destinationMatch[1];
    const destinations = JSON.parse(localStorage.getItem('destinations') || '[]');
    const destinationData = destinations.find(d => d.name === destinationName);
    
    if (destinationData) {
     setSelectedDestination(destinationData?.id);
    }
  };

  // Modified useEffect to load saved data
  useEffect(() => {
    // Check if we have destination data in the agents prop
    if (agents?.notifications?.destination?.length > 0) {
      // Convert destination array to tree structure
      const websocketChildren = agents.notifications.destination.map(dest => ({
        title: `${dest.name} [${dest.destinationSystem}]`,
        key: dest.id,
        children: [{
          title: 'Output Destination Mapping',
          key: `${dest.id}-mapping`,
          mappings: dest.mapping || []
        }]
      }));

      const initialTreeData = [{
        title: 'default [/Destination System for WebSocket]',
        key: 'websocket',
        children: websocketChildren
      }];

      setTreeData(initialTreeData);
    } else {
      // Initialize empty tree if no data exists
      setTreeData([{
        title: 'default [/Destination System for WebSocket]',
        key: 'websocket',
        children: []
      }]);
    }
  }, [agents?.notifications?.destination]);

  if (selectedDestination) {
    return <DestinationDetail destinations={selectedDestination} onBack={handleBack} />;
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left Tree Section */}
      <div style={{ width: '250px', borderRight: '1px solid #ddd' }}>
        <div style={{ 
          padding: '8px', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '8px'
        }}>
          <Button 
            type="text" 
            icon={<PlusOutlined />}
            size="small"
            onClick={handleAddDestination}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />}
            size="small"
            onClick={handleDelete}
          />
          <Button 
            type="text" 
            icon={<BranchesOutlined />}
            size="small"
            onClick={handleRename}
          />
          <Button 
            type="text" 
            icon={<ArrowRightOutlined />}
            size="small"
            onClick={handleArrowClick}
            // Enable only when a child node (not root websocket or mapping) is selected
            disabled={!selectedNode || selectedNode.key === 'websocket' || selectedNode.title === 'Output Destination Mapping'}
          />
        </div>
        <div style={{ padding: '16px 4px' }}>
          <Tree
            showIcon
            defaultExpandAll
            treeData={treeData}
            onSelect={onSelect}
          />
        </div>
      </div>

      {/* Right Content Area */}
      {showRightContent && (
        <div style={{ flex: 1, padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2>Assignment of Destination System Input Variables to Output Values</h2>
          </div>
          <Table
            columns={columns}
            dataSource={[]}
            bordered
          />
          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <Button type="primary">
              Propose Assignment
            </Button>
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      <Modal
        title="Add Destination System to Notification"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="OK"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="destinationSystem"
            label="Destination System"
            rules={[{ required: true, message: 'Please select a destination system' }]}
          >
            <Select>
              {availableDestinations.map((system, index) => (
                <Select.Option 
                  key={system.isDefault ? 'websocket' : index} 
                  value={system.name}
                >
                  {system.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Rename Modal */}
      <Modal
        title="Rename Destination System"
        open={isRenameModalOpen}
        onOk={handleRenameOk}
        onCancel={handleRenameCancel}
        okText="OK"
        cancelText="Cancel"
      >
        <Form
          form={renameForm}
          layout="vertical"
        >
          <Form.Item
            name="oldName"
            label="Old Name"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="newName"
            label="New Name"
            rules={[{ required: true, message: 'Please input the new name' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AgentDestination