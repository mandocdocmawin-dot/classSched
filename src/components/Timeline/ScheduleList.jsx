import React from 'react';
import InfoCard from './InfoCard';
import './ScheduleList.css';

const ScheduleList = () => {
  // Placeholder data - mamaya kukunin natin ito sa Google Sheets!
  const upcomingClasses = [
    {
      id: 1,
      title: 'Life and Works of Rizal',
      time: '1:00 PM – 2:30 PM',
      location: 'Room 101',
      instructor: 'Prof. Santos',
      modality: 'f2f',
    },
    {
      id: 2,
      title: 'Web Development',
      time: '3:00 PM – 5:00 PM',
      location: 'Google Meet',
      instructor: 'Prof. Reyes',
      modality: 'online',
    },
  ];

  return (
    <div className="schedule-list">
      <div className="schedule-list__header">
        <h3 className="schedule-list__title mono-num">UP NEXT</h3>
        <span className="schedule-list__count mono-num">
          {upcomingClasses.length} STOPS
        </span>
      </div>
      {upcomingClasses.map((cls) => (
        <InfoCard
          key={cls.id}
          title={cls.title}
          time={cls.time}
          location={cls.location}
          instructor={cls.instructor}
          modality={cls.modality}
        />
      ))}
    </div>
  );
};

export default ScheduleList;
