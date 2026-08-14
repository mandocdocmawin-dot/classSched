import React from 'react';
import GoogleLogin from '../components/Auth/GoogleLogin';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  return (
    <div className="login">
      <div className="login__board">
        <div className="login__eyebrow">
          <span className="mono-num">TERMINAL</span>
          <span className="login__eyebrow-divider" />
          <span className="mono-num">BSIS</span>
        </div>

        <h1 className="login__title">
          Smart Class
          <br />
          Scheduling
        </h1>

        <p className="login__subtitle">
          Your day, gate by gate. Sign in to see what's next, where it's held,
          and how much time you have left.
        </p>

        <GoogleLogin onLogin={onLoginSuccess} />
      </div>

      <p className="login__footer mono-num">SCHOOL WI-FI RECOMMENDED · v1.1</p>
    </div>
  );
};

export default Login;
