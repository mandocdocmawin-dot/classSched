import React, { useState } from 'react';
import GoogleLogin from '../components/Auth/GoogleLogin';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('landing'); // 'landing' | 'signin'

  return (
    <div className="landing">
      <header className="landing__nav">
        <span className="landing__brand">Smart Class Scheduling System</span>
        {step === 'signin' && (
          <button className="landing__back" onClick={() => setStep('landing')}>
            ← Back
          </button>
        )}
      </header>

      {step === 'landing' ? (
        <>
          <main className="landing__hero">
            <div className="landing__copy">
              <p className="landing__eyebrow">For La Verdad students</p>
              <h1 className="landing__title">
                Your week, <span className="landing__title-accent">already on the board.</span>
              </h1>
              <p className="landing__subtitle">
                Smart Class Scheduling System reads your section's official
                class schedule straight from Google Sheets and lays it out by
                day, so you always know what's next — plus a place to track
                assignments and deadlines alongside it.
              </p>

              <div className="landing__cta">
                <button className="landing__get-started" onClick={() => setStep('signin')}>
                  Get Started
                </button>
              </div>

              <ul className="landing__facts">
                <li>Sign in with your <code>@student.laverdad.edu.ph</code> account</li>
                <li>Read-only — the app never edits or deletes your section's Sheet</li>
                <li>Nothing is stored on our servers; your data stays in your browser</li>
              </ul>
            </div>

            <div className="landing__preview" aria-hidden="true">
              <div className="landing__preview-card">
                <div className="landing__preview-week">
                  <span className="landing__preview-label">Week at a glance</span>
                  <div className="landing__preview-days">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                      <div
                        key={d}
                        className={`landing__preview-day${i === 4 ? ' landing__preview-day--active' : ''}`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="landing__preview-class">
                  <span className="landing__preview-tag">WEEKLY · FRI</span>
                  <p className="landing__preview-class-name">Financial Management</p>
                  <p className="landing__preview-class-time">8:00 AM – 10:00 AM · EFS 401</p>
                </div>
                <div className="landing__preview-class landing__preview-class--muted">
                  <span className="landing__preview-tag">WEEKLY · FRI</span>
                  <p className="landing__preview-class-name">IS Project Management 1</p>
                  <p className="landing__preview-class-time">6:00 PM – 7:00 PM</p>
                </div>
              </div>
              <span className="landing__preview-caption">Preview — sample data</span>
            </div>
          </main>

          <section className="landing__how">
            <h2 className="landing__section-title">How it works</h2>
            <div className="landing__how-grid">
              <div className="landing__how-card">
                <span className="landing__how-index">01</span>
                <h3>Sign in with Google</h3>
                <p>Use your school account. Access is limited to La Verdad students only.</p>
              </div>
              <div className="landing__how-card">
                <span className="landing__how-index">02</span>
                <h3>Set your section</h3>
                <p>Tell it your program and year once — it remembers it on your device.</p>
              </div>
              <div className="landing__how-card">
                <span className="landing__how-index">03</span>
                <h3>See your week</h3>
                <p>Class times, rooms, and instructors, plus your own activities and due dates.</p>
              </div>
            </div>
          </section>

          <footer className="landing__footer">
            <p>Built for La Verdad students. Not an official school application.</p>
            <nav className="landing__footer-links">
              <a href="/privacy.html">Privacy Policy</a>
              <a href="/terms.html">Terms of Service</a>
            </nav>
          </footer>
        </>
      ) : (
        <main className="landing__signin">
          <div className="landing__signin-card">
            <p className="landing__eyebrow">Almost there</p>
            <h2 className="landing__signin-title">Sign in to continue</h2>
            <p className="landing__signin-subtitle">
              Use your <code>@student.laverdad.edu.ph</code> Google account.
              Access is verified automatically on sign-in.
            </p>
            <GoogleLogin onLogin={onLoginSuccess} />
            <nav className="landing__footer-links landing__signin-links">
              <a href="/privacy.html">Privacy Policy</a>
              <a href="/terms.html">Terms of Service</a>
            </nav>
          </div>
        </main>
      )}
    </div>
  );
};

export default Login;