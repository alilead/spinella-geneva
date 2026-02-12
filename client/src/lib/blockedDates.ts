/**
 * Blocked dates for reservations (client-side)
 * Must match server-side configuration in api/_lib/blockedDates.ts
 */
export const BLOCKED_DATES = [
  // Vacances de Pâques 2026
  "2026-04-05",
  "2026-04-06",
  "2026-04-07",
  "2026-04-08",
  
  // Privatisation
  "2026-04-15",
];

/**
 * Check if a date is blocked
 */
export function isDateBlocked(dateStr: string): boolean {
  return BLOCKED_DATES.includes(dateStr);
}

/**
 * Get reason for blocked date
 */
export function getBlockedDateReason(dateStr: string): string | null {
  if (["2026-04-05", "2026-04-06", "2026-04-07", "2026-04-08"].includes(dateStr)) {
    return "Vacances de Pâques";
  }
  if (dateStr === "2026-04-15") {
    return "Privatisation";
  }
  return null;
}
