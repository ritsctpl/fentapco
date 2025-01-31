import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Space, Select, Typography, Button, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

const { Text } = Typography;

const MQTTMessageSettings = ({ destination, handleChange }) => {
    const [openJsonModal, setOpenJsonModal] = useState(false);
    const editorContainer = useRef(null);
    const [jsonEditorInstance, setJsonEditorInstance] = useState(null);

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
              {destination.messageSettings.payloadType === 'JSON' && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(jsonEditorInstance?.get() || {}, null, 2)}
                </pre>
              )}
              {destination.messageSettings.payloadType === 'XML' && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {convertToXML(jsonEditorInstance?.get() || {})}
                </pre>
              )}
              {destination.messageSettings.payloadType === 'Plain Text' && (
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
                    Payload Settings
                </Text>
                <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
                    <Form.Item label="Topic Name" style={{ marginBottom: 0 }}>
                        <Input
                            name="messageSettings.topicName"
                            value={destination.messageSettings.topicName || ''}
                            onChange={e => handleChange({ target: { name: 'messageSettings.topicName', value: e.target.value } })}
                        />
                    </Form.Item>

                    <Form.Item label="QoS" style={{ marginBottom: 0 }}>
                        <Select
                            name="messageSettings.qos"
                            value={destination.messageSettings.qos || '0'}
                            onChange={e => handleChange({ target: { name: 'messageSettings.qos', value: e } })}
                        >
                            <Select.Option value="0">0 - At most once</Select.Option>
                            <Select.Option value="1">1 - At least once</Select.Option>
                            <Select.Option value="2">2 - Exactly once</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Payload Type" style={{ marginBottom: 0 }}>
                        <Select
                            name="messageSettings.payloadType"
                            value={destination.messageSettings.payloadType || 'JSON'}
                            onChange={e => handleChange({ target: { name: 'messageSettings.payloadType', value: e } })}
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
    );
};

export default MQTTMessageSettings;