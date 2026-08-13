import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { initGoogleAuth, signIn, verifyEduAndFetchSheet, saveSession, getSession, clearSession } from './services/googleAuth';
import './App.css';

async function fetchUserEmail(accessToken) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user info');
    const data = await res.json();
    return data.email || null;
  } catch (e) {
    console.error('Failed to fetch user email:', e);
    return null;
  }
}

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setAccessToken(session.accessToken);
      verifyEduAndFetchSheet(session.accessToken)
        .then(() => fetchUserEmail(session.accessToken))
        .then(setUserEmail)
        .catch(() => {
          clearSession();
          setAccessToken(null);
          setUserEmail(null);
          setAuthError(true);
        });
    }

    initGoogleAuth(async (token, expiresIn) => {
      try {
        await verifyEduAndFetchSheet(token);
        const email = await fetchUserEmail(token);
        saveSession(token, expiresIn);
        setAccessToken(token);
        setUserEmail(email);
        setAuthError(false);
      } catch (e) {
        setAuthError(true);
      }
    });
  }, []);

  const handleLogout = () => {
    clearSession();
    setAccessToken(null);
    setUserEmail(null);
  };

  return (
    <div className="App">
      {accessToken ? (
        <Dashboard accessToken={accessToken} userEmail={userEmail} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={signIn} />
      )}
      {authError && <div className="access-denied-banner">Access Denied — .edu account required</div>}
    </div>
  );
}

export default App;