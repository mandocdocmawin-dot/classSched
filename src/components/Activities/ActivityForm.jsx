// src/components/Activities/ActivityForm.jsx
import React, { useState, useMemo, useRef } from 'react';
import './ActivityForm.css';
import { addActivity, updateActivity } from '../../utils/activityStorage';

const EMPTY_FORM = {
  title: '',
  type: 'Assignment',
  dueDate: '',
  dueTime: '',
  relatedSubject: '',
  notes: ''
};

const ActivityForm = ({ userEmail, sectionCode, classes = [], initialActivity = null, onActivityAdded }) => {
  const isEditing = Boolean(initialActivity);

  const [formData, setFormData] = useState(() =>
    initialActivity
      ? {
          title: initialActivity.title || '',
          type: initialActivity.type || 'Assignment',
          dueDate: initialActivity.dueDate || '',
          dueTime: initialActivity.dueTime || '',
          relatedSubject: initialActivity.relatedSubject || '',
          notes: initialActivity.notes || ''
        }
      : EMPTY_FORM
  );

  const EXCLUDED_SUBJECT_PATTERNS = [
    /dedicated time for/i,
    /student activity program/i,
    /weekly clean[\s-]*up/i,
  ];

  const subjectOptions = useMemo(() => {
    const unique = new Set(
      classes
        .map((c) => (c.course || '').trim())
        .filter(Boolean)
        .filter((course) => !EXCLUDED_SUBJECT_PATTERNS.some((pattern) => pattern.test(course)))
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [classes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      await updateActivity(userEmail, sectionCode, initialActivity.id, formData);
    } else {
      await addActivity(userEmail, sectionCode, formData);
      setFormData(EMPTY_FORM);
    }

    if (onActivityAdded) onActivityAdded();
  };

  const formRef = useRef(null);

  // Pressing Enter in ANY field (including the notes textarea) tries to
  // save the activity. requestSubmit() runs the browser's normal form
  // validation first, so if a required field (Title, Subject, Due Date,
  // Due Time) is still empty, the browser highlights it and shows its
  // "please fill out this field" message instead of doing nothing.
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form ref={formRef} className="activity-form" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
      <h4>{isEditing ? 'Edit Activity' : 'Add New Activity'}</h4>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          maxLength={100}
          required
        />
        <span className="form-charcount">{formData.title.length}/100</span>
      </div>

      <div className="form-group">
        <label>Type</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="Assignment">Assignment</option>
          <option value="Project">Project</option>
          <option value="Quiz">Quiz</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Subject *</label>
        <select
          name="relatedSubject"
          value={formData.relatedSubject}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select a subject
          </option>
          {subjectOptions.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        {subjectOptions.length === 0 && (
          <span className="form-hint">
            No subjects loaded yet from your schedule. Set a section on the dashboard first.
          </span>
        )}
      </div>

      <div className="form-group">
        <label>Due Date</label>
        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Due Time</label>
        <input type="time" name="dueTime" value={formData.dueTime} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          className="notes-textarea"
          value={formData.notes}
          onChange={handleChange}
          rows={8}
          maxLength={500}
          enterKeyHint="enter"
        />
        <span className="form-charcount">{formData.notes.length}/500</span>
      </div>

      <button type="submit" className="btn-submit">
        {isEditing ? 'Update Activity' : 'Save Activity'}
      </button>
    </form>
  );
};

export default ActivityForm;