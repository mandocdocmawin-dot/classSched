import React, { useState, useMemo } from 'react';
import InfoCard from './InfoCard';
import AccordionBanner from '../SmartStatus/AccordionBanner';
import { getShortDay, formatTimeRange, getClassStatus, getCurrentDayCode } from '../../utils/scheduleHelpers';
import './ScheduleList.css';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getFirstName(email) {
  if (!email) return 'there';
  const localPart = email.split('@')[0];
  const firstToken = localPart.split(/[._-]+/)[0] || localPart;
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
}

function getGreetingWord(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// "Thursday, August 13" — no clock time, just the day + date.
function getTodayLabel(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const ScheduleList = ({ classes = [], filterDay: controlledFilterDay, onFilterDayChange, userEmail }) => {
  const [internalFilterDay, setInternalFilterDay] = useState(getCurrentDayCode());
  const filterDay = controlledFilterDay ?? internalFilterDay;

  const handleFilterChange = (day) => {
    if (onFilterDayChange) {
      onFilterDayChange(day);
    } else {
      setInternalFilterDay(day);
    }
  };

  const filteredClasses = useMemo(
    () =>
      classes
        .filter((cls) => getShortDay(cls.day) === filterDay)
        .map((cls, index) => ({
          id: `${cls.section}-${cls.day}-${cls.startTime}-${index}`,
          day: getShortDay(cls.day),
          title: cls.course,
          time: formatTimeRange(cls.startTime, cls.endTime),
          instructor: cls.instructor,
          location: cls.modality === 'Online/Async' ? 'Google Meet' : cls.room,
          modality: cls.modality === 'Online/Async' ? 'online' : 'f2f',
          status: getClassStatus(cls.startTime, cls.endTime, cls.day),
          _sortKey: cls.startTime,
        }))
        .sort((a, b) => a._sortKey.localeCompare(b._sortKey)),
    [classes, filterDay]
  );

  const firstName = getFirstName(userEmail);

  return (
    <div className="schedule-list">
      <div className="schedule-list__header">
        <div className="schedule-list__title-row">
          <h3 className="schedule-list__title">Your Classes</h3>
          <span className="schedule-list__count mono-num">
            {classes.length} Total
          </span>
        </div>
        <label className="schedule-list__filter">
          <span className="mono-num">FILTER</span>
          <select
            value={filterDay}
            onChange={(e) => handleFilterChange(e.target.value)}
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

      <div className="schedule-list__greeting">
        <span className="schedule-list__greeting-date mono-num">
          TODAY &middot; {getTodayLabel()}
        </span>
        <p className="schedule-list__greeting-title">
          {getGreetingWord()}, {firstName}!
        </p>
      </div>

      <AccordionBanner classes={classes} />

      {filteredClasses.length > 0 ? (
        filteredClasses.map((cls) => <InfoCard key={cls.id} {...cls} />)
      ) : (
        <p className="schedule-list__empty">No classes scheduled this day.</p>
      )}
    </div>
  );
};

export default ScheduleList;