/**
 * Presentation mode flag.
 *
 * Toggle by setting EXPO_PUBLIC_PRESENT_MODE=1 in `.env` (or in the shell
 * before `npx expo start`).
 *
 * When ON (=1):
 *   - mock-api seeds a rich demo dataset on first import (multiple saved
 *     trips, expenses, comments, expense users, signed-in user)
 *   - the app boots as if a real backend already has data
 *   - every mutating call (createTrip / saveTrip / updateActivity /
 *     addExpense / createComment / fixActivity ...) still works normally
 *     against the in-memory store, so demos can show end-to-end flows
 *
 * When OFF (default, =0):
 *   - mock-api starts empty (current behaviour)
 *   - user goes through the onboarding flow to create their first trip
 */
export const PRESENT_MODE: boolean =
  (process.env.EXPO_PUBLIC_PRESENT_MODE ?? "0") === "1";

export function isPresentMode(): boolean {
  return PRESENT_MODE;
}
