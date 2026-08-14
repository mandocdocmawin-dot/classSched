import React, { useState } from 'react';
import { PROGRAM_TABS, YEAR_LEVELS, buildSectionCode } from '../../config/sectionPrograms';
import './SectionForm.css';

const SectionForm = ({ isOpen, onClose, onSubmitSection, error }) => {
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!program || !yearLevel) {
      setLocalError('Piliin ang program at year level.');
      return;
    }

    const sectionCode = buildSectionCode(program, yearLevel);
    if (!sectionCode) {
      setLocalError('Hindi valid ang napiling program/year level.');
      return;
    }
    onSubmitSection(sectionCode);
  };

  const displayError = localError || error;

  return (
    <div className="section-modal__overlay" onClick={onClose}>
      <div className="section-modal" onClick={(e) => e.stopPropagation()}>
        <div className="section-modal__header">
          <span className="section-modal__label mono-num">SET YOUR COURSE</span>
          <button className="section-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="section-modal__code-field">
            <span className="section-modal__field-label mono-num">PROGRAM</span>
            <select
              className="section-modal__code-input section-modal__select mono-num"
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setLocalError('');
              }}
              autoFocus
              required
            >
              <option value="" disabled>
                Select program
              </option>
              {PROGRAM_TABS.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
          </label>

          <label className="section-modal__code-field">
            <span className="section-modal__field-label mono-num">YEAR LEVEL</span>
            <select
              className="section-modal__code-input section-modal__select mono-num"
              value={yearLevel}
              onChange={(e) => {
                setYearLevel(e.target.value);
                setLocalError('');
              }}
              required
            >
              <option value="" disabled>
                Select year level
              </option>
              {YEAR_LEVELS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
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