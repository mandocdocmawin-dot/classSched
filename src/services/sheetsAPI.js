// src/services/sheetsAPI.js
import { normalizeTimeRange } from "../utils/scheduleHelpers";

const YEAR_LEVEL_MAP = {
  "1ST YEAR": "1",
  "2ND YEAR": "2",
  "3RD YEAR": "3",
  "4TH YEAR": "4",
};

const DAY_COLUMNS = {
  1: "Monday",    // index 1 = column B (0-indexed row array)
  2: "Tuesday",   // column C
  3: "Wednesday", // column D
  4: "Thursday",  // column E
  5: "Friday",    // column F
  6: "Saturday",  // column G
};

const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;
const YEAR_HEADER_PATTERN = /(\d(?:ST|ND|RD|TH)\s+YEAR)/i;

/**
 * Kumuha ng buong raw grid data mula sa isang tab (hal. "BSIS").
 * Ginagamit yung !A1:H200 range para saklawin lahat ng year-level blocks.
 */
export async function fetchRawSheetGrid(accessToken, tabName) {
  const spreadsheetId = import.meta.env.VITE_SPREADSHEET_ID;
  const range = `${tabName}!A1:H300`;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (res.status === 403) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error(`Sheets fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * I-parse yung raw grid (2D array ng strings) papunta sa listahan ng
 * class objects. Hinahanap yung mga cell na tumutugma sa "H:MM - H:MM"
 * bilang simula ng bawat class block, kahit iba-iba ang bilang ng rows
 * per block.
 *
 * @param {string[][]} rows - raw grid mula sa fetchRawSheetGrid
 * @param {string} tabName - hal. "BSIS", gagamitin bilang prefix ng section
 * @returns {Array<{section, day, startTime, endTime, course, instructor, room, modality}>}
 */
export function parseScheduleGrid(rows, tabName) {
  const results = [];
  let currentSection = null;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] || [];
    const fullRowJoined = row.join(" ");

    // Detect year-level header row
    const yearMatch = fullRowJoined.match(YEAR_HEADER_PATTERN);
    if (yearMatch && /BACHELOR|ASSOCIATE|DIPLOMA/i.test(fullRowJoined)) {
      const yearKey = yearMatch[1].toUpperCase().replace(/\s+/g, " ").trim();
      const yearNum = YEAR_LEVEL_MAP[yearKey];
      if (yearNum) {
        currentSection = `${tabName}${yearNum}`;
      }
      continue;
    }

    if (!currentSection) continue;

    // Scan columns B(1) - G(6) for a time-pattern cell
    for (let c = 1; c <= 6; c++) {
      const cellValue = String(row[c] || "").trim();
      const timeMatch = cellValue.match(TIME_PATTERN);
      if (!timeMatch) continue;
      const { startTime, endTime } = normalizeTimeRange(
        `${timeMatch[1]}:${timeMatch[2]}`,
        `${timeMatch[3]}:${timeMatch[4]}`
      );
      const day = DAY_COLUMNS[c];

      const details = [];
      let nr = r + 1;
      while (nr < rows.length) {
        const nextRow = rows[nr] || [];
        const nextVal = String(nextRow[c] || "").trim();
        if (nextVal === "") break;
        if (TIME_PATTERN.test(nextVal)) break;
        details.push(nextVal);
        nr++;
      }

      const course = details[0] || "";
      const instructor = details[1] || "";
      const roomOrModality = details[2] || "";

      const isOnline =
        /online|async/i.test(roomOrModality) ||
        details.some((d) => /online|async/i.test(d));
      const modality = isOnline ? "Online/Async" : "F2F";
      const room = isOnline ? "" : roomOrModality;

      if (course) {
        results.push({
          section: currentSection,
          day,
          startTime,
          endTime,
          course,
          instructor,
          room,
          modality,
        });
      }
    }
  }

  return results;
}

/**
 * High-level function: kunin at i-parse ang schedule ng isang tab,
 * i-filter papunta sa isang specific section code (hal. "BSIS2").
 */
export async function getScheduleForSection(accessToken, tabName, sectionCode) {
  const rawGrid = await fetchRawSheetGrid(accessToken, tabName);
  const allClasses = parseScheduleGrid(rawGrid, tabName);
  return allClasses.filter((c) => c.section === sectionCode);
}