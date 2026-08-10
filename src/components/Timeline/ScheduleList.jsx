import React, { useState, useMemo } from 'react';
import InfoCard from './InfoCard';
import { getShortDay, formatTimeRange, getClassStatus, getCurrentDayCode } from '../../utils/scheduleHelpers';
import './ScheduleList.css';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const ScheduleList = ({ classes = [] }) => {
  const [filterDay, setFilterDay] = useState(getCurrentDayCode());

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