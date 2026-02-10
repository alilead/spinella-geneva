/**
 * Blocked time slots and opening rules.
 * - Sunday: closed (no reservations).
 * - Mon–Wed: evening until 22:00.
 * - Thu–Sat: evening until 22:30.
 * - 14 February evening: request-only.
 */

export const blockedSlots: { date: string; time: string }[] = [];

const LUNCH_SLOTS = ["12:00", "12:30", "13:00", "13:30", "14:00"];
const EVENING_UNTIL_22 = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
const EVENING_UNTIL_22_30 = [...EVENING_UNTIL_22, "22:30"];

/** Sunday = closed (no slots). */
export function isSunday(date: string): boolean {
  const d = new Date(date + "T12:00:00");
  return d.getDay() === 0;
}

/** 0 = Sun, 1 = Mon, ... 6 = Sat. Thu=4, Fri=5, Sat=6. */
function getDayOfWeek(date: string): number {
  return new Date(date + "T12:00:00").getDay();
}

/** Mon=1, Tue=2, ..., Sat=6, Sun=0. */
function isThuFriSat(date: string): boolean {
  const day = getDayOfWeek(date);
  return day === 4 || day === 5 || day === 6;
}

export function isSlotBlocked(date: string, time: string): boolean {
  if (blockedSlots.some((b) => b.date === date && b.time === time)) return true;
  if (isSunday(date)) return true;
  const isEvening = EVENING_UNTIL_22_30.includes(time);
  if (!isEvening) return false;
  if (isThuFriSat(date)) return false;
  if (time === "22:30") return true;
  return false;
}

/** Request-only: 14 Feb evening. */
function is14thFebruary(date: string): boolean {
  const [, month, day] = date.split("-");
  return month === "02" && day === "14";
}

export function isRequestOnlySlot(date: string, time: string): boolean {
  return is14thFebruary(date) && EVENING_UNTIL_22_30.includes(time);
}

/** True if party size is 8 or more (large table = request-only). */
export function isRequestOnlyPartySize(partySize: number): boolean {
  return partySize >= 8;
}

/**
 * All time slots available for a given date (respects Sunday + Mon–Wed 22:00 / Thu–Sat 22:30).
 */
export function getTimeSlotsForDate(date: string): string[] {
  if (isSunday(date)) return [];
  const evening = isThuFriSat(date) ? EVENING_UNTIL_22_30 : EVENING_UNTIL_22;
  const all = [...LUNCH_SLOTS, ...evening];
  return all.filter((time) => !blockedSlots.some((b) => b.date === date && b.time === time));
}
