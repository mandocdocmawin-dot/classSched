// Google's sariling pampublikong "Holidays in Philippines" calendar —
// ito rin mismo ang calendar na isa-subscribe ng mga tao sa kanilang
// personal na Google Calendar. Publicly readable ang data na 'to, pero
// hinihingi pa rin ni Google ang isang paraan ng "API consumer identity"
// kahit pampubliko (hindi tinatanggap ang purong unauthenticated na
// request) — kaya API key ang gagamitin dito, hindi na ang OAuth
// access token ng user (na para sa PERSONAL na data lang talaga
// bagay, gaya ng Sheets).
const PH_HOLIDAY_CALENDAR_ID = 'en.philippines#holiday@group.v.calendar.google.com';

// In-memory cache kada taon para hindi paulit-ulit tumawag sa API kada
// pag-navigate ng buwan sa loob ng parehong taon.
const holidayCacheByYear = new Map();

// Kinukuha ang lahat ng holiday event ng isang taon mula sa Google
// Calendar API, at ico-convert papuntang { [dateKey]: { name, description } }
// gamit ang parehong dateKey format na ginagamit sa WeekCalendar.jsx
// ("YYYY-M-D", month 0-indexed).
export async function fetchPHHolidays(year) {
  if (holidayCacheByYear.has(year)) {
    return holidayCacheByYear.get(year);
  }

  const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

  if (!apiKey) {
    console.warn(
      'VITE_GOOGLE_CALENDAR_API_KEY is not set — walang malo-load na holidays hangga\'t hindi ito naisasaayos.'
    );
    return {};
  }

  try {
    const timeMin = new Date(year, 0, 1).toISOString();
    const timeMax = new Date(year + 1, 0, 1).toISOString();
    const encodedCalendarId = encodeURIComponent(PH_HOLIDAY_CALENDAR_ID);

    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events` +
      `?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    const holidays = {};

    (data.items || []).forEach((event) => {
      // All-day holiday events ang laman ng calendar na 'to, kaya
      // event.start.date ("YYYY-MM-DD") ang gagamitin, hindi dateTime.
      const dateStr = event.start?.date;
      if (!dateStr) return;

      const [y, m, d] = dateStr.split('-').map(Number);
      const dateKey = `${y}-${m - 1}-${d}`;

      holidays[dateKey] = {
        name: event.summary || 'Holiday',
        description: event.description || null,
      };
    });

    holidayCacheByYear.set(year, holidays);
    return holidays;
  } catch (err) {
    console.error('Failed to fetch PH holidays from Google Calendar:', err);
    return {};
  }
}