/**
 * Add or subtract days from a date string
 */
export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Format date string to long readable format
 */
export function formatLongDate(dateString: string): string {
  // Parse as UTC to avoid timezone issues
  const date = new Date(dateString + 'T12:00:00Z');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
