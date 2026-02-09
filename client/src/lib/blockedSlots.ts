/**
 * Blocked time slots: no reservations at these date/time combinations.
 * The restaurant can edit this list to block specific slots (e.g. private events).
 * Format: date as YYYY-MM-DD, time as HH:MM (24h).
 *
 * When the backend is deployed, this can be replaced by a tRPC query
 * that fetches blocked slots from the server.
 *
 * Reservations are open for all days. Only 14 February 17:00–22:30 is
 * request-only (manual confirmation by email).
 */
export const blockedSlots: { date: string; time: string }[] = [
  // Example: block a private event
  // { date: "2026-03-01", time: "19:00" },
];

/** Evening slots 17:30–22:30 (17h–22h30). On 14 Feb these are request-only. */
const EVENING_SLOTS_17_22_30 = [
  "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
];

export function isSlotBlocked(date: string, time: string): boolean {
  return blockedSlots.some((b) => b.date === date && b.time === time);
}

/** True if date is 14 February (any year). */
function is14thFebruary(date: string): boolean {
  const [, month, day] = date.split("-");
  return month === "02" && day === "14";
}

/**
 * Request-only slot: 14 February 17h–22h30. Guests can submit a request;
 * restaurant confirms by email within 10–20 minutes. All other days/slots are open.
 */
export function isRequestOnlySlot(date: string, time: string): boolean {
  return is14thFebruary(date) && EVENING_SLOTS_17_22_30.includes(time);
}
