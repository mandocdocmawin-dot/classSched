import React from 'react';
import { formatTimeRange, getShortDay } from '../../utils/scheduleHelpers';
import './ClassDayModal.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ClassDayModal = ({ isOpen, onClose, date, dayCode, holiday, classes = [] }) => {
  if (!isOpen || !date) return null;

  const dayClasses = classes
    .filter((cls) => getShortDay(cls.day) === dayCode)
    .map((cls, index) => ({
      id: `${cls.section}-${cls.day}-${cls.startTime}-${index}`,
      title: cls.course,
      time: formatTimeRange(cls.startTime, cls.endTime),
      instructor: cls.instructor,
      location: cls.modality === 'Online/Async' ? 'Google Meet' : cls.room,
      isOnline: cls.modality === 'Online/Async',
      _sortKey: cls.startTime,
    }))
    .sort((a, b) => a._sortKey.localeCompare(b._sortKey));

  const formattedDate = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  return (
    <div className="day-modal__overlay" onClick={onClose}>
      <div
        className="day-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="day-modal__header">
          <div>
            <span className="day-modal__date mono-num">{formattedDate}</span>
            <h3 className="day-modal__title">
              {holiday ? holiday.name : dayClasses.length > 0 ? 'Your Classes' : 'No Class'}
            </h3>
          </div>
          <button className="day-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="day-modal__body">
          {holiday ? (
            <div className="day-modal__holiday">
              <span className="day-modal__holiday-icon" aria-hidden="true">
                🎌
              </span>
              <p className="day-modal__holiday-text">
                <strong>No class</strong> today — {holiday.name}.
              </p>
              {holiday.description && (
                <p className="day-modal__holiday-sub">{holiday.description}</p>
              )}
            </div>
          ) : dayClasses.length > 0 ? (
            <div className="day-modal__list">
              {dayClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`day-modal__class day-modal__class--${cls.isOnline ? 'online' : 'f2f'}`}
                >
                  <div className="day-modal__class-top">
                    <h4 className="day-modal__class-title">{cls.title}</h4>
                    <span className="day-modal__class-time mono-num">{cls.time}</span>
                  </div>
                  <div className="day-modal__class-meta">
                    <span>{cls.instructor}</span>
                    <span className="day-modal__class-gate mono-num">
                      {cls.isOnline ? 'Online / Async' : cls.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="day-modal__empty">No classes scheduled for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDayModal;