import React from 'react';
import './Display.css';

interface DisplayProps {
  value: string;
}

export function Display({ value }: DisplayProps) {
  return <div className="display">{value}</div>;
}
