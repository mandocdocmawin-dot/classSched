import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    // TODO: dito ipapasok ang resulta ng aktwal na Google OAuth flow (googleAuth.js)
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard user={{ name: 'BSIS Student' }} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLogin} />
      )}
    </div>
  );
}

export default App;
