import { BookingFormData } from "../types/booking";
import { DateUtils } from "../utils/dateUtils";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  /**
   * Validates booking form data
   */
  public static validateBookingForm(
    formData: BookingFormData
  ): ValidationResult {
    const errors: string[] = [];

    // Validate user name
    if (!formData.userName || !formData.userName.trim()) {
      errors.push("User name is required");
    } else if (formData.userName.trim().length < 2) {
      errors.push("User name must be at least 2 characters long");
    } else if (formData.userName.trim().length > 50) {
      errors.push("User name must be less than 50 characters");
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.userName.trim())) {
      errors.push(
        "User name can only contain letters, spaces, hyphens, and apostrophes"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates booking parameters
   */
  public static validateBookingParams(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string
  ): ValidationResult {
    const errors: string[] = [];

    // Validate room name
    if (!roomName || !roomName.trim()) {
      errors.push("Room name is required");
    }

    // Validate date
    if (!date) {
      errors.push("Date is required");
    } else if (!DateUtils.isValidDate(date)) {
      errors.push("Invalid date format");
    } else if (DateUtils.isPastDate(date)) {
      errors.push("Cannot book dates in the past");
    }

    // Validate times
    if (!startTime) {
      errors.push("Start time is required");
    }

    if (!endTime) {
      errors.push("End time is required");
    }

    if (startTime && endTime && startTime >= endTime) {
      errors.push("End time must be after start time");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates time slot selection
   */
  public static validateTimeSlotSelection(
    selectedSlot: string | null,
    timeSlots: string[]
  ): ValidationResult {
    const errors: string[] = [];

    if (!selectedSlot) {
      errors.push("Please select a time slot");
    } else if (!timeSlots.includes(selectedSlot)) {
      errors.push("Invalid time slot selected");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
