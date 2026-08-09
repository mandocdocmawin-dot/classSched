import React from 'react';
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
  const isOnline = modality === 'online';

  return (
    <div className={`info-card info-card--${isOnline ? 'online' : 'f2f'}`}>
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

        <p className="info-card__time mono-num">
          <span aria-hidden="true">🕐</span> {time}
        </p>

        <div className="info-card__subtext">
          {instructor ? `${instructor} · ` : ''}
          {location || (isOnline ? 'Online' : '—')}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
