import { useEffect } from 'react';
import { Operation } from '../types/calculator.types';

interface UseKeyboardProps {
  onNumber: (num: string) => void;
  onOperation: (op: Operation) => void;
  onCalculate: () => void;
  onClear: () => void;
  onBackspace: () => void;
}

export const useKeyboard = ({
  onNumber,
  onOperation,
  onCalculate,
  onClear,
  onBackspace,
}: UseKeyboardProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;

      // Prevent default behavior for calculator keys
      if (/[0-9+\-*/=.]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
      }

      // Number keys
      if (/[0-9]/.test(key)) {
        onNumber(key);
        return;
      }

      // Operation keys
      switch (key) {
        case '+':
          onOperation('+');
          break;
        case '-':
          onOperation('-');
          break;
        case '*':
          onOperation('*');
          break;
        case '/':
          onOperation('/');\n          break;
        case '=':
        case 'Enter':
          onCalculate();
          break;
        case 'Escape':
        case 'c':
        case 'C':
          onClear();
          break;
        case 'Backspace':
          onBackspace();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onNumber, onOperation, onCalculate, onClear, onBackspace]);
};