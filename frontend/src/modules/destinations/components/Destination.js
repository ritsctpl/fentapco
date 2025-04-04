import React, { useState, useEffect } from 'react';
import { Button, Card, Popconfirm } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import '../style.css';
import { createDestination, fetchDestinations } from '../../../services/destination';
import DestinationForm from './DestinationForm';
import DestinationDetail from './DestinationDetails';

const DestinationMain = () => {
  const [destination, setDestination] = useState([]);
  const [pcoDestination, setPcoDestination] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(0);
  const [call, setCall] = useState(0);

  useEffect(() => {
    const fetchDataSources = async () => {
      const destinations = await fetchDestinations();
      setPcoDestination(destinations);
      setDestination(destinations);
    };
    fetchDataSources();
  }, [call]);

  const handleDestinationClick = async (source) => {
    setSelectedDestination(source);
  };

  const handleBack = () => {
    setSelectedDestination(null);
    setCall(call + 1);
  };

  const handleAddDestination = () => {
    setSelectedDestination('new');
  };

  if (selectedDestination === 'new') {
    return <DestinationForm onBack={handleBack} />;
  }

  if (selectedDestination) {
    return <DestinationDetail destination={selectedDestination} onBack={handleBack} />;
  }

  const handleCopyConfirm = async (destinationToCopy) => {
    const { id, ...destinationData } = destinationToCopy;

    const destinationToAdd = {
      ...destinationData,
      name: `${destinationToCopy.name}_Copy`
    };
    const newDestination = await createDestination(destinationToAdd);
  };

  return (
    <div className="destination-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Destination</h2>
        <Button type="primary" onClick={() => handleAddDestination(destination)}>Add Destination</Button>
      </div>
      <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {destination?.map(destination => (
          <Card
            key={destination.id}
            style={{ textAlign: 'center', cursor: 'pointer', width: '200px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}
            onClick={() => handleDestinationClick(destination)}
            className="destination-card"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Popconfirm
                title="Create a copy of this destination?"
                onConfirm={() => handleCopyConfirm(destination)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="text" 
                  className="copy-button"
                  icon={<CopyOutlined style={{ color: '#3179ED' }}/>} 
                />
              </Popconfirm>
            </div>
            <h3>{destination.name}</h3>
            <p style={{fontSize:'12px'}}>{destination.protocol}</p>
            <p style={{fontSize:'12px'}}>{destination.kafkaBrokers?.length > 30 ? destination.kafkaBrokers.substring(0, 30) + '...' : destination.kafkaBrokers}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DestinationMain; 