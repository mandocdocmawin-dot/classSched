import React from 'react';
import { getCurrentDayCode, getDaysWithClasses } from '../../utils/scheduleHelpers';
import './WeekGlance.css';

const DAYS = [
  { code: 'MON', label: 'M' },
  { code: 'TUE', label: 'T' },
  { code: 'WED', label: 'W' },
  { code: 'THU', label: 'T' },
  { code: 'FRI', label: 'F' },
  { code: 'SAT', label: 'S' },
  { code: 'SUN', label: 'S' },
];

const WeekGlance = ({ classes = [] }) => {
  const activeDay = getCurrentDayCode();
  const daysWithClasses = getDaysWithClasses(classes);

  return (
    <div className="week-glance">
      <span className="week-glance__title mono-num">WEEK AT A GLANCE</span>
      <div className="week-glance__row">
        {DAYS.map((d) => (
          <div className="week-glance__day" key={d.code}>
            <span className="week-glance__day-label mono-num">{d.code}</span>
            <span
              className={`week-glance__circle${d.code === activeDay ? ' week-glance__circle--active' : ''}`}
            >
              {d.label}
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