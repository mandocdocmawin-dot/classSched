import React from 'react';
import { getCurrentDayCode, getDaysWithClasses } from '../../utils/scheduleHelpers';
import './WeekGlance.css';

const DAYS = [
  { code: 'MON', label: 'MON' },
  { code: 'TUE', label: 'TUE' },
  { code: 'WED', label: 'WED' },
  { code: 'THU', label: 'THU' },
  { code: 'FRI', label: 'FRI' },
  { code: 'SAT', label: 'SAT' },
  { code: 'SUN', label: 'SUN' },
];

// Returns the date-of-month for each weekday (Mon..Sun) of the week
// containing `today`, in the same order as DAYS.
function getCurrentWeekDates(today = new Date()) {
  const jsDay = today.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const mondayOffset = (jsDay + 6) % 7; // days since this week's Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

const WeekGlance = ({ classes = [] }) => {
  const activeDay = getCurrentDayCode();
  const daysWithClasses = getDaysWithClasses(classes);
  const weekDates = getCurrentWeekDates();

  return (
    <div className="week-glance">
      <span className="week-glance__title mono-num">WEEK AT A GLANCE</span>
      <div className="week-glance__row">
        {DAYS.map((d, i) => (
          <div className="week-glance__day" key={d.code}>
            <span className="week-glance__day-label mono-num">{d.label}</span>
            <span
              className={`week-glance__circle mono-num${d.code === activeDay ? ' week-glance__circle--active' : ''}`}
            >
              {weekDates[i]}
            </span>
            {daysWithClasses.includes(d.code) && (
              <span className="week-glance__dot" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekGlance;