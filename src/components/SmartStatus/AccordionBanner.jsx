import React, { useState } from 'react';

const AccordionBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px', 
        marginBottom: '20px',
        cursor: 'pointer'
      }}
    >
      <h3 style={{ margin: 0 }}>CURRENT: Business Process Management</h3>
      
      {isExpanded && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #90caf9' }}>
          <p><strong>Instructor:</strong> Prof. Dela Cruz</p>
          <p><strong>Room:</strong> EFS 403 🏫</p>
          <button style={{ marginTop: '10px', padding: '6px 12px' }}>Open Google Meet</button>
        </div>
      )}
      
      {/* Elapsed Time Progress Bar Placeholder */}
      <div style={{ width: '100%', height: '4px', backgroundColor: '#bbdefb', marginTop: '15px', borderRadius: '2px' }}>
        <div style={{ width: '45%', height: '100%', backgroundColor: '#1976d2', borderRadius: '2px' }}></div>
      </div>
    </div>
  );
};

export default AccordionBanner;