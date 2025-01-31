import React from 'react';
import { Form, Radio, Input, Space, Button, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const MQTTSecuritySettings = ({ destination, handleChange }) => {
    return (
        <Form layout="vertical">
            <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
                Origin of Certificate
            </Text>

            <Form.Item>
                <Radio.Group
                    name="certificate.origin"
                    value={destination.certificate?.origin || 'inherited'}
                    onChange={e => handleChange({ target: { name: 'certificate.origin', value: e.target.value } })}
                >
                    <Space direction="vertical">
                        <Radio value="inherited">Inherited from Client</Radio>
                        <Radio value="defined">Defined in Current Destination System</Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>

            <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
                Application Certificate
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Input
                    name="certificate.value"
                    placeholder="Certificate"
                    style={{ flex: 1 }}
                    value={destination.certificate?.value}
                    onChange={e => handleChange({ target: { name: 'certificate.value', value: e.target.value } })}
                />
                <Button icon={<SettingOutlined />} />
                <Button>X</Button>
            </div>
        </Form>
    );
};

export default MQTTSecuritySettings;