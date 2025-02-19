import React, { useState, useEffect } from 'react';
import { Button, Card, Popconfirm } from 'antd';
import SourceDetail from './SourceDetail';
import SourceForm from './SourceForm';
import { CopyOutlined } from '@ant-design/icons';
import '../style.css';
import { createSource, fetchSourceById, fetchSources } from '../../../services/source';
import SourceDetails from './SourceDetails';

const Sources = () => {
  const [sources, setSources] = useState([]);
  const [pcoSources, setPcoSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(0);
  const [call, setCall] = useState(0);

  useEffect(() => {
    // const storedSources = localStorage.getItem('sources');
    // const fetchDataSources = async () => {
    //   const sources = await fetchSources();
    //   setPcoSources(sources);
    // };
    // fetchDataSources();
    // if (storedSources) {
    //   setSources(JSON.parse(storedSources));
    // }

    const fetchDataSources = async () => {
      const sources = await fetchSources();
      setPcoSources(sources);
      setSources(sources);
    };
    fetchDataSources();
  }, [call]);

  const handleSourceClick = async (source) => {
    setSelectedSource(source);
  };

  const handleBack = () => {
    setSelectedSource(null);
    setCall(call + 1);
  };

  const handleAddSource = () => {
    setSelectedSource('new');
  };

  if (selectedSource === 'new') {
    return <SourceForm onBack={handleBack} />;
  }

  if (selectedSource) {
    // return <SourceDetail sources={selectedSource} onBack={handleBack} />;
    return <SourceDetails sources={selectedSource} onBack={handleBack} />;
  }

  const handleCopyConfirm = async (sourceToCopy) => {
    const { id, ...sourceData } = sourceToCopy;

    const sourceToAdd = {
      ...sourceData,
      name: `${sourceToCopy.name}_Copy`
    };

    const newSource = await createSource(sourceToAdd);
    
    // const updatedSources = [...sources, newSource];
    // localStorage.setItem('sources', JSON.stringify(updatedSources));
    // setSources(updatedSources);
  };

  return (
    <div className="sources-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Sources</h2>
        <Button type="primary" onClick={() => handleAddSource(sources)}>Add Source</Button>
      </div>
      <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {sources?.map(source => (
          <Card
            key={source.id}
            style={{ textAlign: 'center', cursor: 'pointer', width: '200px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}
            onClick={() => handleSourceClick(source)}
            className="source-card"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Popconfirm
                title="Create a copy of this source?"
                onConfirm={() => handleCopyConfirm(source)}
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
            <h3>{source.name}</h3>
            <p style={{fontSize:'12px'}}>{source.type}</p>
            <p style={{fontSize:'12px'}}>{source.endpointUrl.length > 30 ? source.endpointUrl.substring(0, 30) + '...' : source.endpointUrl}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sources; 