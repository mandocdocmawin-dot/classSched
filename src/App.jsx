import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';

function App() {
  // Naka-set muna sa true para habang nagse-setup ka, agad mong makikita ang Dashboard UI
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard user={{ name: 'BSIS Student' }} onLogout={handleLogout} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '80px', padding: '20px' }}>
          <h2>Smart Class Scheduling System</h2>
          <p>Please sign in with your Google .edu account to continue.</p>
          <button 
            onClick={handleLogin} 
            style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}

export default App;