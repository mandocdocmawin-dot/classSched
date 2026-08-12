// src/components/Activities/ActivityForm.jsx
import React, { useState } from 'react';
import './ActivityForm.css';
import { addActivity } from '../../utils/activityStorage';

const ActivityForm = ({ userEmail, sectionCode, onActivityAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Assignment',
    dueDate: '',
    dueTime: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // I-save ang activity gamit ang storage helper
    await addActivity(userEmail, sectionCode, formData);
    
    // I-reset ang form
    setFormData({ title: '', type: 'Assignment', dueDate: '', dueTime: '', notes: '' });
    
    // I-trigger ang callback para mag-refresh ang listahan
    if (onActivityAdded) onActivityAdded();
  };

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <h4>Add New Activity</h4>
      
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
        <label>Due Date</label>
        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Due Time</label>
        <input type="time" name="dueTime" value={formData.dueTime} onChange={handleChange} required />
      </div>

      <button type="submit" className="btn-submit">Save Activity</button>
    </form>
  );
};

export default ActivityForm;