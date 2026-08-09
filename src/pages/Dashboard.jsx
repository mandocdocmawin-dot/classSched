import React, { useState } from 'react';
import SectionForm from '../components/SectionEntry/SectionForm';
import AccordionBanner from '../components/SmartStatus/AccordionBanner';
import ScheduleList from '../components/Timeline/ScheduleList';

const Dashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState(null);

  const handleSectionSubmit = (code) => {
    console.log("Loading data for:", code);
    setActiveSection(code);
  };

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>My Schedule</h3>
        <button onClick={onLogout} style={{ padding: '4px 8px' }}>Logout</button>
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
        <p style={{ textAlign: 'center', color: '#777', marginTop: '40px' }}>
          Please enter your section code to view your schedule.
        </p>
      )}
    </div>
  );
};

export default Dashboard;