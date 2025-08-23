import React from 'react';
import './Button.css';

interface ButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Button({ onClick, className, children }: ButtonProps) {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
