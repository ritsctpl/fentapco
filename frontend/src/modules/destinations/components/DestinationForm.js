import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Typography, Space, Card, Row, Col, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { createDestination } from '../../../services/destination';

const DestinationForm = ({ destination, onBack }) => {
  const [form] = Form.useForm();

  console.log(destination, 'lkkkk');
  

  useEffect(() => {
    if (destination) {
      form.setFieldsValue({
        name: destination.name,
        protocol: destination.protocol,
        kafkaBrokers: destination.kafkaBrokers,
      });
    }
  }, [destination, form]);

  const onFinish = async (values) => {
    try {
      if (!destination) {
        const value = {
          ...values,
          // active: true
        };
        
        const createdDestination = await createDestination(value);
        
        const newDestination = {
          id: createdDestination.id,
          ...values
        };
  
        onBack();
      }
    } catch (error) {
      console.error("Error creating destination:", error);
    }
  };
  

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* <div style={{ padding: '10px' }}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined style={{ fontSize: '16px', justifyContent: 'start' }} />}>
          Back to Destinations
        </Button>
      </div> */}
      {
        !destination && (
          <div style={{ paddingTop: '10px' }}>
            <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined style={{ fontSize: '16px', justifyContent: 'start' }} />}>
              Back to Destinations
            </Button>
          </div>
        )
      }
      <Card style={{ marginTop: '10px' }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Add Destination System
        </Typography.Title>

        <Form onFinish={onFinish} layout="vertical"  form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Destination Name"
                name="name"
                rules={[{ required: true, message: 'Please input destination name!' }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Protocol"
                name="protocol"
                initialValue="FENTA"
              >
                <Select>
                  <Select.Option value="FENTA">FENTA</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Kafka Brokers"
                name="kafkaBrokers"
                rules={[{ required: true, message: 'Please input Kafka Brokers!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {
            !destination && (
              <Form.Item>
                <Space style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <Button type="primary" htmlType="submit" size="middle">
                    Create Destination
              </Button>
              <Button size="middle" onClick={() => onBack()}>
                Cancel
              </Button>
                </Space>
              </Form.Item>
            )
          }
        </Form>
      </Card>
    </div>
  );
}

export default DestinationForm;
