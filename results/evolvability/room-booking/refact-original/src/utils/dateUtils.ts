/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format hour number (0-23) to readable time string
 */
export function formatHour(hour: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${ampm}`;
}
