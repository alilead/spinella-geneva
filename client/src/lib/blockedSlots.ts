/**
 * Blocked time slots and opening rules.
 * - Sunday: closed (no reservations).
 * - Mon–Wed: 12:00–14:00 and 17:30–22:00.
 * - Thu–Fri: 12:00–14:00 and 17:30–22:30.
 * - Saturday: 17:30–22:30 only (no lunch).
 * - 14 February evening: request-only.
 * - Slots every 15 minutes.
 */

export const blockedSlots: { date: string; time: string }[] = [];

/** Generate time slots every 15 min from start (HH:MM) to end inclusive. */
function slots15(start: string, end: string): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const result: string[] = [];
  let h = sh;
  let m = sm;
  const endM = eh * 60 + em;
  while (h * 60 + m <= endM) {
    result.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 15;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return result;
}

const LUNCH_SLOTS = slots15("12:00", "14:00");
const EVENING_UNTIL_22 = slots15("17:30", "22:00");
const EVENING_UNTIL_22_30 = slots15("17:30", "22:30");

/** Sunday = closed (no slots). */
export function isSunday(date: string): boolean {
  const d = new Date(date + "T12:00:00");
  return d.getDay() === 0;
}

/** 0 = Sun, 1 = Mon, ... 6 = Sat. */
function getDayOfWeek(date: string): number {
  return new Date(date + "T12:00:00").getDay();
}

/** Thu=4, Fri=5. */
function isThuFri(date: string): boolean {
  const day = getDayOfWeek(date);
  return day === 4 || day === 5;
}

/** Sat=6. */
function isSaturday(date: string): boolean {
  return getDayOfWeek(date) === 6;
}

/** Mon=1, Tue=2, Wed=3. */
function isMonWed(date: string): boolean {
  const day = getDayOfWeek(date);
  return day >= 1 && day <= 3;
}

export function isSlotBlocked(date: string, time: string): boolean {
  if (blockedSlots.some((b) => b.date === date && b.time === time)) return true;
  if (isSunday(date)) return true;
  const day = getDayOfWeek(date);
  const isLunch = LUNCH_SLOTS.includes(time);
  const isEvening22 = EVENING_UNTIL_22.includes(time);
  const isEvening2230 = EVENING_UNTIL_22_30.includes(time);
  if (isSaturday(date)) {
    return !isEvening2230; // Saturday: only 17:30–22:30
  }
  if (isThuFri(date)) {
    if (isLunch) return false;
    return !isEvening2230; // Thu–Fri: lunch + 17:30–22:30
  }
  if (isMonWed(date)) {
    if (isLunch) return false;
    return !isEvening22; // Mon–Wed: lunch + 17:30–22:00
  }
  return true; // Sunday
}

/** Request-only: 14 Feb evening. */
function is14thFebruary(date: string): boolean {
  const [, month, day] = date.split("-");
  return month === "02" && day === "14";
}

export function isRequestOnlySlot(date: string, time: string): boolean {
  return is14thFebruary(date) && (EVENING_UNTIL_22_30.includes(time) || EVENING_UNTIL_22.includes(time));
}

/** True if party size is 8 or more (large table = request-only). */
export function isRequestOnlyPartySize(partySize: number): boolean {
  return partySize >= 8;
}

/**
 * All time slots for a given date.
 * Mon–Wed: 12:00–14:00, 17:30–22:00. Thu–Fri: 12:00–14:00, 17:30–22:30. Sat: 17:30–22:30 only. Sun: none.
 */
export function getTimeSlotsForDate(date: string): string[] {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  if (isSunday(date)) return [];
  if (isSaturday(date)) {
    return EVENING_UNTIL_22_30.filter((time) => !blockedSlots.some((b) => b.date === date && b.time === time));
  }
  const evening = isThuFri(date) ? EVENING_UNTIL_22_30 : EVENING_UNTIL_22;
  const all = [...LUNCH_SLOTS, ...evening];
  return all.filter((time) => !blockedSlots.some((b) => b.date === date && b.time === time));
}
