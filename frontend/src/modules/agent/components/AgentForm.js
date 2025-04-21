// src/components/AgentForm.js

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Typography, Space, Card, Row, Col, Switch, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fetchSources } from '../../../services/source';
import { createAgent } from '../../../services/agent';
import SubscriptionTab from './SubscriptionTab';

const AgentForm = ({ onBack, agent }) => {
    const [sources, setSources] = React.useState([]);
    const [form] = Form.useForm();
    const [selectedSource, setSelectedSource] = React.useState(agent?.source || '');
    const [websocketEnabled, setWebsocketEnabled] = React.useState(agent?.websocketEnabled || false);
    const [sseEnabled, setSseEnabled] = React.useState(agent?.sseEnabled || false);
    
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

    const onFinish = async (values) => {
        const newAgent = {
            ...values,
            source: selectedSource,
            opcUaConnection: selectedSource?.opcUaConnection
        };
        const createAgents = await createAgent(newAgent);
        onBack();
    };

    const handleSourceChange = (value) => {
        const source = sources.find(source => source.name === value);
        setSelectedSource(source);
    };

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
                            children: <SubscriptionTab agent={agent} onBack={onBack}/>,
                        },
                    ]}
                />
            </Card>
        </div>
    );
}

export default AgentForm;
