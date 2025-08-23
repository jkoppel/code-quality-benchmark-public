import React from 'react';
import { useCalculator } from './hooks';
import { Display, ButtonPanel } from './components';
import { CalculatorProps } from './types';
import './Calculator.css';

/**
 * Main Calculator component that combines display and button panel
 * Uses custom hook for state management and business logic
 */
const Calculator: React.FC<CalculatorProps> = ({ className = '', onCalculation }) => {
  const {
    display,
    inputNumber,
    inputOperation,
    performCalculation,
    clear,
  } = useCalculator();

  // Notify parent component of calculations if callback is provided
  React.useEffect(() => {
    if (onCalculation && display !== '0' && display !== 'Error') {
      onCalculation(display);
    }
  }, [display, onCalculation]);

  const handleEqualsClick = () => {
    performCalculation();
  };

  return (
    <div className={`calculator ${className}`.trim()}>
      <Display value={display} />
      <ButtonPanel
        onNumberClick={inputNumber}
        onOperationClick={inputOperation}
        onEqualsClick={handleEqualsClick}
        onClearClick={clear}
      />
    </div>
  );
};

export default Calculator;