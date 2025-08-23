import React from "react";
import "./Calculator.css";
import { useCalculator } from "./hooks/useCalculator";
import { Display } from "./components/Display";
import { Button, NumberButton, OperationButton } from "./components/Button";
import { BUTTON_CLASSES, OPERATIONS } from "./constants/calculator.constants";
import { Operation } from "./types/calculator.types";

const Calculator: React.FC = () => {
  const { display, inputNumber, inputOperation, performCalculation, clear } =
    useCalculator();

  return (
    <div className="calculator">
      <Display value={display} />
      <div className="buttons">
        <Button onClick={clear} className={BUTTON_CLASSES.CLEAR}>
          C
        </Button>
        <OperationButton
          operation={OPERATIONS.DIVIDE as Operation}
          onClick={inputOperation}
        />
        <NumberButton number="7" onClick={inputNumber} />
        <NumberButton number="8" onClick={inputNumber} />
        <NumberButton number="9" onClick={inputNumber} />
        <OperationButton
          operation={OPERATIONS.MULTIPLY as Operation}
          onClick={inputOperation}
        />
        <NumberButton number="4" onClick={inputNumber} />
        <NumberButton number="5" onClick={inputNumber} />
        <NumberButton number="6" onClick={inputNumber} />
        <OperationButton
          operation={OPERATIONS.SUBTRACT as Operation}
          onClick={inputOperation}
        />
        <NumberButton number="1" onClick={inputNumber} />
        <NumberButton number="2" onClick={inputNumber} />
        <NumberButton number="3" onClick={inputNumber} />
        <OperationButton
          operation={OPERATIONS.ADD as Operation}
          onClick={inputOperation}
        />
        <NumberButton number="0" onClick={inputNumber} />
        <Button onClick={performCalculation} className={BUTTON_CLASSES.EQUALS}>
          =
        </Button>
      </div>
    </div>
  );
};

export default Calculator;
