// src/utils/activityStorage.js

const buildKey = (userEmail, sectionCode) => `activities_${userEmail}_${sectionCode}`;

/**
 * Gets activities from the local cache.
 *
 * @param {string} userEmail - The logged-in user's email
 * @param {string} sectionCode - The user's section (e.g., 'BSIS2')
 * @returns {Array} List of activities
 */
export const getActivities = (userEmail, sectionCode) => {
  const key = buildKey(userEmail, sectionCode);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveActivities = (userEmail, sectionCode, activities) => {
  const key = buildKey(userEmail, sectionCode);
  localStorage.setItem(key, JSON.stringify(activities));
};

/**
 * Adds a new activity to the local cache and queues it for Google Sheets upload.
 *
 * @param {string} userEmail - The logged-in user's email
 * @param {string} sectionCode - The user's section
 * @param {Object} activityData - The details of the new activity
 */
export const addActivity = async (userEmail, sectionCode, activityData) => {
  const currentActivities = getActivities(userEmail, sectionCode);

  const newActivity = {
    id: crypto.randomUUID(),
    userEmail,
    section: sectionCode,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...activityData
  };

  const updatedActivities = [...currentActivities, newActivity];
  saveActivities(userEmail, sectionCode, updatedActivities);

  // TODO: Add Google Sheets API call here to sync the new activity to the user's personal sheet

  return newActivity;
};

/**
 * Updates an existing activity (title, type, dueDate, dueTime, notes, relatedSubject, etc).
 *
 * @param {string} userEmail
 * @param {string} sectionCode
 * @param {string} activityId
 * @param {Object} changes - Partial fields to merge into the activity
 */
export const updateActivity = async (userEmail, sectionCode, activityId, changes) => {
  const currentActivities = getActivities(userEmail, sectionCode);

  const updatedActivities = currentActivities.map(activity =>
    activity.id === activityId
      ? { ...activity, ...changes, updatedAt: new Date().toISOString() }
      : activity
  );

  saveActivities(userEmail, sectionCode, updatedActivities);

  // TODO: Add Google Sheets API call here to sync the change to the user's personal sheet

  return updatedActivities.find(a => a.id === activityId);
};

/**
 * Removes an activity from the local cache.
 *
 * @param {string} userEmail
 * @param {string} sectionCode
 * @param {string} activityId
 */
export const deleteActivity = async (userEmail, sectionCode, activityId) => {
  const currentActivities = getActivities(userEmail, sectionCode);
  const updatedActivities = currentActivities.filter(activity => activity.id !== activityId);
  saveActivities(userEmail, sectionCode, updatedActivities);

  // TODO: Add Google Sheets API call here to remove the row from the user's personal sheet

  return updatedActivities;
};

/**
 * Toggles an activity's completion state (Done <-> not Done).
 * The displayed status (Pending/Ongoing/Overdue/Done) is still derived dynamically
 * by activityHelpers.calculateActivityStatus — this just flips the underlying flag.
 *
 * @param {string} userEmail
 * @param {string} sectionCode
 * @param {string} activityId
 */
export const toggleActivityStatus = async (userEmail, sectionCode, activityId) => {
  const currentActivities = getActivities(userEmail, sectionCode);
  const target = currentActivities.find(a => a.id === activityId);
  if (!target) return null;

  return updateActivity(userEmail, sectionCode, activityId, {
    isCompleted: !target.isCompleted
  });
};