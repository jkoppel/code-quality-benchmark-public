import React from "react";
import "./Display.css";

interface DisplayProps {
  value: string;
  className?: string;
}

export const Display: React.FC<DisplayProps> = ({ value, className = "" }) => {
  const displayClassName = ["calculator-display", className]
    .filter(Boolean)
    .join(" ");

  // Format the display value for better readability
  const formatDisplayValue = (val: string): string => {
    if (val === "Error") return val;

    // Add commas for large numbers (but not during input)
    if (val.length > 3 && !val.includes(".") && val !== "0") {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 1000) {
        return num.toLocaleString();
      }
    }

    return val;
  };

  return (
    <div
      className={displayClassName}
      data-testid="calculator-display"
      role="textbox"
      aria-readonly="true"
      aria-label={`Calculator display showing ${value}`}
    >
      <span className="calculator-display__value">
        {formatDisplayValue(value)}
      </span>
    </div>
  );
};
