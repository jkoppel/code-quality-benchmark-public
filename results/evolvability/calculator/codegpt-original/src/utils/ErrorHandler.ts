import { CalculatorError } from "../types/calculator.types";

export class ErrorHandler {
  private static errorLog: CalculatorError[] = [];

  static logError(error: CalculatorError): void {
    this.errorLog.push({
      ...error,
      timestamp: new Date().toISOString(),
    } as CalculatorError & { timestamp: string });

    // In a real application, you might send this to a logging service
    console.error("Calculator Error:", error);
  }

  static createError(
    message: string,
    type: CalculatorError["type"]
  ): CalculatorError {
    return {
      message,
      type,
    };
  }

  static handleDivisionByZero(): CalculatorError {
    const error = this.createError("Cannot divide by zero", "DIVISION_BY_ZERO");
    this.logError(error);
    return error;
  }

  static handleInvalidInput(input: string): CalculatorError {
    const error = this.createError(`Invalid input: ${input}`, "INVALID_INPUT");
    this.logError(error);
    return error;
  }

  static handleOverflow(): CalculatorError {
    const error = this.createError("Number too large", "OVERFLOW");
    this.logError(error);
    return error;
  }

  static handleGeneralError(message: string): CalculatorError {
    const error = this.createError(message, "GENERAL_ERROR");
    this.logError(error);
    return error;
  }

  static getErrorLog(): CalculatorError[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static isValidNumber(value: string): boolean {
    // Check if the string represents a valid number
    if (value === "" || value === null || value === undefined) {
      return false;
    }

    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }

  static isValidOperation(operation: string): boolean {
    return ["+", "-", "*", "/"].includes(operation);
  }

  static validateDisplayLength(
    display: string,
    maxLength: number = 12
  ): boolean {
    return display.length <= maxLength;
  }

  static sanitizeInput(input: string): string {
    // Remove any non-numeric characters except decimal point
    return input.replace(/[^0-9.]/g, "");
  }

  static formatErrorMessage(error: CalculatorError): string {
    switch (error.type) {
      case "DIVISION_BY_ZERO":
        return "Error: Division by zero";
      case "INVALID_INPUT":
        return "Error: Invalid input";
      case "OVERFLOW":
        return "Error: Number too large";
      case "GENERAL_ERROR":
      default:
        return "Error: Calculation failed";
    }
  }
}
