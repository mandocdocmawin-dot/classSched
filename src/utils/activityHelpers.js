// src/utils/activityHelpers.js

/**
 * Calculates the current status of an activity based on its due date and completion state.
 * 
 * @param {string} dueDate - The target date (e.g., 'YYYY-MM-DD')
 * @param {string} dueTime - The target time (e.g., 'HH:mm')
 * @param {boolean} isCompleted - Whether the user has marked it as done
 * @returns {string} - 'Done', 'Overdue', 'Ongoing', or 'Pending'
 */
export const calculateActivityStatus = (dueDate, dueTime, isCompleted) => {
  if (isCompleted) {
    return 'Done';
  }

  const now = new Date();
  
  // Create a Date object for the due date and time
  const dueDateTime = new Date(`${dueDate}T${dueTime || '23:59'}:00`);
  
  // Check if the due date has already passed
  if (now > dueDateTime) {
    return 'Overdue';
  }

  // Check if the due date is today
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = todayLocal === dueDate;
  if (isToday) {
    return 'Ongoing';
  }

  // Default status for future dates
  return 'Pending';
};