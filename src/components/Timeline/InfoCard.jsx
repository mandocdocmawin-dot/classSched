import React, { useState } from 'react';

const InfoCard = ({ title, time, location }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ 
        padding: '12px', 
        border: '1px solid #ddd', 
        borderRadius: '6px', 
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      <h4 style={{ margin: '0 0 5px 0' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{time}</p>

      {isExpanded && (
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#333' }}>
          <p><strong>Location:</strong> {location}</p>
        </div>
      )}
    </div>
  );
};

export default InfoCard;