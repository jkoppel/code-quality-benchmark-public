/**
 * Utility functions for date manipulation and formatting
 */

export class DateUtils {
  /**
   * Gets the current date in ISO format (YYYY-MM-DD)
   */
  static getCurrentDateISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Adds or subtracts days from a date
   */
  static addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Formats a date string for display
   */
  static formatDateForDisplay(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Parses a date from ISO string
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Checks if a date is valid
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Gets the day of week for a date
   */
  static getDayOfWeek(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  }
}