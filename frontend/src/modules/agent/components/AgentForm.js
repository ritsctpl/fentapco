// src/components/AgentForm.js

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Typography, Space, Card, Row, Col, Switch, Tabs, TreeSelect, Table, message } from 'antd';
import { ArrowLeftOutlined, CarryOutOutlined } from '@ant-design/icons';
import { fetchSources, getAllNodes } from '../../../services/source';
import { createAgent, getSubscribedTags, getSubscriptionTag } from '../../../services/agent';

const AgentForm = ({ onBack, agent }) => {
    const [sources, setSources] = React.useState([]);
    const [form] = Form.useForm();
    const [selectedSource, setSelectedSource] = React.useState(agent?.source || '');
    const [websocketEnabled, setWebsocketEnabled] = React.useState(agent?.websocketEnabled || false);
    const [sseEnabled, setSseEnabled] = React.useState(agent?.sseEnabled || false);
    const [treeData, setTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [subscriptionForm] = Form.useForm();
    const [subscribedTags, setSubscribedTags] = useState([]);
    
    useEffect(() => {
        if (agent) {
            form.setFieldsValue({
                name: agent?.name,
                active: agent?.active,
                websocketEnabled: agent?.websocketEnabled,
                websocketUrl: agent?.websocketUrl,
                sseEnabled: agent?.sseEnabled,
                sseUrl: agent?.sseUrl,
                source: agent?.source?.name
            });
            setSelectedSource(agent?.source.name);
            setWebsocketEnabled(agent?.websocketEnabled);
            setSseEnabled(agent?.sseEnabled);
        }
    }, [agent, form]);

    // Update useEffect to fetch sources from API instead of localStorage
    useEffect(() => {
        const loadSources = async () => {
            try {
                const fetchedSources = await fetchSources();
                setSources(fetchedSources);
            } catch (error) {
                console.error('Error fetching sources:', error);
            }
        };
        loadSources();
    }, []);

    useEffect(() => {
        const loadSubscribedTags = async () => {
            try {
                const fetchedSubscribedTags = await getSubscribedTags(agent.id);
                
                // Format the subscribed tags for table display
                const formattedTags = fetchedSubscribedTags.map(nodeId => ({
                    key: nodeId,
                    title: nodeId.split('ns=1;s=[BLENDI01]')[1] || '-', // Extract the readable name
                    value: nodeId
                }));
                
                setSubscribedTags(fetchedSubscribedTags); // Keep original array for TreeSelect
                setSelectedNodes(formattedTags); // Set formatted data for table
            } catch (error) {
                console.error('Error fetching subscribed tags:', error);
            }
        };
        if (agent?.id) {
            loadSubscribedTags();
        }
    }, [agent]);

    useEffect(() => {
        const fetchNodes = async () => {
            if (agent?.source?.id) {
                const nodes = await getAllNodes(agent.source.id);
                const objectsNode = nodes.children.find(node => node.displayName === "Objects");

                if (objectsNode) {
                    const findAllNodeIds = (node) => {
                        let nodeIds = [node.nodeId];
                        if (node.children) {
                            node.children.forEach(child => {
                                nodeIds = [...nodeIds, ...findAllNodeIds(child)];
                            });
                        }
                        return nodeIds;
                    };

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

                    // If we have subscribedTags, expand and select the matching nodes
                    if (subscribedTags.length > 0) {
                        const allNodeIds = findAllNodeIds(objectsNode);
                        const matchingNodeIds = subscribedTags.filter(tag => 
                            allNodeIds.some(nodeId => nodeId === tag)
                        );
                        if (matchingNodeIds.length > 0) {
                            subscriptionForm.setFieldValue('nodeId', matchingNodeIds);
                        }
                    }
                }
            }
        };

        fetchNodes();
    }, [agent, subscribedTags]); // Add subscribedTags as dependency

    const onFinish = async (values) => {
        // const existingAgents = JSON.parse(localStorage.getItem('agents') || '[]');

        const newAgent = {
            ...values,
            source: selectedSource,
            opcUaConnection: selectedSource?.opcUaConnection
        };
        const createAgents = await createAgent(newAgent);

        // const newAgentData = {
        //     ...createAgents,
        //     id: createAgents.id,
        // }

        // localStorage.setItem('agents', JSON.stringify([...existingAgents, newAgentData]));
        onBack();
    };

    // Update handleSourceChange to use the value directly
    const handleSourceChange = (value) => {
        const source = sources.find(source => source.name === value);
        setSelectedSource(source);
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

    const handleNodeSelect = (values, nodes) => {
        const selectedItems = values.map(nodeId => {
            return {
                key: nodeId,
                title: nodeId.split('ns=1;s=[BLENDI01]')[1] || '-',
                value: nodeId
            };
        });
        setSelectedNodes(selectedItems);
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

    const SubscriptionContent = () => (
        <Form
            form={subscriptionForm}
            layout="vertical"
            onFinish={handleSubscriptionSubmit}
            initialValues={{
                nodeId: subscribedTags // Set initial values for the form
            }}
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
                            treeCheckable
                            value={subscribedTags}
                            showCheckedStrategy={TreeSelect.SHOW_PARENT}
                            style={{ width: '100%' }}
                            placeholder="Please select nodes"
                        />
                    </Form.Item>
                </Col>
            </Row>

            {selectedNodes.length > 0 && (
                <Row gutter={16}>
                    <Col span={24}>
                        <Table
                            dataSource={selectedNodes}
                            columns={columns}
                            pagination={false}
                            size="small"
                            style={{ marginBottom: '16px' }}
                        />
                    </Col>
                </Row>
            )}

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
                            }}>
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );

    return (
        <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px' }}>
                <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined style={{ fontSize: '16px', justifyContent: 'start' }} />}>
                    Back to Agents
                </Button>
            </div>
            <Card style={{ marginTop: '10px' }}>

                <Tabs
                    defaultActiveKey="agent"
                    items={[
                        {
                            key: 'agent',
                            label: 'Agent',
                            children: (
                                <Form form={form} onFinish={onFinish} layout="vertical">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Source System"
                                                name="source"
                                                initialValue=""
                                            >
                                                <Select onChange={handleSourceChange}>
                                                    {sources.map(source => (
                                                        <Select.Option key={source.id} value={source.name}>
                                                            {source.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                label="Agent Name"
                                                name="name"
                                                rules={[{ required: true, message: 'Please input Agent name!' }]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Active"
                                                name="active"
                                                rules={[{ required: true, message: 'Please input Active!' }]}
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Websocket Enabled"
                                                name="websocketEnabled"
                                            >
                                                <Switch onChange={(checked) => setWebsocketEnabled(checked)} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="SSE Enabled"
                                                name="sseEnabled"
                                            >
                                                <Switch onChange={(checked) => setSseEnabled(checked)} />
                                            </Form.Item>
                                        </Col>
                                        {
                                            sseEnabled && (
                                                <Col span={12}>
                                                    <Form.Item
                                                        label="SSE URL"
                                                        name="sseUrl"
                                                        rules={[{ required: true, message: 'Please input SSE URL!' }]}
                                                        style={{ display: sseEnabled ? 'block' : 'none' }}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                            )}
                                        {
                                            websocketEnabled && (
                                                <Col span={12}>
                                                    <Form.Item
                                                        label="Websocket URL"
                                                        name="websocketUrl"
                                                        rules={[{ required: true, message: 'Please input Websocket URL!' }]}
                                                        style={{ display: websocketEnabled ? 'block' : 'none' }}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </Col>
                                            )
                                        }
                                    </Row>

                                    {
                                        agent ? null : (
                                            <Form.Item>
                                                <Space style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                                    <Button type="primary" htmlType="submit" size="middle">
                                                        Create Agent
                                                    </Button>
                                                    <Button size="middle" onClick={() => onBack()}>
                                                        Cancel
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        )
                                    }
                                </Form>
                            ),
                        },
                        {
                            key: 'subscriptionTags',
                            label: 'Subscription Tags',
                            disabled: !agent,
                            children: <SubscriptionContent />,
                        },
                    ]}
                />
            </Card>
        </div>
    );
}

export default AgentForm;
