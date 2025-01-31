import React, { useState, useEffect } from 'react';
import { Button, Card, Popconfirm } from 'antd';
import DestinationForm from './DestinationForm';
import DestinationDetail from './DestinationDetails';
import { CopyOutlined } from '@ant-design/icons';
import '../style.css';
import { fetchDestinationById, fetchDestinations } from '../../../services/destination';

const DestinationMain = () => {
  const [destinations, setDestinations] = useState([]);
  const [pcoDestinations, setPcoDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(0);
  const [call, setCall] = useState(0);

  useEffect(() => {
    // const fetchDataDestinations = async () => {
    //   const destinations = await fetchDestinations();
    //   setPcoDestinations(destinations);
    // };
    // fetchDataDestinations();
    const storedDestinations = localStorage.getItem('destinations');
    if (storedDestinations) {
      setDestinations(JSON.parse(storedDestinations));
    }
  }, [call]);

  const handleDestinationClick = async (destination) => {
    setSelectedDestination(destination?.id);
    const pcoDestination = await fetchDestinationById(destination?.id);
  };

  const handleBack = () => {
    setSelectedDestination(null);
    setCall(call + 1);
  };

  const handleAddDestination = () => {
    setSelectedDestination('new');
  };

  const handleCopyConfirm = (destinationToCopy) => {
    const destinationToAdd = {
      ...destinationToCopy,
      id: Date.now(),
      name: `${destinationToCopy.name}_Copy`
    };

    const updatedDestinations = [...destinations, destinationToAdd];
    localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
    setDestinations(updatedDestinations);
  };

  if (selectedDestination === 'new') {
    return <DestinationForm onBack={handleBack} />;
  }

  if (selectedDestination) {
    return <DestinationDetail destinations={selectedDestination} onBack={handleBack} pcoDestinations={pcoDestinations}/>;
  }

  return (
    <div className="destinations-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Destinations</h2>
        <Button type="primary" onClick={() => handleAddDestination(destinations)}>Add Destination</Button>
      </div>
      <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {destinations?.map(destination => (
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
            <p style={{fontSize:'12px'}}>{destination.type}</p>
            <p style={{fontSize:'12px'}}>{destination.description.length > 30 ? destination.description.substring(0, 30) + '...' : destination.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DestinationMain; 