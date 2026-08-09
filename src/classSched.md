# Project Implementation Guide: Smart Class Scheduling System (Mobile-First)

**Target Audience:** BSIS Students and Academic Staff  
**Primary Database:** Google Sheets  
**Architecture:** Mobile-First Web Application  

---

## 1. System Overview
The Smart Class Scheduling System is a lightweight, mobile-first web application that utilizes Google Sheets as its primary backend database. It leverages Google Workspace `.edu` account authentication and OAuth 2.0 for role-based access control. Upon entering a specific block section code (e.g., `BSIS2`), the system parses raw spreadsheet data and renders an intuitive, personalized visual schedule tailored for mobile viewports.

---

## 2. Authentication & Cloud Setup (Google Cloud Console)
* **Project Creation:** Set up a dedicated project within the Google Cloud Console and enable the **Google Sheets API**.
* **OAuth 2.0 Credentials:** Create an OAuth 2.0 Client ID configured as a "Web application".
* **Authorized JavaScript Origins:** Register the production domain and local development URLs under Authorized Origins.
* **Access Control & Permissions:** Sheet-level access permissions remain strictly governed by Google Sheets sharing settings. The application borrows the logged-in user's identity via the OAuth token. Requests made by unauthorized accounts (e.g., non-`.edu` users or users lacking sheet access) will return a `403 Forbidden` error.
* **OAuth Consent Screen & Workspace Verification:** Since the app is scoped to a `.edu` Google Workspace domain, the OAuth Consent Screen must be configured (Internal vs. External) with the school's Workspace admin. If configured as "Internal," the app is automatically trusted within the domain. If "External," it may require Google verification or manual addition of test users during development before it can be used org-wide.

### 2.1 Environment Configuration
To avoid hardcoding sensitive values into the codebase, store the following as environment variables (e.g., in a `.env` file, excluded from version control via `.gitignore`):
* `VITE_GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID
* `VITE_SPREADSHEET_ID` — Target Google Sheet ID
* `VITE_VALID_SECTION_CODES` (optional) — Reference list/pattern for validating section code input

---

## 3. Backend Integration & Core Logic
* **Authentication Flow:** Implement a "Sign in with Google" button on the client side. Upon successful authentication with a valid `.edu` account, retrieve the OAuth access token.
* **Token Refresh Handling:** OAuth access tokens are short-lived. `googleAuth.js` must implement silent token refresh (via Google Identity Services' token client) to re-issue tokens before expiration, preventing unexpected `401 Unauthorized` errors during active sessions.
* **Data Fetching:** Send an authorized HTTP request using the bearer token:
  `GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}`
* **Schedule Modifications:** Users with edit privileges can update or overwrite schedule data for a specific section code (e.g., `BSIS2`) directly back to the target Google Sheet.
* **Automated Email Notifications:** Trigger automated email updates via the Gmail API or SMTP service whenever a schedule modification occurs, notifying all affected students and instructors in real time.

### 3.1 Automated Gmail Notification System ("The Evening Gameplan")
*   **Trigger Time:** A cron job or Google Apps Script time-driven trigger will execute every day at **7:00 PM**.
*   **Data Checking:** The system scans the Google Sheet for the specific section's (e.g., `BSIS2`) schedule for the *next day*.
*   **Dynamic Email Templates:** The system formats the email based on the class modality:
    *   **F2F Classes:** Uses an "On-Campus" template highlighting the **Room Number** (e.g., EFS 403) and physical attendance reminders. Uses school emojis (🎒/🏫).
    *   **Online/Async Classes:** Uses an "Online Mode" template highlighting the **Modality** and includes a direct **Google Meet/Module Link** button. Uses tech emojis (💻/🌐).
*   **Call-to-Action (CTA):** Every email includes a universal button linked to the web app frontend (`[Open Full Schedule Dashboard]`) so students can easily check their interactive accordion banner. This link includes a query parameter (e.g., `?section=BSIS2`) so the frontend can deep-link the user directly to their section's dashboard on load, without requiring them to re-enter their section code.

> **Note on Deployment Architecture:** The Google Apps Script trigger described in this section is a **separate deployment** from the React frontend — it runs server-side on Google's infrastructure independently of whether the web app is open in a browser. The `.gs` source file may be kept in a `/apps-script` reference folder within this repo for version control purposes, but it is not bundled or built as part of the frontend application.
---

## 4. Frontend UI/UX Architecture (Mobile-First)

### A. Section Code Entry
* Users log in and input their section code (e.g., `BSIS2`).
* The system validates the code, queries the corresponding Google Sheet data, and transforms raw cell matrix data into an interactive visual dashboard.

### B. UI Component: Interactive Accordion Banner ("Smart Status")
Positioned prominently at the top of the mobile interface, this component provides real-time status updates based on the current day and time:

| Feature / State | Display & Behavioral Logic |
| :--- | :--- |
| **Current Class (Collapsed)** | Displays active course details. *Example:* `CURRENT: Business Process Management`. |
| **Expanded View (Tap Action)** | Tapping the banner expands an accordion displaying **Instructor Name**, **Room Number/Location**, and **Action Buttons** (e.g., "Join GMeet" for Online/Async sessions). |
| **Vacant / Idle State** | Displays break notifications during unassigned time slots. *Example:* `"You're on a break! Next class: Life and Works of Rizal in 45 mins."` |
| **Elapsed Time Progress Bar** | A minimalist progress bar situated along the bottom edge of the banner indicating elapsed time for the current period. |

### C. UI Component: Timeline Schedule (Quick-Tap Info Cards)
* Below the Accordion Banner, remaining classes for the day are displayed in a clean, vertical scroll format.
* **Quick-Tap Cards:** Initial view displays only course titles and time slots to maximize screen space. Tapping a card expands it to reveal classroom locations, modality indicators, and assigned faculty members.

### D. UI Component: Error & Access States
The interface must gracefully handle non-happy-path scenarios:

| State | Display & Behavioral Logic |
| :--- | :--- |
| **Unauthorized Account** | If a user signs in with a non-`.edu` account or an account lacking sheet access (`403 Forbidden`), display an "Access Denied" screen with guidance to sign in using their school account. |
| **Invalid Section Code** | If the entered section code (e.g., `BSIS2`) does not exist in the sheet, display an inline validation error on `SectionForm.jsx` rather than a blank dashboard. |
| **Session Expired** | If token refresh fails, prompt the user to re-authenticate via a non-disruptive banner or modal rather than a silent failure. |
| **Network/Fetch Failure** | If the Sheets API request fails (timeout, offline, etc.), show a retry option instead of an indefinite loading state. |