// src/utils/scheduleHelpers.js
const DAY_FULL_TO_SHORT = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
};

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function getShortDay(fullDayName) {
  return DAY_FULL_TO_SHORT[fullDayName] || fullDayName;
}

export function getCurrentDayCode() {
  const jsDay = new Date().getDay(); // 0=Sunday, 1=Monday, ...
  const map = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return map[jsDay];
}


export function normalizeScheduleTime(rawTimeStr) {
  const [hStr, mStr = '00'] = rawTimeStr.trim().split(':');
  let h = parseInt(hStr, 10);
  const m = String(parseInt(mStr, 10)).padStart(2, '0');

  if (h >= 1 && h <= 6) {
    h += 12; 
  }

  return `${String(h).padStart(2, '0')}:${m}`;
}

export function normalizeTimeRange(rawStart, rawEnd) {
  const startTime = normalizeScheduleTime(rawStart);
  let endTime = normalizeScheduleTime(rawEnd);

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  if (toMinutes(endTime) <= toMinutes(startTime)) {
    const [h, m] = endTime.split(':').map(Number);
    const bumpedH = (h + 12) % 24;
    endTime = `${String(bumpedH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return { startTime, endTime };
}

export function parseScheduleTimeRange(rawRangeStr) {
  const [rawStart, rawEnd] = rawRangeStr.split('-').map((s) => s.trim());
  return normalizeTimeRange(rawStart, rawEnd);
}

// "08:00" -> minutes mula 00:00 (para sa comparison)
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// "08:00" -> "8:00 AM"
export function formatTime12h(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(startTime, endTime) {
  return `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
}

export function getClassStatus(startTime, endTime, classDay) {
  if (classDay && getShortDay(classDay) !== getCurrentDayCode()) {
    return 'upcoming';
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (nowMinutes < start) return 'upcoming';
  if (nowMinutes >= start && nowMinutes <= end) return 'ongoing';
  return 'done';
}

export function getProgressPercent(startTime, endTime) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (nowMinutes <= start) return 0;
  if (nowMinutes >= end) return 100;

  return Math.round(((nowMinutes - start) / (end - start)) * 100);
}

export function pickCurrentOrNextClass(classes) {
  const todayCode = getCurrentDayCode();
  const todaysClasses = classes
    .filter((c) => getShortDay(c.day) === todayCode)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const ongoing = todaysClasses.find((c) => {
    const start = timeToMinutes(c.startTime);
    const end = timeToMinutes(c.endTime);
    return nowMinutes >= start && nowMinutes <= end;
  });
  if (ongoing) return { status: 'current', classItem: ongoing };

  const next = todaysClasses.find((c) => timeToMinutes(c.startTime) > nowMinutes);
  if (next) {
    const minutesUntil = timeToMinutes(next.startTime) - nowMinutes;
    return { status: 'idle', classItem: next, minutesUntil };
  }

  return { status: 'idle', classItem: null, minutesUntil: null };
}

export function getDaysWithClasses(classes) {
  const days = new Set(classes.map((c) => getShortDay(c.day)));
  return DAY_ORDER.filter((d) => days.has(d));
}

export function formatMinutesUntil(totalMinutes) {
  if (totalMinutes < 60) {
    return `${totalMinutes} min${totalMinutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const hourLabel = `${hours} hr${hours === 1 ? '' : 's'}`;

  if (mins === 0) return hourLabel;
  return `${hourLabel} ${mins} min${mins === 1 ? '' : 's'}`;
}

export function getCurrentWeekDates() {
  const today = new Date();
  const jsDay = today.getDay();
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  return DAY_ORDER.map((code, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return { code, date: d.getDate() };
  });
}