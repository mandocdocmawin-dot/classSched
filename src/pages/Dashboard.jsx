import React, { useState } from 'react';
import SectionForm from '../components/SectionEntry/SectionForm';
import AccordionBanner from '../components/SmartStatus/AccordionBanner';
import ScheduleList from '../components/Timeline/ScheduleList';
import WeekGlance from '../components/Timeline/WeekGlance';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSectionSubmit = (code) => {
    console.log('Loading data for:', code);
    setActiveSection(code);
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Weekly Schedule</h1>
          <p className="dashboard__subtitle">
            {activeSection
              ? `Showing recurring sessions for ${activeSection}.`
              : 'Set your program & year to load your sessions.'}
          </p>
        </div>
        <button className="dashboard__add-btn" onClick={() => setIsModalOpen(true)}>
          <span aria-hidden="true">+</span> {activeSection ? 'Add New' : 'Set Section'}
        </button>
      </header>

      <SectionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSection={handleSectionSubmit}
      />

      {activeSection ? (
        <>
          <AccordionBanner />
          <ScheduleList />
          <WeekGlance />
        </>
      ) : (
        <div className="dashboard__empty">
          <span className="dashboard__empty-icon" aria-hidden="true">
            🎫
          </span>
          <p className="dashboard__empty-text">
            No section set yet. Tap "Set Section" to pick your program and
            year and pull up your weekly schedule.
          </p>
          <button className="dashboard__empty-cta" onClick={() => setIsModalOpen(true)}>
            + Set Section
          </button>
        </div>
      )}

      <button className="dashboard__logout" onClick={onLogout}>
        Sign out
      </button>
    </div>
  );
};

export default Dashboard;
