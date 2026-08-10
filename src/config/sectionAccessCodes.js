// src/config/sectionAccessCodes.js
export const SECTION_ACCESS_CODES = {
  BSIS1: '609780',
  BSIS2: '110670',
  BSIS3: '990280',
  BSIS4: '000111',
};

export function isValidAccessCode(sectionCode, accessCode) {
  const normalizedSection = String(sectionCode || '').trim().toUpperCase();
  const expectedCode = SECTION_ACCESS_CODES[normalizedSection];
  if (!expectedCode) return false;
  return String(accessCode || '').trim() === expectedCode;
}

export function getSectionByAccessCode(accessCode) {
  const trimmedCode = String(accessCode || '').trim();
  const match = Object.entries(SECTION_ACCESS_CODES).find(
    ([, code]) => code === trimmedCode
  );
  return match ? match[0] : null;
}