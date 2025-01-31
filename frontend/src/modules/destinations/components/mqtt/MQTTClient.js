import React from 'react';
import { Form, Input, Typography, Space, InputNumber, Checkbox } from 'antd';

const { Text } = Typography;

const MQTTClient = ({ destination, handleChange }) => {
    return (
        <Form layout="vertical">
            <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
                Client Configuration
            </Text>

            <Form.Item label="Client ID" required>
                <Input
                    name="client.id"
                    value={destination.client?.id}
                    onChange={e => handleChange({ target: { name: 'client.id', value: e.target.value } })}
                />
            </Form.Item>

            <Form.Item label="Server URI">
                <Input
                    name="client.uri"
                    placeholder="mqtt://hostname:port"
                    value={destination.client?.uri}
                    onChange={e => handleChange({ target: { name: 'client.uri', value: e.target.value } })}
                />
            </Form.Item>

            <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
                MQTT Server Authentication
            </Text>

            <Form.Item label="User Name">
                <Input
                    name="client.username"
                    value={destination.client?.username}
                    onChange={e => handleChange({ target: { name: 'client.username', value: e.target.value } })}
                />
            </Form.Item>

            <Form.Item label="Password">
                <Input.Password
                    name="client.password"
                    value={destination.client?.password}
                    onChange={e => handleChange({ target: { name: 'client.password', value: e.target.value } })}
                />
            </Form.Item>

            <Form.Item label="Response Timeout">
                <Space>
                    <InputNumber
                        name="client.responseTimeout"
                        value={destination.client?.responseTimeout || 10000}
                        onChange={value => handleChange({ target: { name: 'client.responseTimeout', value } })}
                        style={{ width: '120px' }}
                    />
                    <span>ms</span>
                </Space>
            </Form.Item>

            <Form.Item label="Keep-Alive Interval">
                <Space>
                    <InputNumber
                        name="client.keepAliveInterval"
                        value={destination.client?.keepAliveInterval || 0}
                        onChange={value => handleChange({ target: { name: 'client.keepAliveInterval', value } })}
                        style={{ width: '120px' }}
                    />
                    <span>s</span>
                </Space>
            </Form.Item>

            <Form.Item>
                <Checkbox
                    name="client.cleanSession"
                    checked={destination.client?.cleanSession}
                    onChange={e => handleChange({ target: { name: 'client.cleanSession', value: e.target.checked } })}
                >
                    Clean Session if Connection Was Interrupted
                </Checkbox>
            </Form.Item>
        </Form>
    );
};

export default MQTTClient; 