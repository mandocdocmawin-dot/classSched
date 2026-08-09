import React, { useState } from 'react';
import './InfoCard.css';

const InfoCard = ({ title, time, location, instructor, modality = 'f2f' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isOnline = modality === 'online';

  return (
    <div
      className={`info-card info-card--${isOnline ? 'online' : 'f2f'}`}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
    >
      <div className="info-card__main">
        <h4 className="info-card__title">{title}</h4>
        <p className="info-card__time mono-num">{time}</p>
      </div>

      <div className="info-card__stub">
        <span className="info-card__stub-icon" aria-hidden="true">
          {isOnline ? '💻' : '🏫'}
        </span>
      </div>

      {isExpanded && (
        <div className="info-card__details">
          <div className="info-card__detail-row">
            <span className="info-card__detail-label mono-num">
              {isOnline ? 'MODALITY' : 'ROOM'}
            </span>
            <span className="info-card__detail-value">
              {location || (isOnline ? 'Online' : '—')}
            </span>
          </div>
          {instructor && (
            <div className="info-card__detail-row">
              <span className="info-card__detail-label mono-num">FACULTY</span>
              <span className="info-card__detail-value">{instructor}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoCard;
