import React, { useState } from 'react';
import { getSectionByAccessCode } from '../../config/sectionAccessCodes';
import './SectionForm.css';

const SectionForm = ({ isOpen, onClose, onSubmitSection, error }) => {
  const [accessCode, setAccessCode] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleAccessCodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAccessCode(digitsOnly);
    setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (accessCode.length !== 6) {
      setLocalError('Kailangan 6 digits ang access code.');
      return;
    }

    const matchedSection = getSectionByAccessCode(accessCode);
    if (!matchedSection) {
      setLocalError('Hindi valid ang access code na ito.');
      return;
    }
    onSubmitSection(matchedSection);
  };

  const displayError = localError || error;

  return (
    <div className="section-modal__overlay" onClick={onClose}>
      <div className="section-modal" onClick={(e) => e.stopPropagation()}>
        <div className="section-modal__header">
          <span className="section-modal__label mono-num">SET YOUR SECTION</span>
          <button className="section-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="section-modal__code-field">
            <span className="section-modal__field-label mono-num">ACCESS CODE</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className="section-modal__code-input section-modal__code-input--access mono-num"
              value={accessCode}
              onChange={handleAccessCodeChange}
              placeholder="6-digit code"
              autoFocus
              required
            />
          </label>

          {displayError && <p className="section-modal__error">{displayError}</p>}

          <button type="submit" className="section-modal__submit">
            Load Schedule
          </button>
        </form>
      </div>
    </div>
  );
};

export default SectionForm;