/**
 * Blocked dates for reservations (client-side)
 * Must match server-side configuration in api/_lib/blockedDates.ts
 * April 5, 6, 7, 8: fully blocked (Easter). April 15: evening only (special event).
 */
export const BLOCKED_DATES = [
  // Vacances de Pâques 2026 — fully blocked
  "2026-04-05",
  "2026-04-06",
  "2026-04-07",
  "2026-04-08",
];

/** Dates when evening is booked for an event — only lunch is available (e.g. 15 April). */
export const LUNCH_ONLY_DATES = ["2026-04-15"];

/**
 * Check if a date is blocked (no reservations at all).
 */
export function isDateBlocked(dateStr: string): boolean {
  return BLOCKED_DATES.includes(dateStr);
}

/**
 * Translation key for blocked date message (Easter: "sorry we aren't available, book another time").
 */
export function getBlockedDateReason(dateStr: string): string | null {
  if (["2026-04-05", "2026-04-06", "2026-04-07", "2026-04-08"].includes(dateStr)) {
    return "dateUnavailableEaster";
  }
  return null;
}

/**
 * Whether this date has evening booked for an event (only lunch available).
 */
export function isLunchOnlyDate(dateStr: string): boolean {
  return LUNCH_ONLY_DATES.includes(dateStr);
}
