import React, { useState, useEffect } from 'react';
import { TreeSelect, Table, Row, Col, Card, Space, Button, Form, message, Spin } from 'antd';
import { CarryOutOutlined } from '@ant-design/icons';
import { getAllNodes } from '../../../services/source';
import { getSubscribedTags, getSubscriptionTag } from '../../../services/agent';

const { SHOW_PARENT } = TreeSelect;

const SubscriptionTab = ({ agent, onBack }) => {
  const [treeData, setTreeData] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [subscriptionForm] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!agent?.id || !agent?.source?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch both subscribed tags and nodes in parallel
        const [fetchedSubscribedTags, nodes] = await Promise.all([
          getSubscribedTags(agent.id),
          getAllNodes(agent.source.id)
        ]);

        // Process nodes
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

        // Process subscribed tags
        const formattedTags = fetchedSubscribedTags.map(nodeId => ({
          key: nodeId,
          title: nodeId.split('ns=1;s=[BLENDI01]')[1] || '-',
          value: nodeId
        }));
        
        setSelectedNodes(formattedTags);
        subscriptionForm.setFieldValue('nodeId', fetchedSubscribedTags);
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agent, subscriptionForm]);

  const handleNodeSelect = (values, nodes) => {
    const selectedItems = values.map(nodeId => ({
      key: nodeId,
      title: nodeId.split('ns=1;s=[BLENDI01]')[1] || '-',
      value: nodeId
    }));
    setSelectedNodes(selectedItems);
  };

  const handleSubscriptionSubmit = async (values) => {
    try {
      const selectedNodeIds = selectedNodes.map(node => node.value);
      const subscriptionTag = await getSubscriptionTag(selectedNodeIds, agent.id);
      
      if (subscriptionTag) {
        message.success('Subscription Created');
        subscriptionForm.resetFields();
        setSelectedNodes([]);
        onBack();
      } else {
        message.error('Failed to Subscribe');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      message.error('Failed to create subscription');
    }
  };

  const columns = [
    {
      title: 'Node Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || '-'
    },
    {
      title: 'Node ID',
      dataIndex: 'value',
      key: 'value',
      render: (text) => text || '-'
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <Form
      form={subscriptionForm}
      layout="vertical"
      onFinish={handleSubscriptionSubmit}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="nodeId"
            label="Node ID"
            rules={[{ required: true, message: 'Please select nodes' }]}
          >
            <TreeSelect
              treeData={treeData}
              onChange={handleNodeSelect}
              multiple
              // treeCheckable
              showCheckedStrategy={SHOW_PARENT}
              style={{ width: '100%' }}
              placeholder="Please select nodes"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="Selected Nodes" style={{ marginBottom: '16px' }}>
            <Table
              dataSource={selectedNodes}
              columns={columns}
              pagination={false}
              size="small"
              locale={{ emptyText: 'No nodes selected' }}
              style={{ marginBottom: '16px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button onClick={() => {
                subscriptionForm.resetFields();
                setSelectedNodes([]);
                onBack();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SubscriptionTab;
