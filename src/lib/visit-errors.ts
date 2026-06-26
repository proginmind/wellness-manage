const OVERLAP_MESSAGE = "This staff member is already booked during this time";

export function isVisitOverlapError(message: string | undefined): boolean {
  if (!message) return false;
  return message.includes("already has a visit scheduled") || message === OVERLAP_MESSAGE;
}

export function toVisitOverlapError(message: string | undefined): string {
  return isVisitOverlapError(message) ? OVERLAP_MESSAGE : (message ?? "Failed to save visit");
}

export { OVERLAP_MESSAGE };
