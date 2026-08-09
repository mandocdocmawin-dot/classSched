import React from 'react';

const GoogleLogin = ({ onLogin }) => {
  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <button 
        onClick={onLogin}
        style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '5px', cursor: 'pointer' }}
      >
        Sign in with Google (.edu)
      </button>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        *Only authorized university accounts are allowed.
      </p>
    </div>
  );
};

export default GoogleLogin;