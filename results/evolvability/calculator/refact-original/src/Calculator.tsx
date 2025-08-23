import React, { useState } from 'react';
import './Calculator.css';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation !== null) {
      const newValue = calculate(parseFloat(previousValue), inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="calculator">
      <div className="display">{display}</div>
      <div className="buttons">
        <button onClick={clear} className="clear">C</button>
        <button onClick={() => inputOperation('/')} className="operation">/</button>
        <button onClick={() => inputNumber('7')}>7</button>
        <button onClick={() => inputNumber('8')}>8</button>
        <button onClick={() => inputNumber('9')}>9</button>
        <button onClick={() => inputOperation('*')} className="operation">*</button>
        <button onClick={() => inputNumber('4')}>4</button>
        <button onClick={() => inputNumber('5')}>5</button>
        <button onClick={() => inputNumber('6')}>6</button>
        <button onClick={() => inputOperation('-')} className="operation">-</button>
        <button onClick={() => inputNumber('1')}>1</button>
        <button onClick={() => inputNumber('2')}>2</button>
        <button onClick={() => inputNumber('3')}>3</button>
        <button onClick={() => inputOperation('+')} className="operation">+</button>
        <button onClick={() => inputNumber('0')} className="zero">0</button>
        <button onClick={performCalculation} className="equals">=</button>
      </div>
    </div>
  );
};

export default Calculator;