import { APP_CONFIG, MESSAGES } from '../config/constants';
import { ValidationResult } from '../types/index';

/**
 * Chain of Responsibility pattern for validation
 */
export abstract class Validator {
  protected nextValidator: Validator | null = null;
  
  setNext(validator: Validator): Validator {
    this.nextValidator = validator;
    return validator;
  }
  
  validate(data: any): ValidationResult {
    const result = this.doValidate(data);
    
    if (!result.valid || !this.nextValidator) {
      return result;
    }
    
    return this.nextValidator.validate(data);
  }
  
  protected abstract doValidate(data: any): ValidationResult;
}

/**
 * Validates user name
 */
export class UserNameValidator extends Validator {
  protected doValidate(data: { userName: string }): ValidationResult {
    const { userName } = data;
    
    if (!userName || userName.trim().length === 0) {
      return {
        valid: false,
        message: MESSAGES.ERRORS.INVALID_USER_NAME
      };
    }
    
    if (userName.length < APP_CONFIG.MIN_USER_NAME_LENGTH) {
      return {
        valid: false,
        message: `Name must be at least ${APP_CONFIG.MIN_USER_NAME_LENGTH} characters`
      };
    }
    
    if (userName.length > APP_CONFIG.MAX_USER_NAME_LENGTH) {
      return {
        valid: false,
        message: `Name must be less than ${APP_CONFIG.MAX_USER_NAME_LENGTH} characters`
      };
    }
    
    return { valid: true };
  }
}

/**
 * Validates time range
 */
export class TimeRangeValidator extends Validator {
  protected doValidate(data: { startTime: string; endTime: string }): ValidationResult {
    const { startTime, endTime } = data;
    
    if (!startTime || !endTime) {
      return {
        valid: false,
        message: MESSAGES.ERRORS.INVALID_TIME_SELECTION
      };
    }
    
    if (endTime <= startTime) {
      return {
        valid: false,
        message: MESSAGES.ERRORS.END_TIME_BEFORE_START
      };
    }
    
    // Check business hours
    if (startTime < APP_CONFIG.BUSINESS_START_TIME || 
        endTime > APP_CONFIG.BUSINESS_END_TIME) {
      return {
        valid: false,
        message: `Bookings must be within business hours (${APP_CONFIG.BUSINESS_START_TIME} - ${APP_CONFIG.BUSINESS_END_TIME})`
      };
    }
    
    return { valid: true };
  }
}

/**
 * Validates booking date
 */
export class DateValidator extends Validator {
  protected doValidate(data: { date: string }): ValidationResult {
    const { date } = data;
    
    if (!date) {
      return {
        valid: false,
        message: MESSAGES.ERRORS.INVALID_DATE
      };
    }
    
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return {
        valid: false,
        message: 'Cannot book dates in the past'
      };
    }
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + APP_CONFIG.MAX_ADVANCE_BOOKING_DAYS);
    
    if (bookingDate > maxDate) {
      return {
        valid: false,
        message: `Cannot book more than ${APP_CONFIG.MAX_ADVANCE_BOOKING_DAYS} days in advance`
      };
    }
    
    return { valid: true };
  }
}

/**
 * Factory for creating validation chains
 */
export class ValidationChainFactory {
  static createBookingValidationChain(): Validator {
    const userNameValidator = new UserNameValidator();
    const timeRangeValidator = new TimeRangeValidator();
    const dateValidator = new DateValidator();
    
    userNameValidator
      .setNext(timeRangeValidator)
      .setNext(dateValidator);
    
    return userNameValidator;
  }
}