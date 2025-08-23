import React from 'react';
import './Button.css';

export type ButtonType = 'number' | 'operation' | 'clear' | 'equals';

export interface ButtonProps {
  value: string;
  onClick: () => void;
  type?: ButtonType;
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  value, 
  onClick, 
  type = 'number', 
  className = '', 
  children 
}) => {
  const getButtonClass = () => {
    const baseClass = 'calculator-button';
    const typeClass = `calculator-button--${type}`;
    return `${baseClass} ${typeClass} ${className}`.trim();
  };

  return (
    <button 
      className={getButtonClass()} 
      onClick={onClick}
      data-value={value}
    >
      {children || value}
    </button>
  );
};

export default Button;