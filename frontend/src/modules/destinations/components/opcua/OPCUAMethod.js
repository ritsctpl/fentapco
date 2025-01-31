import React from 'react';
import { Form, Input, Button, Table, Typography } from 'antd';

const { Text } = Typography;

const OPCUAMethod = ({ destination, handleChange }) => {
  // Column definitions for input/output parameter tables
  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      width: 50,
      render: () => <input type="checkbox" />
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '.NET Data Type',
      dataIndex: 'netDataType',
      width: 200
    },
    {
      title: 'UA Data Type',
      dataIndex: 'uaDataType',
      width: 200
    },
    {
      title: 'Array Length',
      dataIndex: 'arrayLength',
      width: 150
    },
    {
      title: 'Description',
      dataIndex: 'description',
      flex: 1
    }
  ];

  return (
    <Form layout="vertical">
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginBottom: '16px' }}>
        Method Selection
      </Text>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Form.Item 
          label="Name" 
          style={{ flex: 1 }}
        >
          <Input
            value={destination?.method?.name}
            onChange={e => handleChange({ target: { name: 'method.name', value: e.target.value } })}
          />
        </Form.Item>
        <Button style={{ marginTop: '29px' }}>Browse</Button>
      </div>

      <Form.Item label="Description">
        <Input.TextArea
          rows={4}
          value={destination?.method?.description}
          onChange={e => handleChange({ target: { name: 'method.description', value: e.target.value } })}
        />
      </Form.Item>

      {/* Input Parameters */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '16px' }}>
        Input Parameters
      </Text>
      <Table
        columns={columns}
        dataSource={destination?.method?.inputParameters || []}
        pagination={false}
        size="small"
        bordered
        style={{ marginBottom: '24px' }}
      />

      {/* Output Parameters */}
      <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '16px' }}>
        Output Parameters
      </Text>
      <Table
        columns={columns}
        dataSource={destination?.method?.outputParameters || []}
        pagination={false}
        size="small"
        bordered
      />
    </Form>
  );
};

export default OPCUAMethod;