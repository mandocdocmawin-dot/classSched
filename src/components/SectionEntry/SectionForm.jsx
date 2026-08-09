import React, { useState } from 'react';

const SectionForm = ({ onSubmitSection }) => {
  const [sectionCode, setSectionCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ipasa ang section code pataas sa Dashboard
    onSubmitSection(sectionCode);
  };

  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h4>Enter Section Code</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <input 
          type="text" 
          placeholder="e.g. BSIS2" 
          value={sectionCode}
          onChange={(e) => setSectionCode(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px' }}>Load Schedule</button>
      </form>
    </div>
  );
};

export default SectionForm;