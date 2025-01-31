import React from 'react';
import { Form, Input, Typography, Space, InputNumber, Checkbox } from 'antd';

const { Text } = Typography;

const MQTTClient = ({ source, handleChange }) => {
    return (
        <Form layout="vertical">
            <Form.Item label="Source Name" required>
                <Input
                    name="name"
                    value={source.name}
                    onChange={e => handleChange({ target: { name: 'name', value: e.target.value } })}
                />
            </Form.Item>

            <Form.Item label="Server URI">
                <Input
                    name="client.uri"
                    placeholder="Enter server URI here"
                    value={source.client.uri}
                    onChange={e => handleChange({ target: { name: 'client.uri', value: e.target.value } })}
                />
            </Form.Item>

            <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
                {source.type} Server Authentication
            </Text>

            <Space style={{ width: '100%', marginTop: 16 }}>
                <Form.Item label="Username" style={{ flex: 1 }}>
                    <Input
                        name="client.username"
                        value={source.client.username}
                        onChange={e => handleChange({ target: { name: 'client.username', value: e.target.value } })}
                    />
                </Form.Item>
                <Form.Item label="Password" style={{ flex: 1 }}>
                    <Input.Password
                        name="client.password"
                        value={source.client.password}
                        onChange={e => handleChange({ target: { name: 'client.password', value: e.target.value } })}
                    />
                </Form.Item>
            </Space>

            <Space style={{ width: '100%' }} align="baseline">
                <Form.Item
                    label="Response Timeout"
                    style={{ marginBottom: 8 }}
                >
                    <Space>
                        <InputNumber
                            value={source.client.responseTimeout || 1000}
                            onChange={value => handleChange({ target: { name: 'client.responseTimeout', value } })}
                            style={{ width: '100px' }}
                        />
                        <span>ms</span>
                    </Space>
                </Form.Item>
            </Space>

            <Space style={{ width: '100%' }} align="baseline">
                <Form.Item
                    label="Keep Alive Interval"
                    style={{ marginBottom: 8 }}
                >
                    <Space>
                        <InputNumber
                            value={source.client.keepAliveInterval || 0}
                            onChange={value => handleChange({ target: { name: 'client.keepAliveInterval', value } })}
                            style={{ width: '100px' }}
                        />
                        <span>ms</span>
                    </Space>
                </Form.Item>
            </Space>
            <Space style={{ width: '100%' }} align="baseline">
                <Form.Item style={{ marginBottom: 0 }}>
                    <Checkbox
                        checked={source.client.cleanSession}
                        onChange={e => handleChange({ target: { name: 'client.cleanSession', value: e.target.checked } })}
                    >
                        Clean Session if connection was Interrupted
                    </Checkbox>
                </Form.Item>
            </Space>
        </Form>
    );
};

export default MQTTClient; 