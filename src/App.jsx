import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { initGoogleAuth, signIn, verifyEduAndFetchSheet } from './services/googleAuth';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    initGoogleAuth(async (token) => {
      try {
        await verifyEduAndFetchSheet(token);
        setAccessToken(token);
        setAuthError(false);
      } catch (e) {
        setAuthError(true);
      }
    });
  }, []);

  const handleLogout = () => {
    setAccessToken(null);
  };

  return (
    <div className="App">
      {accessToken ? (
        <Dashboard accessToken={accessToken} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={signIn} />
      )}
      {authError && <div className="access-denied-banner">Access Denied — .edu account required</div>}
    </div>
  );
}

export default App;