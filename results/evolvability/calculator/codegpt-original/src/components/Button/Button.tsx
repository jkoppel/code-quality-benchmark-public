import React from "react";
import { ButtonProps } from "../../types/calculator.types";

export const Button: React.FC<ButtonProps> = ({
  onClick,
  className = "",
  children,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};
