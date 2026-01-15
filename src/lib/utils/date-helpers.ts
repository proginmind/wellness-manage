import { format } from "date-fns";

/**
 * Converts a Date object to HTML input date format (YYYY-MM-DD)
 */
export function dateToInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Converts HTML input date value (YYYY-MM-DD) to Date object
 */
export function inputValueToDate(value: string): Date {
  return new Date(value);
}
