import { Operation } from "../types/calculator.types";

export class ValidationUtils {
  // Number validation
  static readonly MAX_DISPLAY_LENGTH = 12;
  static readonly MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
  static readonly MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

  static isValidDigit(input: string): boolean {
    return /^[0-9]$/.test(input);
  }

  static isValidDecimal(currentDisplay: string, newInput: string): boolean {
    // Don't allow multiple decimal points
    if (newInput === "." && currentDisplay.includes(".")) {
      return false;
    }
    return true;
  }

  static isValidDisplayLength(display: string): boolean {
    return display.length <= this.MAX_DISPLAY_LENGTH;
  }

  static isValidOperation(operation: string): operation is Operation {
    return ["+", "-", "*", "/"].includes(operation);
  }

  static isValidNumber(value: string | number): boolean {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return !isNaN(num) && isFinite(num);
  }

  static isSafeNumber(value: number): boolean {
    return value >= this.MIN_SAFE_INTEGER && value <= this.MAX_SAFE_INTEGER;
  }

  static isZero(value: number): boolean {
    return Math.abs(value) < Number.EPSILON;
  }

  // Input sanitization
  static sanitizeNumberInput(input: string): string {
    // Remove any characters that aren't digits or decimal points
    return input.replace(/[^0-9.]/g, "");
  }

  static formatNumber(value: number): string {
    // Handle very large or very small numbers
    if (Math.abs(value) > 1e10 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(6);
    }

    // Format with appropriate decimal places
    if (value % 1 === 0) {
      // Integer
      return value.toString();
    } else {
      // Decimal - limit to reasonable precision
      const formatted = value.toPrecision(10);
      return parseFloat(formatted).toString();
    }
  }

  static truncateDisplay(display: string): string {
    if (display.length <= this.MAX_DISPLAY_LENGTH) {
      return display;
    }

    // Try to truncate while preserving the number's meaning
    const num = parseFloat(display);
    if (!isNaN(num)) {
      return this.formatNumber(num);
    }

    // Fallback: just truncate the string
    return display.substring(0, this.MAX_DISPLAY_LENGTH);
  }

  // State validation
  static isValidCalculatorState(
    display: string,
    previousValue: string | null,
    operation: Operation | null
  ): boolean {
    // Display should always be valid
    if (!display || display === "") {
      return false;
    }

    // If we have an operation, we should have a previous value
    if (operation && !previousValue) {
      return false;
    }

    // Previous value should be a valid number if it exists
    if (previousValue && !this.isValidNumber(previousValue)) {
      return false;
    }

    return true;
  }

  // Error state checks
  static isErrorState(display: string): boolean {
    return display === "Error" || display.toLowerCase().includes("error");
  }

  static isOverflowState(value: number): boolean {
    return !this.isSafeNumber(value) || !isFinite(value);
  }

  // Keyboard input validation
  static isValidKeyboardInput(key: string): boolean {
    const validKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "+",
      "-",
      "*",
      "/",
      "=",
      "Enter",
      "Escape",
      "Backspace",
      "c",
      "C",
      ".",
    ];
    return validKeys.includes(key);
  }

  static normalizeKeyboardInput(key: string): string {
    // Normalize common keyboard variations
    switch (key) {
      case "Enter":
        return "=";
      case "Escape":
        return "C";
      case "c":
        return "C";
      default:
        return key;
    }
  }
}
