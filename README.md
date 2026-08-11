# 📅 Smart Class Scheduling System

A lightweight, **mobile-first** web application built for BSIS students and academic staff to view and manage class schedules — powered by Google Sheets as a live backend and secured with Google OAuth 2.0.

---

## ✨ Overview

Instead of digging through static PDFs or group chats for schedule updates, students simply sign in with their `.edu` Google account, enter a **6-digit access code** for their section, and instantly get a personalized, real-time visual schedule — optimized for mobile.

- **Live data** — pulled directly from Google Sheets, no redeploy needed when the schedule changes
- **Role-based access** — governed by Google Sheets sharing permissions + `.edu` domain restriction
- **Smart status banner** — tells you what class you're in right now, or how long until the next one
- **Automated evening reminders** — a daily 7 PM email with tomorrow's gameplan

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Backend / Database | Google Sheets (via Sheets API v4) |
| Auth | Google Identity Services (OAuth 2.0) |
| Notifications | Google Apps Script + Gmail API |
| Hosting | Vercel |

---

## 🔐 Authentication & Access Control

- **Google OAuth 2.0** — users sign in with their Google Workspace `.edu` account
- **Sheet-level permissions** — the app borrows the signed-in user's identity via OAuth token; anyone without access to the underlying sheet gets a `403 Forbidden`
- **Section Access Codes** — a simple **client-side gate** (`src/config/sectionAccessCodes.js`) that maps a 6-digit code to a section (e.g. `BSIS1`). This is *not* a security layer on its own — it just prevents accidental loading of another section's schedule. Real access control still lives in OAuth + `.edu` domain + Sheets sharing settings.

---

## 🚀 Getting Started

```bash
# install dependencies
npm install

# run locally
npm run dev

# build for production
npm run build
```

---

## 📂 Project Structure

```
src/
├── assets/
├── components/
│   ├── Auth/
│   ├── SectionEntry/
│   ├── SmartStatus/
│   └── Timeline/
│       ├── WeekCalendar.jsx
│       ├── ScheduleList.jsx
│       └── WeekGlance.jsx
├── config/
│   └── sectionAccessCodes.js
├── pages/
├── services/
│   ├── sheetsAPI.js
│   ├── googleAuth.js
│   └── holidaysAPI.js
└── utils/
    └── scheduleHelpers.js
```

---

## 🧩 Core Features

### Section Access Entry
Single-field entry — just the 6-digit access code. Validated client-side before any network call is made, so invalid codes fail fast with no API round-trip.

### Smart Status Banner
A collapsible accordion at the top of the dashboard that shows:
- Your **current class** in progress, or
- A **"you're on a break"** message with a countdown to your next class

Includes a live progress bar for the current period.

### Timeline Schedule
A scrollable list of the day's classes as quick-tap cards (`InfoCard.jsx`), each expandable to reveal instructor and room/modality details. Cards are tagged `DONE` / `ONGOING` / `UPCOMING` — but only when viewing *today's* actual schedule; any other day defaults to `UPCOMING`.

### Week Calendar
A full 7-day calendar (with real dates, not just weekday letters) showing which days have classes at a glance. Tapping a day filters the Timeline Schedule below it.


---

## ⚠️ Known Limitations

- The `?section=BSIS2` deep-link from notification emails currently has no way to auto-fill the access-code form, since the entry flow no longer has a section-code field. This needs to be handled directly in `Dashboard.jsx` by reading the query param and setting the active section, bypassing the form.
- Section access codes are a convenience gate, not real security — do not treat them as authentication.

---

## 📄 License

This project is intended for internal academic use.