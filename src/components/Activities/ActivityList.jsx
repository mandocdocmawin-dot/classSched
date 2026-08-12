// src/components/Activities/ActivityList.jsx
import React, { useState, useEffect } from 'react';
import './ActivityList.css';
import { getActivities } from '../../utils/activityStorage';
import { calculateActivityStatus } from '../../utils/activityHelpers';

const ActivityList = ({ userEmail, sectionCode }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Fetch activities on component mount
    const fetchedActivities = getActivities(userEmail, sectionCode);
    setActivities(fetchedActivities);
  }, [userEmail, sectionCode]);

  return (
    <div className="activity-list-container">
      <h3>My Activities</h3>
      {activities.length === 0 ? (
        <p>No activities found. Add one to get started!</p>
      ) : (
        <ul className="activity-list">
          {activities.map(activity => {
            const status = calculateActivityStatus(activity.dueDate, activity.dueTime, activity.isCompleted);
            
            return (
              <li key={activity.id} className={`activity-item status-${status.toLowerCase()}`}>
                <div className="activity-details">
                  <h4>{activity.title}</h4>
                  <p>Type: {activity.type}</p>
                  <p>Due: {activity.dueDate} at {activity.dueTime}</p>
                  <span className="activity-badge">{status}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ActivityList;