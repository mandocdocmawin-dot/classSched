// src/components/Activities/ActivityForm.jsx
import React, { useState, useMemo } from 'react';
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

  // Subject choices come straight from the section's own Google Sheets
  // schedule (the `course` field parsed in sheetsAPI.js), so the dropdown
  // only ever shows subjects the student is actually enrolled in.
  // Some rows in the sheet aren't real subjects (e.g. "Dedicated Time For",
  // "Student Activity Program", "Weekly Clean-Up") — those are filtered out.
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
      // I-update ang existing activity (hindi na gagawa ng bago)
      await updateActivity(userEmail, sectionCode, initialActivity.id, formData);
    } else {
      // I-save ang bagong activity gamit ang storage helper
      await addActivity(userEmail, sectionCode, formData);
      setFormData(EMPTY_FORM);
    }

    // I-trigger ang callback para mag-refresh ang listahan
    if (onActivityAdded) onActivityAdded();
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h4>{isEditing ? 'Edit Activity' : 'Add New Activity'}</h4>

      <div className="form-group">
        <label>Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
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
        <label>Subject</label>
        <select name="relatedSubject" value={formData.relatedSubject} onChange={handleChange}>
          <option value="">— None / Not linked to a class —</option>
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
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </div>

      <button type="submit" className="btn-submit">
        {isEditing ? 'Update Activity' : 'Save Activity'}
      </button>
    </form>
  );
};

export default ActivityForm;