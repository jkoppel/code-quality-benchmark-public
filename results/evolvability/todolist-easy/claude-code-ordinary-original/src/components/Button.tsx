import React, { ButtonHTMLAttributes } from 'react';
import '../styles/Button.css';

type ButtonVariant = 'primary' | 'edit' | 'delete' | 'save' | 'cancel';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const getButtonClass = () => {
    const baseClass = variant === 'primary' ? 'add-button' : 'todo-button';
    const variantClass = variant !== 'primary' ? ` ${variant}` : '';
    return `${baseClass}${variantClass} ${className}`.trim();
  };

  return (
    <button 
      className={getButtonClass()} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;