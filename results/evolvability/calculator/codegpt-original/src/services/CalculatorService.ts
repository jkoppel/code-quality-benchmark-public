import {
  CalculatorState,
  Operation,
  CalculatorError,
} from "../types/calculator.types";
import { CalculationStrategyFactory } from "../strategies/CalculationStrategies";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ValidationUtils } from "../utils/ValidationUtils";

export class CalculatorService {
  private state: CalculatorState;
  private listeners: Array<(state: CalculatorState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): CalculatorState {
    return {
      display: "0",
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
    };
  }

  // Observer pattern for state updates
  subscribe(listener: (state: CalculatorState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private updateState(updates: Partial<CalculatorState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  getState(): CalculatorState {
    return { ...this.state };
  }

  // Input validation using ValidationUtils
  private validateNumber(input: string): boolean {
    return ValidationUtils.isValidDigit(input);
  }

  private validateOperation(operation: string): operation is Operation {
    return ValidationUtils.isValidOperation(operation);
  }

  private formatDisplay(value: number): string {
    if (ValidationUtils.isOverflowState(value)) {
      throw ErrorHandler.handleOverflow();
    }
    return ValidationUtils.formatNumber(value);
  }

  inputNumber(num: string): void {
    if (!this.validateNumber(num)) {
      throw new Error("Invalid number input");
    }

    if (this.state.waitingForNewValue) {
      this.updateState({
        display: num,
        waitingForNewValue: false,
      });
    } else {
      const newDisplay =
        this.state.display === "0" ? num : this.state.display + num;

      // Prevent display from becoming too long
      if (newDisplay.length > 12) {
        return;
      }

      this.updateState({ display: newDisplay });
    }
  }

  inputOperation(nextOperation: string): void {
    if (!this.validateOperation(nextOperation)) {
      throw new Error("Invalid operation");
    }

    const inputValue = parseFloat(this.state.display);

    if (isNaN(inputValue)) {
      throw new Error("Invalid display value");
    }

    try {
      if (this.state.previousValue === null) {
        this.updateState({
          previousValue: this.state.display,
          waitingForNewValue: true,
          operation: nextOperation,
        });
      } else if (this.state.operation && !this.state.waitingForNewValue) {
        // Perform intermediate calculation
        const currentValue = parseFloat(this.state.previousValue);
        const newValue = CalculationStrategyFactory.calculate(
          currentValue,
          inputValue,
          this.state.operation
        );

        const formattedValue = this.formatDisplay(newValue);

        this.updateState({
          display: formattedValue,
          previousValue: formattedValue,
          waitingForNewValue: true,
          operation: nextOperation,
        });
      } else {
        this.updateState({
          waitingForNewValue: true,
          operation: nextOperation,
        });
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  calculate(): void {
    const inputValue = parseFloat(this.state.display);

    if (
      this.state.previousValue !== null &&
      this.state.operation !== null &&
      !isNaN(inputValue)
    ) {
      try {
        const previousValue = parseFloat(this.state.previousValue);
        const result = CalculationStrategyFactory.calculate(
          previousValue,
          inputValue,
          this.state.operation
        );

        const formattedResult = this.formatDisplay(result);

        this.updateState({
          display: formattedResult,
          previousValue: null,
          operation: null,
          waitingForNewValue: true,
        });
      } catch (error) {
        this.handleError(error as Error);
      }
    }
  }

  clear(): void {
    this.updateState(this.getInitialState());
  }

  private handleError(error: Error): void {
    // Use ErrorHandler for proper error logging and formatting
    const calculatorError = ErrorHandler.handleGeneralError(error.message);
    const errorMessage = ErrorHandler.formatErrorMessage(calculatorError);

    // Show formatted error on display
    this.updateState({
      display: "Error",
      previousValue: null,
      operation: null,
      waitingForNewValue: true,
    });
  }

  // Additional utility methods
  backspace(): void {
    if (this.state.waitingForNewValue || this.state.display === "Error") {
      return;
    }

    if (this.state.display.length > 1) {
      this.updateState({ display: this.state.display.slice(0, -1) });
    } else {
      this.updateState({ display: "0" });
    }
  }

  toggleSign(): void {
    if (this.state.display === "0" || this.state.display === "Error") {
      return;
    }

    const value = parseFloat(this.state.display);
    const newValue = -value;
    this.updateState({ display: this.formatDisplay(newValue) });
  }
}
