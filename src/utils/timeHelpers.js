// src/utils/timeHelpers.js

/**
 * Formats a raw Date object into a readable time string (e.g., "1:30 PM").
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculates the percentage of time elapsed between a start and end time.
 * Returns a number between 0 and 100.
 */
export const calculateProgress = (startTime, endTime, currentTime = new Date()) => {
  // TODO: Add date math logic here
  console.log("Calculating time progress...");
  return 50; // Placeholder returning 50%
};