import React from "react";

interface DisplayProps {
  value: string;
  className?: string;
}

export const Display: React.FC<DisplayProps> = ({
  value,
  className = "display",
}) => {
  return <div className={className}>{value}</div>;
};
