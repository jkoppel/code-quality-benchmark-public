import React from "react";
import { Button } from "./Button";
import { BUTTON_CLASSES } from "../../constants/calculator.constants";

interface NumberButtonProps {
  number: string;
  onClick: (number: string) => void;
  className?: string;
}

export const NumberButton: React.FC<NumberButtonProps> = ({
  number,
  onClick,
  className = "",
}) => {
  const buttonClass =
    number === "0" ? BUTTON_CLASSES.ZERO : BUTTON_CLASSES.NUMBER;
  const finalClassName = `${buttonClass} ${className}`.trim();

  return (
    <Button onClick={() => onClick(number)} className={finalClassName}>
      {number}
    </Button>
  );
};
