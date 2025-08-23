import React from 'react';
import './Display.css';

export interface DisplayProps {
  value: string;
  className?: string;
}

const Display: React.FC<DisplayProps> = ({ value, className = '' }) => {
  return (
    <div className={`calculator-display ${className}`.trim()}>
      {value}
    </div>
  );
};

export default Display;