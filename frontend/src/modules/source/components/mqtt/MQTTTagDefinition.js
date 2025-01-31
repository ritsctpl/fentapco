import React, { useState, useRef, useEffect } from 'react'
import { Form, Input, Button, Space, Modal, Typography, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

const { Text } = Typography;

const MQTTTagDefinition = ({ source, handleChange }) => {
    const [openJsonModal, setOpenJsonModal] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [newSubscription, setNewSubscription] = useState('');
    const [subscriptions, setSubscriptions] = useState([]);
    const [jsonEditorInstance, setJsonEditorInstance] = useState(null);
    const editorContainer = useRef(null);

    useEffect(() => {
        if (editorContainer.current) {
          const editor = new JSONEditor(editorContainer.current, {
            mode: 'tree',
            onChange: () => {
              console.log(editor.get());
            },
          });
          editor.set({ name: 'John', age: 30 });
          setJsonEditorInstance(editor);
    
          return () => {
            if (editor) {
              editor.destroy();
            }
          };
        }
      }, [editorContainer.current]);

    const handleOpenJsonModal = () => {
        setOpenJsonModal(true);
      };
    
      const handleCloseJsonModal = () => {
        setOpenJsonModal(false);
      };

      const handleOpenModal = () => {
        setOpenModal(true);
      };

      const handleSaveSubscription = () => {
        if (newSubscription.trim()) {
          setSubscriptions([...subscriptions, newSubscription]);
          handleCloseModal();
        }
      };
    
      const handleCloseModal = () => {
        setOpenModal(false);
        setNewSubscription('');
      };

    const renderJsonEditor = () => (
        <Form.Item>
          <Space style={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 16 }}>
            <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>Payload Schema</Text>
            <Button
              type="primary"
              shape="circle"
              style={{ marginLeft: 'auto', marginTop: 16, marginLeft: 16 }}
              icon={<SettingOutlined />}
              size="small"
              onClick={handleOpenJsonModal}
            />
          </Space>
          <div ref={editorContainer} style={{ height: '400px', width: '100%' }}></div>
    
          <Modal
            title="Payload Preview"
            open={openJsonModal}
            onCancel={handleCloseJsonModal}
            width={800}
            footer={null}
          >
            <div style={{ padding: 24 }}>
              {source.tagDefinition.payloadType === 'JSON' && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(jsonEditorInstance?.get() || {}, null, 2)}
                </pre>
              )}
              {source.tagDefinition.payloadType === 'XML' && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {convertToXML(jsonEditorInstance?.get() || {})}
                </pre>
              )}
              {source.tagDefinition.payloadType === 'Plain Text' && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(jsonEditorInstance?.get() || {})}
                </pre>
              )}
            </div>
          </Modal>
        </Form.Item>
      );

      const convertToXML = (obj, indent = '') => {
        let xml = '';
        for (const prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            const value = obj[prop];
            if (typeof value === 'object') {
              xml += `${indent}<${prop}>\n${convertToXML(value, indent + '  ')}\n${indent}</${prop}>\n`;
            } else {
              xml += `${indent}<${prop}>${value}</${prop}>\n`;
            }
          }
        }
        return xml;
      };
    
  return (
    <Form layout="vertical">
      <Form.Item>
        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Subscription
        </Text>
        <Select
          name="tagDefinition.selectedSubscriptions"
          value={source.tagDefinition.selectedSubscriptions || ''}
          onChange={e => handleChange({ target: { name: 'tagDefinition.selectedSubscriptions', value: e } })}
          style={{ width: '100%' }}
          placeholder="Select a subscription"
          dropdownRender={(menu) => (
            <>
              {menu}
              <div
                style={{
                  padding: '8px',
                  borderTop: '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
                onClick={handleOpenModal}
              >
                <PlusOutlined /> Add new subscription
              </div>
            </>
          )}
        >
          <Select.Option value="">Select a subscription</Select.Option>
          {subscriptions.map((subscription, index) => (
            <Select.Option key={index} value={subscription}>
              {subscription}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Modal
        title="Create New Subscription"
        open={openModal}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
          <Input
            name="subscriptionName"
            placeholder="Subscription Name"
            value={newSubscription}
            onChange={(e) => setNewSubscription(e.target.value)}
          />
          <Button type="primary" onClick={handleSaveSubscription}>
            Save
          </Button>
        </Space>
      </Modal>

      <Form.Item>
        <Text strong type="secondary" style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '24px', marginBottom: '8px' }}>
          Subscription Settings
        </Text>
        <Space direction="vertical" style={{ width: '100%', gap: 24 }}>
          <Form.Item label="Subscription Name" style={{ marginBottom: 0 }}>
            <Input
              name="tagDefinition.subscriptionName"
              value={source.tagDefinition.subscriptionName || ''}
              onChange={e => handleChange({ target: { name: 'tagDefinition.subscriptionName', value: e.target.value } })}
            />
          </Form.Item>

          <Form.Item label="Topic Filter" style={{ marginBottom: 0 }}>
            <Input
              name="tagDefinition.topicFilter"
              value={source.tagDefinition.topicFilter || ''}
              onChange={e => handleChange({ target: { name: 'tagDefinition.topicFilter', value: e.target.value } })}
            />
          </Form.Item>

          <Form.Item label="QoS" style={{ marginBottom: 0 }}>
            <Select
              name="tagDefinition.subscriptionQos"
              value={source.tagDefinition.subscriptionQos || '0'}
              onChange={e => handleChange({ target: { name: 'tagDefinition.subscriptionQos', value: e } })}
            >
              <Select.Option value="0">0 - At most once</Select.Option>
              <Select.Option value="1">1 - At least once</Select.Option>
              <Select.Option value="2">2 - Exactly once</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Payload Type" style={{ marginBottom: 0 }}>
            <Select
              name="tagDefinition.payloadType"
              value={source.tagDefinition.payloadType || 'JSON'}
              onChange={e => handleChange({ target: { name: 'tagDefinition.payloadType', value: e } })}
            >
              <Select.Option value="JSON">JSON</Select.Option>
              <Select.Option value="XML">XML</Select.Option>
              <Select.Option value="Plain Text">URL- Encoded</Select.Option>
            </Select>
          </Form.Item>
        </Space>

        {renderJsonEditor()}
      </Form.Item>
    </Form>
  )
}

export default MQTTTagDefinition