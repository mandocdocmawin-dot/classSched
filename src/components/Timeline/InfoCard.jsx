import React, { useState } from 'react';
import './InfoCard.css';

const STATUS_STYLES = {
  ongoing: 'info-card__status--ongoing',
  upcoming: 'info-card__status--upcoming',
  done: 'info-card__status--done',
};

const InfoCard = ({
  title,
  time,
  day,
  location,
  instructor,
  modality = 'f2f',
  status = 'upcoming',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOnline = modality === 'online';

  return (
    <div
      className={`info-card info-card--${isOnline ? 'online' : 'f2f'}`}
      onClick={() => setIsExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => e.key === 'Enter' && setIsExpanded((prev) => !prev)}
    >
      <div className="info-card__badge">
        <span className="info-card__badge-top mono-num">WEEKLY</span>
        <span className="info-card__badge-day mono-num">{day}</span>
      </div>

      <div className="info-card__body">
        <div className="info-card__top-row">
          <h4 className="info-card__title">{title}</h4>
          <span className={`info-card__status ${STATUS_STYLES[status]} mono-num`}>
            {status}
          </span>
        </div>

        <div className="info-card__time-row">
          <p className="info-card__time mono-num">
            <span aria-hidden="true">🕐</span> {time}
          </p>
          <span className="info-card__chevron" aria-hidden="true">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>

        {isExpanded && (
          <div className="info-card__details">
            <div className="info-card__detail-row">
              <span className="info-card__detail-label mono-num">INSTRUCTOR</span>
              <span className="info-card__detail-value">{instructor || '—'}</span>
            </div>
            <div className="info-card__detail-row">
              <span className="info-card__detail-label mono-num">
                {isOnline ? 'MODALITY' : 'ROOM'}
              </span>
              <span className="info-card__detail-value mono-num info-card__gate">
                {isOnline ? 'Online / Async' : (location || '—')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard;