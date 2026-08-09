import React, { useState } from 'react';
import './SectionForm.css';

const PROGRAMS = ['BSIS', 'BSIT', 'BSCS', 'BSED'];
const YEARS = ['1', '2', '3', '4'];

const SectionForm = ({ isOpen, onClose, onSubmitSection, error, initialProgram, initialYear }) => {
  const [program, setProgram] = useState(initialProgram || PROGRAMS[0]);
  const [year, setYear] = useState(initialYear || YEARS[0]);

  if (!isOpen) return null;

  const previewCode = `${program}${year}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ipasa ang section code pataas sa Dashboard
    onSubmitSection(previewCode);
  };

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
          <div className="section-modal__fields">
            <label className="section-modal__field">
              <span className="section-modal__field-label mono-num">PROGRAM</span>
              <select
                className="section-modal__select"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              >
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="section-modal__field">
              <span className="section-modal__field-label mono-num">YEAR LEVEL</span>
              <select
                className="section-modal__select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}{y === '1' ? 'st' : y === '2' ? 'nd' : y === '3' ? 'rd' : 'th'} Year
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="section-modal__preview">
            <span className="section-modal__preview-label mono-num">LOADING</span>
            <span className="section-modal__preview-code mono-num">{previewCode}</span>
          </div>

          {error && <p className="section-modal__error">{error}</p>}

          <button type="submit" className="section-modal__submit">
            Load Schedule
          </button>
        </form>
      </div>
    </div>
  );
};

export default SectionForm;
