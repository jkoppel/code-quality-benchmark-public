import {
  Operation,
  CalculatorState,
  CalculationResult,
} from "../types/calculator.types";
import { OperationContext } from "../strategies/operation.strategies";
import { CALCULATOR_CONSTANTS } from "../constants/calculator.constants";

export class CalculatorService {
  private operationContext = new OperationContext();

  validateInput(input: string): boolean {
    return !isNaN(parseFloat(input)) && isFinite(parseFloat(input));
  }

  formatDisplay(value: string): string {
    if (value.length > CALCULATOR_CONSTANTS.MAX_DISPLAY_LENGTH) {
      const num = parseFloat(value);
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
      }
      return num.toPrecision(CALCULATOR_CONSTANTS.MAX_DISPLAY_LENGTH);
    }
    return value;
  }

  calculate(
    firstValue: number,
    secondValue: number,
    operation: Operation
  ): CalculationResult {
    try {
      if (
        !this.validateInput(firstValue.toString()) ||
        !this.validateInput(secondValue.toString())
      ) {
        return {
          result: 0,
          error: CALCULATOR_CONSTANTS.INVALID_INPUT_ERROR,
        };
      }

      const result = this.operationContext.execute(
        operation,
        firstValue,
        secondValue
      );

      if (!isFinite(result)) {
        return {
          result: 0,
          error: CALCULATOR_CONSTANTS.DIVISION_BY_ZERO_ERROR,
        };
      }

      return { result };
    } catch (error) {
      return {
        result: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  getInitialState(): CalculatorState {
    return {
      display: CALCULATOR_CONSTANTS.INITIAL_DISPLAY,
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
    };
  }

  processNumberInput(
    currentState: CalculatorState,
    number: string
  ): CalculatorState {
    if (currentState.waitingForNewValue) {
      return {
        ...currentState,
        display: number,
        waitingForNewValue: false,
      };
    }

    const newDisplay =
      currentState.display === CALCULATOR_CONSTANTS.INITIAL_DISPLAY
        ? number
        : currentState.display + number;

    return {
      ...currentState,
      display: this.formatDisplay(newDisplay),
    };
  }

  processOperationInput(
    currentState: CalculatorState,
    nextOperation: Operation
  ): CalculatorState {
    const inputValue = parseFloat(currentState.display);

    if (currentState.previousValue === null) {
      return {
        ...currentState,
        previousValue: currentState.display,
        operation: nextOperation,
        waitingForNewValue: true,
      };
    }

    if (currentState.operation) {
      const calculation = this.calculate(
        parseFloat(currentState.previousValue),
        inputValue,
        currentState.operation
      );

      if (calculation.error) {
        return {
          ...this.getInitialState(),
          display: calculation.error,
        };
      }

      const newValue = String(calculation.result);
      return {
        ...currentState,
        display: this.formatDisplay(newValue),
        previousValue: newValue,
        operation: nextOperation,
        waitingForNewValue: true,
      };
    }

    return {
      ...currentState,
      operation: nextOperation,
      waitingForNewValue: true,
    };
  }

  processEquals(currentState: CalculatorState): CalculatorState {
    if (
      currentState.previousValue === null ||
      currentState.operation === null
    ) {
      return currentState;
    }

    const inputValue = parseFloat(currentState.display);
    const calculation = this.calculate(
      parseFloat(currentState.previousValue),
      inputValue,
      currentState.operation
    );

    if (calculation.error) {
      return {
        ...this.getInitialState(),
        display: calculation.error,
      };
    }

    return {
      ...currentState,
      display: this.formatDisplay(String(calculation.result)),
      previousValue: null,
      operation: null,
      waitingForNewValue: true,
    };
  }

  processClear(): CalculatorState {
    return this.getInitialState();
  }
}
