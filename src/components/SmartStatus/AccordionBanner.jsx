import React, { useState } from 'react';
import { pickCurrentOrNextClass, getProgressPercent, formatMinutesUntil } from '../../utils/scheduleHelpers';
import './AccordionBanner.css';

const AccordionBanner = ({ classes = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { status, classItem, minutesUntil } = pickCurrentOrNextClass(classes);

  if (status === 'idle' && !classItem) {
    return (
      <div className="banner banner--idle">
        <span className="banner__eyebrow mono-num">NO MORE CLASSES</span>
        <p className="banner__idle-text">
          Wala ka nang klase ngayong araw. Enjoy the rest of your day!
        </p>
      </div>
    );
  }

  if (status === 'idle') {
    return (
      <div className="banner banner--idle">
        <span className="banner__eyebrow mono-num">ON BREAK</span>
        <p className="banner__idle-text">
          You're on a break! Next class:{' '}
          <strong>{classItem.course}</strong> in{' '}
          <span className="mono-num">{formatMinutesUntil(minutesUntil)}</span>.
        </p>
      </div>
    );
  }

  const isOnline = classItem.modality === 'Online/Async';
  const progressPercent = getProgressPercent(classItem.startTime, classItem.endTime);

  return (
    <div
      className={`banner banner--${isOnline ? 'online' : 'f2f'}`}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
    >
      <div className="banner__top">
        <span className="banner__eyebrow mono-num">
          NOW BOARDING {isOnline ? '💻' : '🎒'}
        </span>
        <span className="banner__chevron">{isExpanded ? '▲' : '▼'}</span>
      </div>

      <h3 className="banner__title">{classItem.course}</h3>

      {isExpanded && (
        <div className="banner__details">
          <div className="banner__detail-row">
            <span className="banner__detail-label mono-num">INSTRUCTOR</span>
            <span className="banner__detail-value">{classItem.instructor}</span>
          </div>
          <div className="banner__detail-row">
            <span className="banner__detail-label mono-num">
              {isOnline ? 'MODALITY' : 'ROOM'}
            </span>
            <span className="banner__detail-value mono-num banner__gate">
              {isOnline ? 'Online / Async' : classItem.room}
            </span>
          </div>
          <button
            className="banner__action"
            onClick={(e) => e.stopPropagation()}
          >
            {isOnline ? 'Join Google Meet' : 'View Room on Map'}
          </button>
        </div>
      )}

      <div className="banner__progress" aria-hidden="true">
        <div
          className="banner__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default AccordionBanner;