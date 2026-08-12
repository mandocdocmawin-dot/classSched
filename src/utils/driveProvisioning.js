// src/utils/driveProvisioning.js
//
// Handles the auto-provisioning flow for each user's personal Activities
// Google Sheet (see classSched.md, Section 5.0 / 5.2).
//
// Flow (spec Section 5.0, "Provisioning flow" table):
//   1. User is already signed in (Section 2/3) — token passed in from googleAuth.js
//   2. Check the user's Drive appDataFolder for an existing activitiesSheetId reference
//   3. If none exists: copy the master template -> user's Drive, share with the
//      service account, persist the new spreadsheetId back into appDataFolder
//   4. (handled by activityStorage.js, not here) write activity rows to the sheet
//   5. (handled by the Apps Script trigger, not here) service account reads all
//      provisioned sheets for the 7PM digest
//
// Required scope (in addition to the existing Sheets scope):
//   https://www.googleapis.com/auth/drive.file

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const REFERENCE_FILENAME = 'activities-sheet-reference.json';

// TODO: move these into env vars alongside VITE_GOOGLE_CLIENT_ID / VITE_SPREADSHEET_ID
const TEMPLATE_FILE_ID = import.meta.env.VITE_ACTIVITIES_TEMPLATE_FILE_ID;
const SERVICE_ACCOUNT_EMAIL = import.meta.env.VITE_SMARTSCHEDULE_SERVICE_ACCOUNT_EMAIL;

/**
 * Entry point. Returns the spreadsheetId of the user's personal Activities
 * sheet, provisioning it on first use if it doesn't exist yet.
 *
 * @param {string} accessToken - OAuth token (must include drive.file scope)
 * @param {string} userEmail - the signed-in user's .edu email
 * @returns {Promise<string>} spreadsheetId
 */
export async function getOrProvisionActivitiesSheet(accessToken, userEmail) {
  // Step 2: check appDataFolder for an existing reference
  const existingId = await getSheetIdFromAppData(accessToken);
  if (existingId) {
    return existingId;
  }

  // Fallback: appDataFolder reference lost/cleared — try filename convention lookup
  // before provisioning a brand-new sheet, so we don't orphan an existing one.
  const foundId = await findSheetByFilenameConvention(accessToken, userEmail);
  if (foundId) {
    await saveSheetIdToAppData(accessToken, foundId);
    return foundId;
  }

  // Step 3: none found anywhere — provision a new one
  return provisionNewActivitiesSheet(accessToken, userEmail);
}

/**
 * Looks inside the hidden appDataFolder for our reference file and returns
 * the spreadsheetId stored inside it, or null if not found.
 */
async function getSheetIdFromAppData(accessToken) {
  // TODO: GET {DRIVE_API_BASE}/files?spaces=appDataFolder&q=name='${REFERENCE_FILENAME}'
  // TODO: if a match is found, fetch its content (files/{fileId}?alt=media) and
  //       parse { spreadsheetId } from the JSON body
  throw new Error('Not implemented');
}

/**
 * Fallback lookup: search the user's whole Drive (not appDataFolder) for a
 * file matching the naming convention "SmartSchedule Activities - {email}".
 * Used if the appDataFolder reference is ever lost.
 */
async function findSheetByFilenameConvention(accessToken, userEmail) {
  // TODO: GET {DRIVE_API_BASE}/files?q=name='SmartSchedule Activities - ${userEmail}'
  //       and mimeType='application/vnd.google-apps.spreadsheet'
  throw new Error('Not implemented');
}

/**
 * Copies the master template into the user's own Drive, shares it with the
 * service account, and saves the new spreadsheetId into appDataFolder.
 */
async function provisionNewActivitiesSheet(accessToken, userEmail) {
  const spreadsheetId = await copyTemplateFile(accessToken, userEmail);
  await shareWithServiceAccount(accessToken, spreadsheetId);
  await saveSheetIdToAppData(accessToken, spreadsheetId);
  return spreadsheetId;
}

/**
 * Drive.files.copy(templateFileId) — duplicates the master template
 * spreadsheet into the signed-in user's own Drive.
 */
async function copyTemplateFile(accessToken, userEmail) {
  // TODO: POST {DRIVE_API_BASE}/files/${TEMPLATE_FILE_ID}/copy
  //       body: { name: `SmartSchedule Activities - ${userEmail}` }
  //       returns the new file's id -> this becomes spreadsheetId
  throw new Error('Not implemented');
}

/**
 * Drive.permissions.create() — grants the service account access to the
 * newly-copied sheet so the 7PM digest trigger can read it later.
 */
async function shareWithServiceAccount(accessToken, spreadsheetId) {
  // TODO: POST {DRIVE_API_BASE}/files/${spreadsheetId}/permissions
  //       body: { type: 'user', role: 'reader', emailAddress: SERVICE_ACCOUNT_EMAIL }
  //       (use role: 'writer' instead if the trigger ever needs to write back)
  throw new Error('Not implemented');
}

/**
 * Writes/overwrites the { spreadsheetId } reference file inside the user's
 * hidden appDataFolder, so future sessions skip provisioning entirely.
 */
async function saveSheetIdToAppData(accessToken, spreadsheetId) {
  // TODO: if REFERENCE_FILENAME already exists in appDataFolder -> PATCH its content
  //       else -> POST a new file with parents: ['appDataFolder'],
  //       name: REFERENCE_FILENAME, content: JSON.stringify({ spreadsheetId })
  throw new Error('Not implemented');
}