import React, { useState } from 'react';
import './AccordionBanner.css';

const AccordionBanner = ({
  status = 'current', // 'current' | 'idle'
  courseTitle = 'Business Process Management',
  instructor = 'Prof. Dela Cruz',
  room = 'EFS 403',
  modality = 'f2f', // 'f2f' | 'online'
  meetLink,
  progressPercent = 45,
  nextClassTitle = 'Life and Works of Rizal',
  nextClassMinutes = 45,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOnline = modality === 'online';

  if (status === 'idle') {
    return (
      <div className="banner banner--idle">
        <span className="banner__eyebrow mono-num">ON BREAK</span>
        <p className="banner__idle-text">
          You're on a break! Next class:{' '}
          <strong>{nextClassTitle}</strong> in{' '}
          <span className="mono-num">{nextClassMinutes} mins</span>.
        </p>
      </div>
    );
  }

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

      <h3 className="banner__title">{courseTitle}</h3>

      {isExpanded && (
        <div className="banner__details">
          <div className="banner__detail-row">
            <span className="banner__detail-label mono-num">INSTRUCTOR</span>
            <span className="banner__detail-value">{instructor}</span>
          </div>
          <div className="banner__detail-row">
            <span className="banner__detail-label mono-num">
              {isOnline ? 'MODALITY' : 'ROOM'}
            </span>
            <span className="banner__detail-value mono-num banner__gate">
              {isOnline ? 'Online / Async' : room}
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
