/**
 * Utility functions for time manipulation and validation
 */

export class TimeUtils {
  /**
   * Checks if a time is within a range
   */
  static isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    return time >= startTime && time < endTime;
  }

  /**
   * Calculates the duration in minutes between two time strings
   */
  static getDurationInMinutes(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  }

  /**
   * Formats duration for display (e.g., "2 hours 30 minutes")
   */
  static formatDuration(startTime: string, endTime: string): string {
    const minutes = this.getDurationInMinutes(startTime, endTime);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    } else if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
    }
  }

  /**
   * Validates if a time string is in HH:MM format
   */
  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Gets the next time slot from an array of time slots
   */
  static getNextTimeSlot(currentTime: string, timeSlots: string[]): string | null {
    const currentIndex = timeSlots.indexOf(currentTime);
    if (currentIndex === -1 || currentIndex === timeSlots.length - 1) {
      return null;
    }
    return timeSlots[currentIndex + 1];
  }

  /**
   * Checks if times overlap
   */
  static doTimesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return start1 < end2 && start2 < end1;
  }
}