import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { initGoogleAuth, signIn, verifyEduAndFetchSheet, saveSession, getSession, clearSession } from './services/googleAuth';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setAccessToken(session.accessToken);
      verifyEduAndFetchSheet(session.accessToken).catch(() => {
        clearSession();
        setAccessToken(null);
        setAuthError(true);
      });
    }

    initGoogleAuth(async (token, expiresIn) => {
      try {
        await verifyEduAndFetchSheet(token);
        saveSession(token, expiresIn);
        setAccessToken(token);
        setAuthError(false);
      } catch (e) {
        setAuthError(true);
      }
    });
  }, []);

  const handleLogout = () => {
    clearSession();
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