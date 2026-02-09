/**
 * Blocked time slots: no reservations at these date/time combinations.
 * The restaurant can edit this list to block specific slots (e.g. private events).
 * Format: date as YYYY-MM-DD, time as HH:MM (24h).
 *
 * When the backend is deployed, this can be replaced by a tRPC query
 * that fetches blocked slots from the server.
 */
// 14 February evening blocked: 17:30–22:30 (Valentine's private event / reserved)
const feb14EveningSlots = [
  "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
];

export const blockedSlots: { date: string; time: string }[] = [
  ...feb14EveningSlots.map((time) => ({ date: "2026-02-14", time })),
  ...feb14EveningSlots.map((time) => ({ date: "2027-02-14", time })),
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
