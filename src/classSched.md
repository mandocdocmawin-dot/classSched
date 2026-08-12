# Project Implementation Guide: Smart Class Scheduling System (Mobile-First)

**Target Audience:** Students and Academic Staff  
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

### 2.2 Section Access Codes (Local Gate)
> **Update:** Ang orihinal na plano ng "pumili ng Program + Year Level" para makabuo ng section code ay pinalitan ng mas simpleng **6-digit Access Code** system, dahil apat lang naman ang section (`BSIS1`–`BSIS4`).

* **Config file:** `src/config/sectionAccessCodes.js` — isang static object na nagma-map ng section code papunta sa 6-digit access code nito (hal. `BSIS1: '609780'`).
* **Reverse lookup:** `getSectionByAccessCode(accessCode)` — dito nanggagaling yung "hanapin ang section base sa code" logic. Ito ang tinatawag ng `SectionForm.jsx` sa pag-submit.
* **Isang field na lang ang UI:** `SectionForm.jsx` ay may ACCESS CODE field lang (6 digits, numeric-only, may `maxLength`). Wala nang hiwalay na Program/Year Level dropdown o Section Code text input — direkta nang natutukoy ang section mula sa code na in-type.
* **Mahalagang paalala:** Ito ay isang **simpleng lokal na gate lang** (client-side check, hindi encrypted/hashed), hindi kapalit ng tunay na security. Ang aktwal na access control ay nananatili pa rin sa Google OAuth + `.edu` domain + Google Sheets sharing permissions (Section 2). Layunin lang ng access code na maiwasan ang random/accidental na pag-load ng schedule ng ibang section.
* Kapag magdadagdag ng bagong section sa hinaharap, dito lang idadagdag ang bagong entry sa `SECTION_ACCESS_CODES` object.

---

## 3. Backend Integration & Core Logic
* **Authentication Flow:** Implement a "Sign in with Google" button on the client side. Upon successful authentication with a valid `.edu` account, retrieve the OAuth access token.
* **Token Refresh Handling:** OAuth access tokens are short-lived. `googleAuth.js` must implement silent token refresh (via Google Identity Services' token client) to re-issue tokens before expiration, preventing unexpected `401 Unauthorized` errors during active sessions.
* **Data Fetching:** Send an authorized HTTP request using the bearer token:
  `GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}`
* **Schedule Modifications:** Users with edit privileges can update or overwrite schedule data for a specific section code (e.g., `BSIS2`) directly back to the target Google Sheet.
* **Automated Email Notifications:** Trigger automated email updates via the Gmail API or SMTP service whenever a schedule modification occurs, notifying all affected students and instructors in real time.

### 3.1 Time Parsing (Non-Military Time in the Sheet)
> **Update:** Ang oras sa Google Sheet ay hindi nakasulat sa military/24-hour time at walang AM/PM indicator (hal. `"1:00 - 3:00"` lang, hindi `"13:00 - 15:00"`). Kaya kinakailangan ng isang normalization step bago gamitin ang mga oras na 'to sa UI.

* **`normalizeScheduleTime()` / `normalizeTimeRange()`** (sa `src/utils/scheduleHelpers.js`) ang responsable dito. Heuristic base sa karaniwang oras ng klase (7:00 AM–9:00 PM):
  * Oras **1–6** → ituturing na **PM**
  * Oras **7–12** → ituturing na **AM/as-is** (12 = tanghali)
  * **Boundary case:** kung ang na-normalize na `endTime` ay mas maaga pa o kapareho ng `startTime` (hal. `"5:00 - 7:00"`, kung saan ambiguous din ang `"7"`), idadagdag ng 12 oras ang `endTime` para maging PM ito.
* **Saan ginagamit:** `parseScheduleGrid()` sa `src/services/sheetsAPI.js` ang tumatawag nito bago i-save ang `startTime`/`endTime` ng bawat class object — kaya sa oras na dumaan na sa parsing layer, tamang 24-hour format na ang laman ng `startTime`/`endTime` sa lahat ng dako ng app.

---

### 3.2 Automated Gmail Notification System ("The Evening Gameplan")
*   **Trigger Time:** A cron job or Google Apps Script time-driven trigger will execute every day at **7:00 PM**.
*   **Data Checking:** The system scans the Google Sheet for the specific section's (e.g., `BSIS2`) schedule for the *next day*.
*   **Dynamic Email Templates:** The system formats the email based on the class modality:
    *   **F2F Classes:** Uses an "On-Campus" template highlighting the **Room Number** (e.g., EFS 403) and physical attendance reminders. Uses school emojis (🎒/🏫).
    *   **Online/Async Classes:** Uses an "Online Mode" template highlighting the **Modality** and includes a direct **Google Meet/Module Link** button. Uses tech emojis (💻/🌐).
*   **Call-to-Action (CTA):** Every email includes a universal button linked to the web app frontend (`[Open Full Schedule Dashboard]`) so students can easily check their interactive accordion banner. This link includes a query parameter (e.g., `?section=BSIS2`) so the frontend can deep-link the user directly to their section's dashboard on load, without requiring them to re-enter their section code.
*   **Combined Digest with Personal Activities (Final Design):** With the per-user personal Activities Sheet design finalized (see Section 5), this same 7:00 PM trigger no longer reports on class schedule alone — it also reads each student's personal Activities spreadsheet (auto-provisioned per Section 5.2) and merges both into a single evening email: **"Tomorrow's Classes"** + **"Upcoming & Overdue Activities"** in one digest, rather than as two separate emails.
    *   Because each personal Activities Sheet lives in the *student's own* Google Drive (not the app's), the trigger — running as/under a dedicated service account (e.g., `smartschedule-bot@yourschool.edu`) — is granted read access to every provisioned sheet automatically at the moment it's created (see Section 5.2, Step 3). This allows one server-side job to read all provisioned personal sheets without requiring each student to manually share their file.
    *   The trigger iterates over the list of provisioned `spreadsheetId`s shared with the service account, filters each user's activities for items due "soon" or already overdue, and appends that section to the corresponding user's evening email alongside their class schedule for the next day.

> ⚠️ **Known gap (dahil sa Access Code redesign):** Dahil pinalitan na ng `SectionForm.jsx` ang section-code entry ng access-code-only entry (Section 2.2), wala nang direktang paraan para i-prefill ang `?section=BSIS2` query param sa form, dahil wala nang section-code field dito. Kung gusto pa ring gumana ang deep-link na 'to, kailangang i-parse ang query param sa `Dashboard.jsx` mismo at direktang i-set ang `activeSection` (i-skip ang modal), sa halip na i-pass papuntang `SectionForm`. Hindi pa ito naka-implement.

> **Note on Deployment Architecture:** The Google Apps Script trigger described in this section is a **separate deployment** from the React frontend — it runs server-side on Google's infrastructure independently of whether the web app is open in a browser. The `.gs` source file may be kept in a `/apps-script` reference folder within this repo for version control purposes, but it is not bundled or built as part of the frontend application.
---

## 4. Frontend UI/UX Architecture (Mobile-First)

### A. Section Access Entry
> **Update:** Pinalitan na ang dating "pumili ng Program + Year Level" flow ng mas simpleng access-code entry (tingnan ang Section 2.2).

* Users log in, then i-type lang ang kanilang **6-digit access code** sa `SectionForm.jsx` — walang dropdown, walang manual na section-code typing.
* Client-side muna ang validation (`getSectionByAccessCode()` sa `src/config/sectionAccessCodes.js`) bago pa man tumawag sa Google Sheets API — kung mali/hindi kilalang code, agad lumalabas ang inline error nang hindi na kailangan mag-network request.
* Kapag valid ang code, awtomatikong natutukoy ang section (hal. `BSIS1`), saka pa lang tatawagin ang `getScheduleForSection()` para kunin ang aktwal na schedule data mula sa Sheet.

### B. UI Component: Interactive Accordion Banner ("Smart Status")
Positioned prominently at the top of the mobile interface, this component provides real-time status updates based on the current day and time:

| Feature / State | Display & Behavioral Logic |
| :--- | :--- |
| **Current Class (Collapsed)** | Displays active course details. *Example:* `CURRENT: Business Process Management`. |
| **Expanded View (Tap Action)** | Tapping the banner expands an accordion displaying **Instructor Name**, **Room Number/Location**, and **Action Buttons** (e.g., "Join GMeet" for Online/Async sessions). |
| **Vacant / Idle State** | Displays break notifications during unassigned time slots. *Example:* `"You're on a break! Next class: Life and Works of Rizal in 1 hr 17 mins."` — ginagamit ang `formatMinutesUntil()` para i-convert ang raw minutes papuntang "X hr Y mins" (hindi na "77 mins" lang), mas madaling basahin ng user. |
| **Elapsed Time Progress Bar** | A minimalist progress bar situated along the bottom edge of the banner indicating elapsed time for the current period. |

### C. UI Component: Timeline Schedule (Quick-Tap Info Cards)
* Below the Accordion Banner, remaining classes for the day are displayed in a clean, vertical scroll format (`ScheduleList.jsx`, gamit ang `InfoCard.jsx` per class).
* **Quick-Tap Cards:** Initial view displays only course titles, time slots, at status badge (DONE/ONGOING/UPCOMING/OVERDUE) para ma-maximize ang screen space. Tapping a card expands it (via chevron ▼/▲) to reveal **Instructor Name** at **Room/Modality**.
* **Day-Aware Status:** Ang DONE/ONGOING na status ay valid lang kapag ang klaseng/aktibidad na ipinapakita ay para sa **araw na ito mismo**. Kung ang user ay naka-filter (o na-click sa Week Calendar) sa ibang araw — hal. Thursday habang Lunes pa ang totoong araw — palaging "UPCOMING" na lang ang lalabas, dahil walang saysay ang real-time status ("ongoing"/"done") kung hindi naman talaga ngayong araw ang klase.
* **Filter:** May dropdown filter na pinipili kung anong araw ang ipapakita; kino-kontrol din ito ng bagong Week Calendar component (Section D) — pareho silang naka-sync sa parehong "napiling araw" state sa `Dashboard.jsx`.

### D. UI Component: Week Calendar
> **Bagong feature**, wala pa sa unang bersyon ng plano. Nasa pagitan ng Accordion Banner ("On Break") at ng Week-at-a-Glance strip.

* Mas malaki/detalyadong bersyon ng Week-at-a-Glance: 7-day row (Mon–Sun) na may **aktwal na petsa** ng bawat araw ngayong linggo (hindi lang letra).
* **Visual indicator:** dot/highlight kung "may pasok" (may klase) ang araw na 'yon batay sa loaded na schedule, o muted/walang dot kung "walang klase".
* **Interactive:** pag-click/tap ng isang araw, dito nafi-filter ang "Your Classes" list sa ibaba papunta sa napiling araw — controlled component na naka-sync sa `selectedDay` state ng `Dashboard.jsx`.
* Component file: `src/components/Timeline/WeekCalendar.jsx` (+ `.css`), katabi ng `ScheduleList.jsx` at `WeekGlance.jsx`.

### E. UI Component: Error & Access States
The interface must gracefully handle non-happy-path scenarios:

| State | Display & Behavioral Logic |
| :--- | :--- |
| **Unauthorized Account** | If a user signs in with a non-`.edu` account or an account lacking sheet access (`403 Forbidden`), display an "Access Denied" screen with guidance to sign in using their school account. |
| **Invalid Access Code** | If the entered 6-digit access code does not match any known section, display an inline validation error on `SectionForm.jsx` (client-side check, bago pa man tumawag sa Sheets API). |
| **Invalid/Missing Section Data** | Kung valid ang access code pero walang nahanap na data sa Sheet para sa nakatukoy na section, ipapakita ang error sa `Dashboard.jsx` (hindi na sa `SectionForm.jsx`, dahil dito na ito na-detect — pagkatapos ng fetch). |
| **Session Expired** | If token refresh fails, prompt the user to re-authenticate via a non-disruptive banner or modal rather than a silent failure. |
| **Network/Fetch Failure** | If the Sheets API request fails (timeout, offline, etc.), show a retry option instead of an indefinite loading state. |

---

## 5. Activities, Assignments & Projects Tracker (Manual, User-Editable)

> **New feature.** On top of the fetched class schedule (which is read-mostly and sourced from the shared Google Sheet), the system adds a way for each user to **manually add, edit, and mark as done** their own activities/assignments/projects — this is not part of the shared section schedule, but a personal task list that can optionally be linked to a class.

### 5.0 Final Design: Auto-Provisioned Personal Google Sheet per User

> **Locked-in decision:** Instead of storing activities only in `localStorage` (device-only, no cross-device access) or in a single shared `Activities` tab inside the class Sheet (which would leak every student's personal tasks to anyone with edit access on that section's sheet), the final design **auto-provisions a private, per-user Google Sheet** the first time each student uses the Activities feature. The user ends up owning their own copy in their own Drive — it's private by default, portable, and survives even if the app is discontinued — while the app still keeps a fast local `localStorage` cache for offline use and instant loads.

**Why this over the alternatives:**

| | Shared tab in class Sheet | **Per-user personal Sheet (final)** |
| :--- | :--- | :--- |
| **Privacy** | Anyone with edit access to the section sheet can see every student's activities — Sheets has no row-level permissions | Private — each student's own file, in their own Drive |
| **Setup complexity** | Simple, just one tab | Requires `drive.file` scope, a template file, `appDataFolder` tracking, and an auto-share step |
| **Cron/trigger access** | Direct — one file to read | Requires service-account sharing on every provisioned file |
| **Data ownership** | The app/section "owns" the data | The user owns their own copy — portable, not lost if the app is deactivated |

Given the added privacy benefit — personal activities shouldn't be visible to the rest of the section — this is the approach being locked in as final, and it's also the better fit for the "personal task list" intent behind this feature.

**Required new OAuth scope:** in addition to the existing Sheets scope, the app requires `https://www.googleapis.com/auth/drive.file` — a narrow, per-file scope that only grants access to files the app itself created, not the user's entire Drive. This avoids invasive Google verification (unlike a full Drive scope) and means the app can never see the student's unrelated personal files.

**Provisioning flow:**

| Step | What Happens |
| :--- | :--- |
| 1 | User signs in with their `.edu` account (existing flow, Section 2/3). |
| 2 | On load, the app checks the user's Drive `appDataFolder` (a hidden, app-exclusive folder not visible in the user's normal Drive view) for an existing `activitiesSheetId` reference. |
| 3 | If none exists yet → the app calls `Drive.files.copy(templateFileId)` to duplicate a master template spreadsheet (owned by the app/service account, pre-formatted with the correct headers — see Section 5.1) into **the user's own Drive**. The new copy is automatically shared (view/edit) with a dedicated service account (e.g., `smartschedule-bot@yourschool.edu`) via `Drive.permissions.create()`, and the resulting `spreadsheetId` is saved back into the user's `appDataFolder`. If an ID already exists, it's reused. As a fallback (e.g., if the `appDataFolder` reference is ever lost), the app can also look the file up via `Drive.files.list()` using a filename convention (e.g., `"SmartSchedule Activities - {email}"`).
| 4 | Adding/editing an activity writes to the user's personal sheet via the Sheets API, **and** to the `localStorage` cache at the same time, so the UI stays fast and still works offline. |
| 5 | The 7:00 PM trigger (running as the service account) reads every provisioned personal sheet it has been shared on and merges them into the combined "Tomorrow's Classes + Activities Due Soon" digest email (see Section 3.2). |

**Known trade-off — conflict resolution:** because there are now two sources of truth (the `localStorage` cache and the personal Sheet), editing the same activity from two different devices before a sync completes can produce a conflict. This is an accepted, open trade-off of this design and is not yet resolved with a specific merge strategy (e.g., last-write-wins vs. timestamp comparison) — to be defined during implementation.

### 5.1 Data Model
Each activity entry (as a row in the user's personal Activities sheet, and mirrored in the local cache) has the following fields:

| Field | Description |
| :--- | :--- |
| `id` | Unique identifier (e.g., generated via `crypto.randomUUID()`) |
| `userEmail` | The owning user's `.edu` email — useful for the trigger/digest step even though the sheet itself is already per-user |
| `section` | The user's section code (e.g., `BSIS2`) |
| `title` | Name of the activity/assignment/project (e.g., "System Analysis Report Draft 2") |
| `type` | `Assignment` \| `Project` \| `Quiz` \| `Other` |
| `relatedSubject` | Optional link to a subject/class from the fetched schedule (e.g., `"Business Process Management"`), so the app knows which class this is tied to |
| `dueDate` / `dueTime` | Target completion date and time |
| `notes` | Free-text details/instructions |
| `status` | **`Pending`** \| **`Ongoing`** \| **`Overdue`** \| **`Done`** (Dynamic state derived from current date/time and user check status) |
| `createdAt` / `updatedAt` | Timestamps used for sorting |

### 5.2 Storage Layer
* **`src/utils/activityStorage.js`** — contains all CRUD helpers (`getActivities()`, `addActivity()`, `updateActivity()`, `deleteActivity()`, `toggleActivityStatus()`). Each helper writes to both the `localStorage` cache (for instant/offline access) and, when online, the user's personal Activities Sheet via the Sheets API.
* **`src/utils/driveProvisioning.js`** — handles the provisioning flow described in Section 5.0: checking `appDataFolder` for an existing `activitiesSheetId`, calling `Drive.files.copy()` against the master template on first use, auto-sharing the new copy with the service account, and persisting the `spreadsheetId` back to `appDataFolder`.
* **Namespacing (local cache):** the `localStorage` cache is still keyed per user + per section (e.g., `activities_{userEmail}_{sectionCode}`) so activities don't mix when switching section codes or signing in with a different `.edu` account on the same device.
* **Limitation the user should know about:** the `localStorage` cache can still be cleared or lost on a different device/browser, but since the source of truth is now the user's own personal Sheet (not just the local cache), their activities are recoverable as long as they sign back in — the app just re-provisions/re-reads the existing sheet rather than starting over.

### 5.3 New UI Components
* **`ActivityForm.jsx`** — modal or bottom-sheet form to add/edit an activity (title, type, related subject dropdown, due date/time, notes).
* **`ActivityList.jsx`** — list of all activities, organized/sorted by priority (Overdue & Ongoing first, then Pending, then Done), sortable by due date and filterable by status/type.
* **Access point:**
  * A new tab/section in `Dashboard.jsx` (e.g., "My Activities") that renders the full `ActivityList.jsx`.
  * A quick-add shortcut from the expanded view of `InfoCard.jsx` for each subject (Section 4C) — a "+ Add Activity" button that pre-fills `relatedSubject` based on the class it was opened from.
* **Visual cue on `InfoCard.jsx`:** if a subject has a linked pending, ongoing, or overdue activity, the card shows a small badge/dot indicator (e.g., "1 Overdue", "2 Pending") so the user notices it even while the card is still collapsed.

### 5.4 Dynamic Status Calculation & Behavior Rules
The system determines an activity's status using the following rules:

* **`Ongoing`**: Applied when the due date is **today** (`ngayong araw`) and the current time is within the activity's scheduled period (or before the end of the day), provided the user has not yet checked it off as complete.
* **`Overdue`**: Triggered automatically starting the **next day** (o kinabukasan) or after the specific `dueDate`/`dueTime` has passed, if the user **has not checked/marked** the activity as complete (`Done`).
* **`Pending`**: Default status for activities scheduled for a **future date** that are not yet active/due today.
* **`Done`**: Applied immediately when the user manually checks/toggles the activity complete, regardless of whether it was previously Pending, Ongoing, or Overdue.
