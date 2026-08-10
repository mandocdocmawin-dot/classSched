// src/utils/scheduleHelpers.js
//
// Shared helpers na ginagamit ng AccordionBanner, ScheduleList, at
// WeekGlance para i-convert yung raw class data (galing sa sheetsAPI.js)
// papunta sa format na kailangan ng UI components.

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

// Ang raw na oras sa Google Sheet ay hindi military time at walang
// AM/PM indicator (hal. "1:00", "8:00", "12:00" lang). Kailangan itong
// i-convert muna papuntang tunay na 24-hour "HH:MM" BAGO ito ipasa sa
// ibang functions dito (timeToMinutes, getClassStatus, atbp), dahil
// yun lahat ay umaasa na tama na yung 24-hour format.
//
// Heuristic (base sa karaniwang oras ng klase, 7:00 AM - 9:00 PM):
//   - Oras 1–6  -> ituturing na PM  (1:00 -> 13:00, ..., 6:00 -> 18:00)
//   - Oras 7–12 -> ituturing na AM / as-is (7:00 -> 07:00, 12:00 -> 12:00 na tanghali)
//
// Halimbawa base sa sheet mo:
//   "8:00 - 10:00"  -> 08:00 - 10:00 (umaga)
//   "1:00 - 3:00"   -> 13:00 - 15:00 (hapon)
//   "5:00 - 7:00"   -> 17:00 - 19:00 (gabi)
export function normalizeScheduleTime(rawTimeStr) {
  const [hStr, mStr = '00'] = rawTimeStr.trim().split(':');
  let h = parseInt(hStr, 10);
  const m = String(parseInt(mStr, 10)).padStart(2, '0');

  if (h >= 1 && h <= 6) {
    h += 12; // 1:00–6:00 nagiging 13:00–18:00 (PM)
  }
  // 7–12 nananatiling as-is (7 AM hanggang 12 PM/tanghali)

  return `${String(h).padStart(2, '0')}:${m}`;
}

// Ino-normalize yung start at end na magkasama (hindi bawat isa nang
// hiwalay), dahil may boundary case ang "1-6 -> PM, 7-12 -> AM/as-is"
// heuristic: kapag ang endTime mismo ay nasa 7-12 range (hal. yung "7"
// sa "5:00 - 7:00"), maaaring maling AM pa rin ang resulta kahit alam
// nating dapat PM ito (dahil nasa hapon/gabi na ang start). Kaya:
// kapag ang normalized end ay <= normalized start, ituturing na sumobra
// ito sa parehong araw pa rin at idadagdag ng 12 oras (i.e. PM).
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

// Hinahati yung raw range string galing sa sheet (hal. "8:00 - 10:00" o
// "8:00-10:00") papunta sa { startTime, endTime } gamit ang
// normalizeTimeRange. Ito yung gagamitin sa sheetsAPI.js kapag pino-parse
// yung raw cell value bago i-save sa class object.
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

// Ibinabalik: 'ongoing' | 'upcoming' | 'done'
// MAHALAGA: 'ongoing'/'done' ay may kahulugan LANG kung ang klase ay
// para sa ARAW NA ITO. Kapag tumitingin ka ng ibang araw (hal. Thursday
// habang Lunes ngayon), walang saysay na "ongoing"/"done" batay sa
// current clock time — kaya laging 'upcoming' na lang ang ibabalik kung
// hindi tugma ang classDay sa totoong araw ngayon.
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

// Sinasala yung listahan ng classes ngayong araw, pinagso-sort by time,
// tapos hinahanap yung kasalukuyang ongoing na klase (kung meron), o
// yung pinaka-malapit na susunod.
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

// Ibinabalik yung unique na listahan ng short-day-codes na may klase
export function getDaysWithClasses(classes) {
  const days = new Set(classes.map((c) => getShortDay(c.day)));
  return DAY_ORDER.filter((d) => days.has(d));
}

// Nagko-convert ng raw minutes (hal. 96) papuntang mas madaling basahing
// format na "1 hr 36 mins", para hindi na kailangan i-mental-math ng user
// yung "96 mins" papuntang oras.
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