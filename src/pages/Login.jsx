import React from 'react';
import GoogleLogin from '../components/Auth/GoogleLogin';

const Login = ({ onLoginSuccess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
      <h2>Smart Class Scheduling System</h2>
      <p style={{ textAlign: 'center', color: '#555' }}>Manage your classes seamlessly with real-time updates.</p>
      
      <GoogleLogin onLogin={onLoginSuccess} />
    </div>
  );
};

export default Login;