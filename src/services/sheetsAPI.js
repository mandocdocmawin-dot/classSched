// src/services/sheetsAPI.js

/**
 * Fetches schedule data for a specific section from Google Sheets.
 * @param {string} sectionCode - e.g., 'BSIS2'
 * @param {string} token - OAuth access token
 */
export const fetchScheduleData = async (sectionCode, token) => {
  console.log(`Fetching schedule for ${sectionCode} using token...`);
  
  // TODO: Replace with actual Google Sheets API call
  // Example: GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
  
  // Returning dummy data for scaffolding
  return [
    { title: "BPM", time: "10:00 AM - 11:30 AM", room: "EFS 403" },
    { title: "Web Dev", time: "1:00 PM - 3:00 PM", room: "Online" }
  ];
};