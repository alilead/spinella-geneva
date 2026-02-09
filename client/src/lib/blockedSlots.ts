/**
 * Blocked time slots: no reservations at these date/time combinations.
 * The restaurant can edit this list to block specific slots (e.g. private events).
 * Format: date as YYYY-MM-DD, time as HH:MM (24h).
 *
 * When the backend is deployed, this can be replaced by a tRPC query
 * that fetches blocked slots from the server.
 *
 * Note: 14 February evening is NOT blocked — client wants it "manual only":
 * guests can request 17:30–22:30 on the 14th; restaurant confirms by email.
 */
export const blockedSlots: { date: string; time: string }[] = [
  // Example: block a private event
  // { date: "2026-03-01", time: "19:00" },
];

/**
 * Request-only dates: e.g. Valentine's Day. No automatic booking; guests submit
 * a request for their preferred time (including 17:30–22:30) and the restaurant
 * confirms by email within 10–20 minutes.
 */
export const requestOnlyDates: string[] = [
  "2026-02-14", // Valentine's Day — manual for the 14th evening (client preference)
  "2027-02-14",
];

export function isSlotBlocked(date: string, time: string): boolean {
  return blockedSlots.some((b) => b.date === date && b.time === time);
}

export function isRequestOnlyDate(date: string): boolean {
  return requestOnlyDates.includes(date);
}
