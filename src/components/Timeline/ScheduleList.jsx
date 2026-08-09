import React from 'react';
import InfoCard from './InfoCard';

const ScheduleList = () => {
  // Placeholder data - mamaya kukunin natin ito sa Google Sheets!
  const upcomingClasses = [
    { id: 1, title: 'Life and Works of Rizal', time: '1:00 PM - 2:30 PM', location: 'Room 101 🏫' },
    { id: 2, title: 'Web Development', time: '3:00 PM - 5:00 PM', location: 'Online 💻' }
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Upcoming Classes</h3>
      {upcomingClasses.map((cls) => (
        <InfoCard 
          key={cls.id} 
          title={cls.title} 
          time={cls.time} 
          location={cls.location} 
        />
      ))}
    </div>
  );
};

export default ScheduleList;