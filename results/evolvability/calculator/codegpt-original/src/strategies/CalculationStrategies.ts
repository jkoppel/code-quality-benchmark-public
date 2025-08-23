import { CalculationStrategy, CalculatorError } from '../types/calculator.types';

// Addition strategy
export class AdditionStrategy implements CalculationStrategy {
  calculate(firstValue: number, secondValue: number): number {
    const result = firstValue + secondValue;
    if (!isFinite(result)) {
      throw new Error('Overflow error in addition');
    }
    return result;
  }
}

// Subtraction strategy
export class SubtractionStrategy implements CalculationStrategy {
  calculate(firstValue: number, secondValue: number): number {
    const result = firstValue - secondValue;
    if (!isFinite(result)) {
      throw new Error('Overflow error in subtraction');
    }
    return result;
  }
}

// Multiplication strategy
export class MultiplicationStrategy implements CalculationStrategy {
  calculate(firstValue: number, secondValue: number): number {
    const result = firstValue * secondValue;
    if (!isFinite(result)) {
      throw new Error('Overflow error in multiplication');
    }
    return result;
  }
}

// Division strategy
export class DivisionStrategy implements CalculationStrategy {
  calculate(firstValue: number, secondValue: number): number {
    if (secondValue === 0) {
      throw new Error('Division by zero');
    }
    const result = firstValue / secondValue;
    if (!isFinite(result)) {
      throw new Error('Overflow error in division');
    }
    return result;
  }
}

// Strategy factory
export class CalculationStrategyFactory {
  private static strategies = new Map<string, CalculationStrategy>([
    ['+', new AdditionStrategy()],
    ['-', new SubtractionStrategy()],
    ['*', new MultiplicationStrategy()],
    ['/', new DivisionStrategy()],
  ]);

  static getStrategy(operation: string): CalculationStrategy {
    const strategy = this.strategies.get(operation);
    if (!strategy) {
      throw new Error(`Unknown operation: ${operation}`);
    }
    return strategy;
  }

  static calculate(firstValue: number, secondValue: number, operation: string): number {
    try {
      const strategy = this.getStrategy(operation);
      return strategy.calculate(firstValue, secondValue);
    } catch (error) {
      throw error;
    }
  }
}