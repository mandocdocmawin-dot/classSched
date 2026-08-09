import React, { useState, useEffect } from 'react';
import './SectionForm.css';

const PROGRAMS = ['BSIS', 'BSIT', 'BSCS', 'BSED'];
const YEARS = ['1', '2', '3', '4'];

const SectionForm = ({ isOpen, onClose, onSubmitSection, error, initialProgram, initialYear }) => {
  const [program, setProgram] = useState(initialProgram || PROGRAMS[0]);
  const [year, setYear] = useState(initialYear || YEARS[0]);
  const [sectionCode, setSectionCode] = useState(`${initialProgram || PROGRAMS[0]}${initialYear || YEARS[0]}`);
  const [codeEditedManually, setCodeEditedManually] = useState(false);

  // Auto-fill the code from Program + Year, unless the user has typed
  // their own value directly into the field.
  useEffect(() => {
    if (!codeEditedManually) {
      setSectionCode(`${program}${year}`);
    }
  }, [program, year, codeEditedManually]);

  if (!isOpen) return null;

  const handleCodeChange = (e) => {
    setCodeEditedManually(true);
    setSectionCode(e.target.value.toUpperCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ipasa ang section code pataas sa Dashboard
    onSubmitSection(sectionCode);
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
                onChange={(e) => {
                  setProgram(e.target.value);
                  setCodeEditedManually(false);
                }}
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
                onChange={(e) => {
                  setYear(e.target.value);
                  setCodeEditedManually(false);
                }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}{y === '1' ? 'st' : y === '2' ? 'nd' : y === '3' ? 'rd' : 'th'} Year
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="section-modal__code-field">
            <span className="section-modal__field-label mono-num">SECTION CODE</span>
            <input
              type="text"
              className="section-modal__code-input mono-num"
              value={sectionCode}
              onChange={handleCodeChange}
              placeholder="e.g. BSIS2"
              autoCapitalize="characters"
            />
          </label>

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
