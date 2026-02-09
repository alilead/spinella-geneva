/**
 * Blocked time slots: no reservations at these date/time combinations.
 * The restaurant can edit this list to block specific slots (e.g. private events).
 * Format: date as YYYY-MM-DD, time as HH:MM (24h).
 *
 * When the backend is deployed, this can be replaced by a tRPC query
 * that fetches blocked slots from the server.
 */
export const blockedSlots: { date: string; time: string }[] = [
  // Example: block New Year's Eve dinner 20:00 and 20:30
  // { date: "2026-12-31", time: "20:00" },
  // { date: "2026-12-31", time: "20:30" },
];

/**
 * Request-only dates: e.g. Valentine's Day. No automatic booking; guests submit
 * a request for their preferred time and the restaurant confirms by email.
 */
export const requestOnlyDates: string[] = [
  "2026-02-14", // Valentine's Day
  "2027-02-14",
];

export function isSlotBlocked(date: string, time: string): boolean {
  return blockedSlots.some((b) => b.date === date && b.time === time);
}

export function isRequestOnlyDate(date: string): boolean {
  return requestOnlyDates.includes(date);
}
