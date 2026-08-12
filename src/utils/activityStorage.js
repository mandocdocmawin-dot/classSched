// src/utils/activityStorage.js

/**
 * Gets activities from the local cache.
 * 
 * @param {string} userEmail - The logged-in user's email
 * @param {string} sectionCode - The user's section (e.g., 'BSIS2')
 * @returns {Array} List of activities
 */
export const getActivities = (userEmail, sectionCode) => {
  const key = `activities_${userEmail}_${sectionCode}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

/**
 * Adds a new activity to the local cache and queues it for Google Sheets upload.
 * 
 * @param {string} userEmail - The logged-in user's email
 * @param {string} sectionCode - The user's section
 * @param {Object} activityData - The details of the new activity
 */
export const addActivity = async (userEmail, sectionCode, activityData) => {
  const key = `activities_${userEmail}_${sectionCode}`;
  const currentActivities = getActivities(userEmail, sectionCode);
  
  const newActivity = {
    id: crypto.randomUUID(),
    userEmail,
    section: sectionCode,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    ...activityData
  };

  const updatedActivities = [...currentActivities, newActivity];
  localStorage.setItem(key, JSON.stringify(updatedActivities));

  // TODO: Add Google Sheets API call here to sync the new activity to the user's personal sheet
  
  return newActivity;
};

// TODO: Implement updateActivity, deleteActivity, toggleActivityStatus