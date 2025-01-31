import React from 'react';
import { Form, Input, Select, Button, Typography, Space, Checkbox } from 'antd';
import { SettingOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const OPCUASecurity = ({ source, handleChange }) => {

  return (
    <Form layout="vertical">
    <Form.Item>
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Certificates
      </Text>

      {/* Application Certificate Section */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            placeholder="Application Certificate"
            style={{ flex: 1 }}
            value={source.security.applicationCertificate}
            onChange={e => handleChange({ target: { name: 'security.applicationCertificate', value: e.target.value } })}
          />
          <Button icon={<PlusOutlined />} />
          <Button icon={<SettingOutlined />} />
          <Button>X</Button>
        </div>

        <Button style={{ width: 'auto' }}>Validation Options</Button>

        <Checkbox
          checked={source.security.sendCertificateChain}
          onChange={e => handleChange({ target: { name: 'security.sendCertificateChain', value: e.target.checked } })}
        >
          Send Certificate Chain
        </Checkbox>
      </Space>

      {/* Session Authentication Section */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Session Authentication
      </Text>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item
          label="Authentication Mode"
          style={{ marginBottom: 16 }}
        >
          <Select
            value={source.security.authenticationMode || 'Anonymous'}
            onChange={value => handleChange({ target: { name: 'security.authenticationMode', value } })}
            style={{ width: '100%' }}
          >
            <Select.Option value="Anonymous">Anonymous</Select.Option>
            <Select.Option value="Username">Username</Select.Option>
            <Select.Option value="Certificate">Certificate</Select.Option>
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Input
            placeholder="Session Certificate"
            style={{ flex: 1 }}
            value={source.security.sessionCertificate}
            onChange={e => handleChange({ target: { name: 'security.sessionCertificate', value: e.target.value } })}
          />
          <Button icon={<SettingOutlined />} />
          <Button>X</Button>
        </div>

        {/* Credentials Section */}
        <div style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '2px' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>Credentials</Text>

          <Form.Item
            label="User Name"
            style={{ marginBottom: 8 }}
          >
            <Input
              value={source.security.username}
              onChange={e => handleChange({ target: { name: 'security.username', value: e.target.value } })}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            style={{ marginBottom: 0 }}
          >
            <Input.Password
              value={source.security.password}
              onChange={e => handleChange({ target: { name: 'security.password', value: e.target.value } })}
            />
          </Form.Item>
        </div>
      </Space>

      {/* Certificate Storage Configuration Section */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
        Certificate Storage Configuration
      </Text>

      {/* Store for Trusted Server Certificates */}
      <div style={{ marginBottom: '16px', border: '1px solid #d9d9d9', padding: '16px', borderRadius: '2px' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Store for Trusted Server Certificates</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Store Type" style={{ marginBottom: 8 }}>
            <Select
              value={source.security.trustedServerStoreType || 'File System'}
              onChange={value => handleChange({ target: { name: 'security.trustedServerStoreType', value } })}
              style={{ width: '100%' }}
            >
              <Select.Option value="File System">File System</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Folder" style={{ marginBottom: 0 }}>
            <Space>
              <Input
                value={source.security.trustedServerFolder || 'C:/ProgramData/SAP/PCo/CertificateStore/UA Applications'}
                onChange={e => handleChange({ target: { name: 'security.trustedServerFolder', value: e.target.value } })}
                style={{ width: '500px' }}
              />
              <Button icon={<SettingOutlined />} />
              <Button>...</Button>
            </Space>
          </Form.Item>
        </Space>
      </div>

      {/* Store for Rejected Server Certificates */}
      <div style={{ marginBottom: '16px', border: '1px solid #d9d9d9', padding: '16px', borderRadius: '2px' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Store for Rejected Server Certificates</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Store Type" style={{ marginBottom: 8 }}>
            <Select
              value={source.security.rejectedServerStoreType || 'File System'}
              onChange={value => handleChange({ target: { name: 'security.rejectedServerStoreType', value } })}
              style={{ width: '100%' }}
            >
              <Select.Option value="File System">File System</Select.Option>
              <Select.Option value="microsoftCertificateStore">Microsoft Certificate Store</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Folder" style={{ marginBottom: 0 }}>
            <Space>
              <Input
                value={source.security.rejectedServerFolder || 'C:/ProgramData/SAP/PCo/CertificateStore/RejectedCertificates'}
                onChange={e => handleChange({ target: { name: 'security.rejectedServerFolder', value: e.target.value } })}
                style={{ width: '500px' }}
              />
              <Button icon={<SettingOutlined />} />
              <Button>...</Button>
            </Space>
          </Form.Item>
        </Space>
      </div>

      {/* Store for Trusted Issuer Certificates */}
      <div style={{ marginBottom: '16px', border: '1px solid #d9d9d9', padding: '16px', borderRadius: '2px' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Store for Trusted Issuer Certificates</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Store Type" style={{ marginBottom: 8 }}>
            <Select
              value={source.security.trustedIssuerStoreType || 'File System'}
              onChange={value => handleChange({ target: { name: 'security.trustedIssuerStoreType', value } })}
              style={{ width: '100%' }}
            >
              <Select.Option value="File System">File System</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Folder" style={{ marginBottom: 0 }}>
            <Space>
              <Input
                value={source.security.trustedIssuerFolder || 'C:/ProgramData/SAP/PCo/CertificateStore/TrustedIssuers'}
                onChange={e => handleChange({ target: { name: 'security.trustedIssuerFolder', value: e.target.value } })}
                style={{ width: '500px' }}
              />
              <Button icon={<SettingOutlined />} />
              <Button>...</Button>
            </Space>
          </Form.Item>
        </Space>
      </div>
    </Form.Item>
  </Form>
  );
};

export default OPCUASecurity; 