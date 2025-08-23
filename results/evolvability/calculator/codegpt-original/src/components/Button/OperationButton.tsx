import React from "react";
import { Button } from "./Button";
import { Operation } from "../../types/calculator.types";
import { BUTTON_CLASSES } from "../../constants/calculator.constants";

interface OperationButtonProps {
  operation: Operation;
  onClick: (operation: Operation) => void;
  className?: string;
}

export const OperationButton: React.FC<OperationButtonProps> = ({
  operation,
  onClick,
  className = "",
}) => {
  const finalClassName = `${BUTTON_CLASSES.OPERATION} ${className}`.trim();

  return (
    <Button onClick={() => onClick(operation)} className={finalClassName}>
      {operation}
    </Button>
  );
};
