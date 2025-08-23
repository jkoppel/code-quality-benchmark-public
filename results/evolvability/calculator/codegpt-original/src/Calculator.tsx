import React from "react";
import { Display, ButtonGrid } from "./components";
import { useCalculator, useKeyboard } from "./hooks";
import { Operation } from "./types";
import "./Calculator.css";

/**
 * Calculator Component - Refactored following SOLID principles
 *
 * Single Responsibility: Only handles UI composition and user interactions
 * Open/Closed: Extensible through props and composition
 * Liskov Substitution: Components can be substituted with compatible implementations
 * Interface Segregation: Uses focused interfaces for different concerns
 * Dependency Inversion: Depends on abstractions (hooks) rather than concrete implementations
 */
const Calculator: React.FC = () => {
  // Use custom hooks for separation of concerns
  const {
    state,
    inputNumber,
    inputOperation,
    calculate,
    clear,
    backspace,
    toggleSign,
  } = useCalculator();

  // Keyboard support
  useKeyboard({
    onNumber: inputNumber,
    onOperation: inputOperation,
    onCalculate: calculate,
    onClear: clear,
    onBackspace: backspace,
  });

  // Event handlers with proper error boundaries
  const handleNumberClick = (num: string) => {
    try {
      inputNumber(num);
    } catch (error) {
      console.error("Number input error:", error);
    }
  };

  const handleOperationClick = (operation: Operation) => {
    try {
      inputOperation(operation);
    } catch (error) {
      console.error("Operation input error:", error);
    }
  };

  const handleEqualsClick = () => {
    try {
      calculate();
    } catch (error) {
      console.error("Calculation error:", error);
    }
  };

  const handleClearClick = () => {
    try {
      clear();
    } catch (error) {
      console.error("Clear error:", error);
    }
  };

  // Determine if calculator should be disabled (e.g., during error state)
  const isDisabled = state.display === "Error";

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <Display
        value={state.display}
        className={isDisabled ? "calculator-display--error" : ""}
      />

      <ButtonGrid
        onNumberClick={handleNumberClick}
        onOperationClick={handleOperationClick}
        onEqualsClick={handleEqualsClick}
        onClearClick={handleClearClick}
        disabled={false} // Keep buttons enabled even in error state for better UX
      />
    </div>
  );
};

export default Calculator;
