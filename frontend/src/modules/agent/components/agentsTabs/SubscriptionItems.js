import React, { useState } from 'react';
import { Table, Button, Checkbox, Modal, Form, Input, InputNumber, Space, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ImportOutlined } from '@ant-design/icons';

const DATA_TYPE_OPTIONS = [
  { value: 'System.String', label: 'System.String' },
  { value: 'System.Boolean', label: 'System.Boolean' },
  { value: 'System.Int32', label: 'System.Int32' },
  { value: 'System.Double', label: 'System.Double' },
  { value: 'System.DateTime', label: 'System.DateTime' },
  { value: 'System.Array', label: 'System.Array' },
  { value: 'System.Object', label: 'System.Object' }
];

const SubscriptionItems = ({ agents, handleChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);
  const [form] = Form.useForm();
  const [data, setData] = useState(agents?.subscriptionItems || []);

  const updateSubscriptionItems = (newData) => {
    setData(newData);

    handleChange({
      target: {
        name: 'subscriptionItems',
        value: newData
      }
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Deadband',
      dataIndex: 'deadband',
      key: 'deadband',
      width: 100,
    },
    {
      title: 'Only Change',
      dataIndex: 'onlyChange',
      key: 'onlyChange',
      width: 100,
      render: (_, record) => <Checkbox checked={record.onlyChange} />
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
    },
  ];

  const handleAdd = () => {
    setModalMode('add');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = () => {
    if (!selectedRow) {
      Modal.warning({
        title: 'Please select a row to edit',
        content: 'You must select a subscription item first.',
      });
      return;
    }
    setModalMode('edit');
    form.setFieldsValue(selectedRow);
    setIsModalVisible(true);
  };

  const handleDelete = () => {
    if (!selectedRow) {
      Modal.warning({
        title: 'Please select a row to delete',
        content: 'You must select a subscription item first.',
      });
      return;
    }
    setIsDeleteModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newData = modalMode === 'add'
        ? [...data, { ...values, key: Date.now().toString() }]
        : data.map(item => item.key === selectedRow.key ? { ...item, ...values } : item);
      
      updateSubscriptionItems(newData);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteConfirm = () => {
    const newData = data.filter(item => item.key !== selectedRow.key);
    updateSubscriptionItems(newData);
    setIsDeleteModalVisible(false);
    setSelectedRow(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 300px)' }}>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={false}
        size="small"
        rowSelection={{
          type: 'radio',
          onChange: (_, [selected]) => setSelectedRow(selected),
        }}
        // scroll={{ y: 'calc(100vh - 390px)' }}
        style={{ 
          flex: 1,
          overflow: 'hidden'
        }}
      />
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <Button icon={<PlusOutlined />} onClick={handleAdd} />
        <Button icon={<EditOutlined />} onClick={handleEdit} />
        <Button icon={<DeleteOutlined />} onClick={handleDelete} />
        <Button icon={<ImportOutlined />} />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={`${modalMode === 'add' ? 'Add' : 'Edit'} Subscription Item`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="source"
            label="Source"
            rules={[{ required: true, message: 'Please input the source!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="deadband"
            label="Deadband"
            initialValue="0.0"
          >
            <InputNumber step="0.1" />
          </Form.Item>
          <Form.Item
            name="dataType"
            label="Data Type"
            rules={[{ required: true, message: 'Please select the data type!' }]}
          >
            <Select
              options={DATA_TYPE_OPTIONS}
              style={{ width: '100%' }}
              placeholder="Select a data type"
            />
          </Form.Item>
          <Form.Item
            name="onlyChange"
            valuePropName="checked"
          >
            <Checkbox>Only Send Notification If Tag Value Has Changed</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Management Console"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="yes" onClick={handleDeleteConfirm}>
            Yes
          </Button>,
          <Button key="no" onClick={() => setIsDeleteModalVisible(false)} type="primary">
            No
          </Button>,
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#1890ff', fontSize: '24px' }}>?</span>
            <span>All of the selected subscription items are used in notifications.</span>
          </div>
          <div>Company (Not_testCompany)</div>
          <div>Do you want to delete the selected subscription items even though they are in use?</div>
        </Space>
      </Modal>
    </div>
  );
};

export default SubscriptionItems;