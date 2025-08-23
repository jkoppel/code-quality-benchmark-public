import React from "react";
import { ButtonType } from "../../types/calculator.types";
import "./Button.css";

interface ButtonProps {
  label: string;
  onClick: () => void;
  type?: ButtonType;
  className?: string;
  gridSpan?: number;
  disabled?: boolean;
  "data-testid"?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = "number",
  className = "",
  gridSpan,
  disabled = false,
  "data-testid": testId,
}) => {
  const baseClassName = "calculator-button";
  const typeClassName = `calculator-button--${type}`;
  const spanClassName = gridSpan ? `calculator-button--span-${gridSpan}` : "";
  const disabledClassName = disabled ? "calculator-button--disabled" : "";

  const combinedClassName = [
    baseClassName,
    typeClassName,
    spanClassName,
    disabledClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      className={combinedClassName}
      onClick={handleClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={`Calculator button ${label}`}
    >
      {label}
    </button>
  );
};
