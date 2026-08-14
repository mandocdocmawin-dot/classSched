import React, { useState, useMemo, useEffect } from 'react';
import { getDaysWithClasses } from '../../utils/scheduleHelpers';
import { fetchPHHolidays } from '../../services/holidaysAPI';
import { calculateActivityStatus } from '../../utils/activityHelpers';
import ClassDayModal from './ClassDayModal';
import './WeekCalendar.css';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CODE_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];


function getWeekdayCode(date) {
  const mondayFirstIndex = (date.getDay() + 6) % 7;
  return CODE_ORDER[mondayFirstIndex];
}

function toDateKey(year, month, day) {
  return `${year}-${month}-${day}`;
}

// Converts an activity's `dueDate` (stored as 'YYYY-MM-DD') into the same
// dateKey shape produced by toDateKey() above, so it can be matched against
// calendar grid cells (cell.dateKey).
function dueDateToDateKey(dueDate) {
  const [year, month, day] = dueDate.split('-').map(Number);
  return toDateKey(year, month - 1, day);
}


function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({
      date,
      day: d,
      code: getWeekdayCode(date),
      dateKey: toDateKey(year, month, d),
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
const WeekCalendar = ({ classes = [], activities = [], selectedDay, onSelectDay }) => {
  const today = new Date();
  const daysWithClasses = getDaysWithClasses(classes);

  // Group non-done activities by the date they're due, so the grid can flag
  // days that have something pending and the modal can list them. Activities
  // marked Done are excluded on purpose — once checked off, they disappear
  // from the calendar.
  const activitiesByDateKey = useMemo(() => {
    const map = {};
    activities.forEach((activity) => {
      if (!activity.dueDate) return;
      const status = calculateActivityStatus(activity.dueDate, activity.dueTime, activity.isCompleted);
      if (status === 'Done') return;
      const key = dueDateToDateKey(activity.dueDate);
      if (!map[key]) map[key] = [];
      map[key].push(activity);
    });
    return map;
  }, [activities]);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(
    toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState(null);
  const [holidaysByDate, setHolidaysByDate] = useState({});

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const viewYear = viewDate.getFullYear();

  const weeks = useMemo(
    () => buildMonthGrid(viewYear, viewDate.getMonth()),
    [viewYear, viewDate]
  );
  useEffect(() => {
    let isCancelled = false;

    fetchPHHolidays(viewYear).then((holidays) => {
      if (!isCancelled) {
        setHolidaysByDate((prev) => ({ ...prev, ...holidays }));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [viewYear]);

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (cell) => {
    if (!cell) return;
    setSelectedDateKey(cell.dateKey);
    onSelectDay(cell.code);
    setModalCell(cell);
    setIsModalOpen(true);
  };

  const activeHoliday = modalCell ? holidaysByDate[modalCell.dateKey] : null;

  return (
    <div className="week-calendar">
      <div className="week-calendar__header">
        <button
          type="button"
          className="week-calendar__nav-btn"
          onClick={goToPrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="week-calendar__title mono-num">
          {MONTH_NAMES[viewDate.getMonth()].toUpperCase()} {viewYear}
        </span>
        <button
          type="button"
          className="week-calendar__nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="week-calendar__weekday-row">
        {DAY_LABELS.map((label) => (
          <span key={label} className="week-calendar__weekday-label mono-num">
            {label}
          </span>
        ))}
      </div>

      <div className="week-calendar__grid">
        {weeks.map((week, wi) => (
          <div className="week-calendar__row" key={wi}>
            {week.map((cell, di) => {
              if (!cell) {
                return <div className="week-calendar__day week-calendar__day--blank" key={di} />;
              }

              const holiday = holidaysByDate[cell.dateKey];
              const hasClasses = daysWithClasses.includes(cell.code);
              const hasActivities = Boolean(activitiesByDateKey[cell.dateKey]);
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDateKey;

              return (
                <button
                  key={di}
                  type="button"
                  className={[
                    'week-calendar__day',
                    isSelected && 'week-calendar__day--selected',
                    isToday && 'week-calendar__day--today',
                    holiday && 'week-calendar__day--holiday',
                    !hasClasses && !hasActivities && !holiday && 'week-calendar__day--empty',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleDayClick(cell)}
                  aria-pressed={isSelected}
                  title={holiday ? holiday.name : undefined}
                >
                  <span className="week-calendar__day-date mono-num">{cell.day}</span>
                  <span className="week-calendar__day-dots" aria-hidden="true">
                    {holiday ? (
                      <span className="week-calendar__day-dot week-calendar__day-dot--holiday" />
                    ) : (
                      <>
                        <span
                          className={`week-calendar__day-dot${hasClasses ? ' week-calendar__day-dot--active' : ''}`}
                        />
                        {hasActivities && (
                          <span className="week-calendar__day-dot week-calendar__day-dot--task" />
                        )}
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="week-calendar__legend">
        <span className="week-calendar__legend-item">
          <span className="week-calendar__legend-dot week-calendar__legend-dot--active" aria-hidden="true" />
          Has class
        </span>
        <span className="week-calendar__legend-item">
          <span className="week-calendar__legend-dot" aria-hidden="true" />
          No class
        </span>
        <span className="week-calendar__legend-item">
          <span className="week-calendar__legend-dot week-calendar__legend-dot--holiday" aria-hidden="true" />
          No class (holiday)
        </span>
        <span className="week-calendar__legend-item">
          <span className="week-calendar__legend-dot week-calendar__legend-dot--task" aria-hidden="true" />
          Activity due
        </span>
      </div>

      <ClassDayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={modalCell?.date}
        dayCode={modalCell?.code}
        holiday={activeHoliday}
        classes={classes}
        activities={modalCell ? activitiesByDateKey[modalCell.dateKey] || [] : []}
      />
    </div>
  );
};

export default WeekCalendar;