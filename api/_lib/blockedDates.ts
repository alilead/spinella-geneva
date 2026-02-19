/**
 * Blocked dates for reservations (fully closed).
 * April 5, 6, 7, 8: Easter. April 15: evening booked for event (see LUNCH_ONLY_DATES).
 */
export const BLOCKED_DATES = [
  "2026-04-05",
  "2026-04-06",
  "2026-04-07",
  "2026-04-08",
];

/** Dates when evening is booked for an event — only lunch allowed (15 April). */
export const LUNCH_ONLY_DATES = ["2026-04-15"];

const LUNCH_TIMES = ["12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00"];
const EVENING_TIMES = ["17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30"];

export function isDateBlocked(dateStr: string): boolean {
  return BLOCKED_DATES.includes(dateStr);
}

export function getBlockedDateReason(dateStr: string): string | null {
  if (BLOCKED_DATES.includes(dateStr)) return "Vacances de Pâques";
  return null;
}

export function isLunchOnlyDate(dateStr: string): boolean {
  return LUNCH_ONLY_DATES.includes(dateStr);
}

/** True if this date is lunch-only (evening booked) and the given time is evening (should be rejected). */
export function isEveningBlockedOnLunchOnlyDate(dateStr: string, time: string): boolean {
  return isLunchOnlyDate(dateStr) && EVENING_TIMES.includes(time);
}

/** Dates when all reservations require manual approval (14–18 April). */
export const REQUEST_ONLY_DATES = ["2026-04-14", "2026-04-15", "2026-04-16", "2026-04-17", "2026-04-18"];

export function isRequestOnlyDate(dateStr: string): boolean {
  return REQUEST_ONLY_DATES.includes(dateStr);
}

/** True if the given date is today and the time has already passed. */
export function isPastTime(dateStr: string, time: string, now: Date = new Date()): boolean {
  const today = now.toISOString().split("T")[0];
  if (dateStr !== today) return false;
  const [h, m] = time.split(":").map(Number);
  const slotMinutes = h * 60 + m;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= currentMinutes;
}
