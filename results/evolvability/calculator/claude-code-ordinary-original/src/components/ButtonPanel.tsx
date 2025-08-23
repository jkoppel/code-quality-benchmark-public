import React from 'react';
import Button from './Button';
import './ButtonPanel.css';

export interface ButtonPanelProps {
  onNumberClick: (num: string) => void;
  onOperationClick: (operation: string) => void;
  onEqualsClick: () => void;
  onClearClick: () => void;
}

const ButtonPanel: React.FC<ButtonPanelProps> = ({
  onNumberClick,
  onOperationClick,
  onEqualsClick,
  onClearClick,
}) => {
  const numberButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <div className="button-panel">
      {/* First row: Clear and division */}
      <Button 
        value="C" 
        onClick={onClearClick} 
        type="clear"
        className="clear-button"
      />
      <Button 
        value="/" 
        onClick={() => onOperationClick('/')} 
        type="operation"
      />

      {/* Number buttons and operations */}
      {numberButtons.map((num, index) => {
        const buttons = [<Button key={num} value={num} onClick={() => onNumberClick(num)} type="number" />];
        
        // Add operation buttons at specific positions
        if (index === 2) { // After 9
          buttons.push(
            <Button 
              key="multiply" 
              value="*" 
              onClick={() => onOperationClick('*')} 
              type="operation"
            />
          );
        } else if (index === 5) { // After 6
          buttons.push(
            <Button 
              key="subtract" 
              value="-" 
              onClick={() => onOperationClick('-')} 
              type="operation"
            />
          );
        } else if (index === 8) { // After 3
          buttons.push(
            <Button 
              key="add" 
              value="+" 
              onClick={() => onOperationClick('+')} 
              type="operation"
            />
          );
        }
        
        return buttons;
      })}

      {/* Last row: 0 and equals */}
      <Button 
        value="0" 
        onClick={() => onNumberClick('0')} 
        type="number"
        className="calculator-button--zero"
      />
      <Button 
        value="=" 
        onClick={onEqualsClick} 
        type="equals"
      />
    </div>
  );
};

export default ButtonPanel;