// Calculator operation types
export type Operation = '+' | '-' | '*' | '/';

// Calculator state interface
export interface CalculatorState {
  display: string;
  previousValue: string | null;
  operation: Operation | null;
  waitingForNewValue: boolean;
}

// Calculator button types
export type ButtonType = 'number' | 'operation' | 'equals' | 'clear';

// Button configuration interface
export interface ButtonConfig {
  label: string;
  value: string;
  type: ButtonType;
  className?: string;
  gridSpan?: number;
}

// Calculation strategy interface
export interface CalculationStrategy {
  calculate(firstValue: number, secondValue: number): number;
}

// Calculator actions
export type CalculatorAction =
  | { type: 'INPUT_NUMBER'; payload: string }
  | { type: 'INPUT_OPERATION'; payload: Operation }
  | { type: 'CALCULATE' }
  | { type: 'CLEAR' }
  | { type: 'SET_DISPLAY'; payload: string }
  | { type: 'SET_PREVIOUS_VALUE'; payload: string | null }
  | { type: 'SET_WAITING_FOR_NEW_VALUE'; payload: boolean };

// Error types
export interface CalculatorError {
  message: string;
  type: 'DIVISION_BY_ZERO' | 'INVALID_INPUT' | 'OVERFLOW' | 'GENERAL_ERROR';
}