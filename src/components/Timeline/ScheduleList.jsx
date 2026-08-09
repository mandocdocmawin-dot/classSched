import React, { useState, useMemo } from 'react';
import InfoCard from './InfoCard';
import './ScheduleList.css';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Placeholder data - mamaya kukunin natin ito sa Google Sheets!
const ALL_CLASSES = [
  { id: 1, day: 'MON', title: 'Human Computer Interaction', time: '08:00 – 09:30', instructor: 'Mr. Gian Carlo Gallon', location: 'Com Lab B', modality: 'f2f', status: 'upcoming' },
  { id: 2, day: 'WED', title: 'Human Computer Interaction', time: '08:00 – 09:30', instructor: 'Mr. Gian Carlo Gallon', location: 'Com Lab B', modality: 'f2f', status: 'ongoing' },
  { id: 3, day: 'WED', title: 'Dedicated Time for Program Meetings', time: '10:00 – 11:00', instructor: '', location: 'Student Lounge', modality: 'f2f', status: 'upcoming' },
  { id: 4, day: 'WED', title: 'Team Sports', time: '13:00 – 14:30', instructor: 'Ms. Kethleen Onato', location: 'EFS 403', modality: 'f2f', status: 'upcoming' },
  { id: 5, day: 'WED', title: 'Student Activity Program', time: '15:00 – 16:00', instructor: '', location: 'Covered Court', modality: 'f2f', status: 'upcoming' },
  { id: 6, day: 'THU', title: 'Web Development', time: '13:00 – 15:00', instructor: 'Prof. Reyes', location: 'Google Meet', modality: 'online', status: 'upcoming' },
  { id: 7, day: 'FRI', title: 'Life and Works of Rizal', time: '10:00 – 11:30', instructor: 'Prof. Santos', location: 'Room 101', modality: 'f2f', status: 'upcoming' },
];

const ScheduleList = () => {
  const [filterDay, setFilterDay] = useState('WED');

  const filteredClasses = useMemo(
    () => ALL_CLASSES.filter((cls) => cls.day === filterDay),
    [filterDay]
  );

  return (
    <div className="schedule-list">
      <div className="schedule-list__header">
        <div className="schedule-list__title-row">
          <h3 className="schedule-list__title">Your Classes</h3>
          <span className="schedule-list__count mono-num">
            {ALL_CLASSES.length} Total
          </span>
        </div>
        <label className="schedule-list__filter">
          <span className="mono-num">FILTER</span>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="schedule-list__filter-select"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredClasses.length > 0 ? (
        filteredClasses.map((cls) => <InfoCard key={cls.id} {...cls} />)
      ) : (
        <p className="schedule-list__empty">No classes scheduled this day.</p>
      )}
    </div>
  );
};

export default ScheduleList;
