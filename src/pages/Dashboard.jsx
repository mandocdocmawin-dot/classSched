import React, { useState } from 'react';
import SectionForm from '../components/SectionEntry/SectionForm';
import AccordionBanner from '../components/SmartStatus/AccordionBanner';
import ScheduleList from '../components/Timeline/ScheduleList';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState(null);

  const handleSectionSubmit = (code) => {
    console.log('Loading data for:', code);
    setActiveSection(code);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <span className="dashboard__eyebrow mono-num">MY SCHEDULE</span>
          {activeSection && (
            <h2 className="dashboard__section mono-num">{activeSection}</h2>
          )}
        </div>
        <button className="dashboard__logout" onClick={onLogout}>
          Sign out
        </button>
      </header>

      {/* Section Code Entry Component */}
      <SectionForm onSubmitSection={handleSectionSubmit} />

      {/* Kung may section na, ipakita ang schedule components */}
      {activeSection ? (
        <>
          <AccordionBanner />
          <ScheduleList />
        </>
      ) : (
        <div className="dashboard__empty">
          <span className="dashboard__empty-icon" aria-hidden="true">
            🎫
          </span>
          <p className="dashboard__empty-text">
            Enter your section code above to pull up today's boarding schedule.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
