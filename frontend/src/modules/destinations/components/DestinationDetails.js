import React, { useEffect } from 'react';
import { Button, Space, Popconfirm, Form } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import DestinationForm from './DestinationForm';
import { deleteDestination } from '../../../services/destination';


const DestinationDetails = ({ destination, onBack }) => {

  console.log(destination,'destination');
  

    const [form] = Form.useForm();

    useEffect(() => {
        if(destination){
           form.setFieldsValue(destination);
        }
    }, [destination]);

  const handleDeleteConfirm = async (destinationId) => {
    const deleteDestinations = await deleteDestination(destinationId);
    onBack();
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <Button type="link" onClick={onBack} icon={<ArrowLeftOutlined />}>
          Back to Destination
        </Button>
        <Space size="middle">
        <Popconfirm
            title="Are you sure you want to delete this destination?"
            onConfirm={() => handleDeleteConfirm(destination.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="large" />
          </Popconfirm>
        </Space>
      </div>

      <DestinationForm destination={destination} onBack={onBack} />
    </div>
  );
};

export default DestinationDetails;
