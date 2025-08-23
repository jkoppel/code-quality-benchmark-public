import React from "react";
import { Button } from "../Button";
import { ButtonConfig, Operation } from "../../types/calculator.types";
import "./ButtonGrid.css";

interface ButtonGridProps {
  onNumberClick: (num: string) => void;
  onOperationClick: (op: Operation) => void;
  onEqualsClick: () => void;
  onClearClick: () => void;
  disabled?: boolean;
}

export const ButtonGrid: React.FC<ButtonGridProps> = ({
  onNumberClick,
  onOperationClick,
  onEqualsClick,
  onClearClick,
  disabled = false,
}) => {
  // Button configuration following a consistent layout
  const buttonConfigs: ButtonConfig[] = [
    { label: "C", value: "clear", type: "clear", gridSpan: 3 },
    { label: "/", value: "/", type: "operation" },

    { label: "7", value: "7", type: "number" },
    { label: "8", value: "8", type: "number" },
    { label: "9", value: "9", type: "number" },
    { label: "*", value: "*", type: "operation" },

    { label: "4", value: "4", type: "number" },
    { label: "5", value: "5", type: "number" },
    { label: "6", value: "6", type: "number" },
    { label: "-", value: "-", type: "operation" },

    { label: "1", value: "1", type: "number" },
    { label: "2", value: "2", type: "number" },
    { label: "3", value: "3", type: "number" },
    { label: "+", value: "+", type: "operation" },

    { label: "0", value: "0", type: "number", gridSpan: 2 },
    { label: "=", value: "=", type: "equals" },
  ];

  const handleButtonClick = (config: ButtonConfig) => {
    if (disabled) return;

    switch (config.type) {
      case "number":
        onNumberClick(config.value);
        break;
      case "operation":
        onOperationClick(config.value as Operation);
        break;
      case "equals":
        onEqualsClick();
        break;
      case "clear":
        onClearClick();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="calculator-button-grid"
      role="grid"
      aria-label="Calculator buttons"
    >
      {buttonConfigs.map((config, index) => (
        <Button
          key={`${config.type}-${config.value}-${index}`}
          label={config.label}
          type={config.type}
          gridSpan={config.gridSpan}
          onClick={() => handleButtonClick(config)}
          disabled={disabled}
          data-testid={`button-${config.value}`}
        />
      ))}
    </div>
  );
};
