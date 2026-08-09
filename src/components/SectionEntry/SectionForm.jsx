import React, { useState } from 'react';
import './SectionForm.css';

const SectionForm = ({ onSubmitSection, error }) => {
  const [sectionCode, setSectionCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ipasa ang section code pataas sa Dashboard
    onSubmitSection(sectionCode);
  };

  return (
    <div className="section-form">
      <div className="section-form__label-row">
        <span className="section-form__label mono-num">SECTION CODE</span>
        <span className="section-form__hint">e.g. BSIS2</span>
      </div>
      <form onSubmit={handleSubmit} className="section-form__row">
        <input
          type="text"
          placeholder="BSIS2"
          value={sectionCode}
          onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
          className={`section-form__input mono-num${error ? ' section-form__input--error' : ''}`}
          autoCapitalize="characters"
        />
        <button type="submit" className="section-form__submit">
          Load
        </button>
      </form>
      {error && <p className="section-form__error">{error}</p>}
    </div>
  );
};

export default SectionForm;
