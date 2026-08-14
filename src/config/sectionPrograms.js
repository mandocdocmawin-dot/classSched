// src/config/sectionPrograms.js
//
// Kapalit ito ng sectionAccessCodes.js. Sa halip na mag-type ng 6-digit
// access code, pipili na lang ang user ng PROGRAM (tumutugma sa tab
// name sa Google Sheet, hal. "BSIS") at YEAR LEVEL. Ang dalawang ito
// ang bubuo sa section code (hal. "BSIS1") na siya ring format na
// ginagamit ng parseScheduleGrid() sa sheetsAPI.js.
//
// Kung may idagdag/alisin/palitang pangalan ng tab sa Sheet, dito lang
// palitan ang PROGRAM_TABS — walang ibang kailangang baguhin.

export const PROGRAM_TABS = ['BSIS', 'ACT', 'BSA', 'BSAIS', 'BAB', 'BSSW'];

export const YEAR_LEVELS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];

export function buildSectionCode(program, yearValue) {
  const normalizedProgram = String(program || '').trim().toUpperCase();
  const normalizedYear = String(yearValue || '').trim();
  if (!PROGRAM_TABS.includes(normalizedProgram)) return null;
  if (!YEAR_LEVELS.some((y) => y.value === normalizedYear)) return null;
  return `${normalizedProgram}${normalizedYear}`;
}