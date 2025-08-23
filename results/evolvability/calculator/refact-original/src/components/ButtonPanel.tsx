import React from 'react';
import { Operation } from '../utils/operations';
import { Button } from './Button';
import './ButtonPanel.css';

export type ButtonConfig =
  | { label: string; type: 'digit' }
  | { label: string; type: 'operation'; op: Operation }
  | { label: '='; type: 'evaluate' }
  | { label: 'C'; type: 'clear' };

interface PanelProps {
  onDigit: (d: string) => void;
  onOperation: (op: Operation) => void;
  onEvaluate: () => void;
  onClear: () => void;
}

const layout: ButtonConfig[][] = [
  [
    { label: 'C', type: 'clear' },
    { label: '/', type: 'operation', op: '/' },
  ],
  [
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '*', type: 'operation', op: '*' },
  ],
  [
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '-', type: 'operation', op: '-' },
  ],
  [
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '+', type: 'operation', op: '+' },
  ],
  [
    { label: '0', type: 'digit' },
    { label: '=', type: 'evaluate' },
  ],
];

export function ButtonPanel({
  onDigit,
  onOperation,
  onEvaluate,
  onClear,
}: PanelProps) {
  return (
    <div className="button-panel">
      {layout.map((row, i) => (
        <div key={i} className="row">
          {row.map((btn) => {
            const handler = (() => {
              switch (btn.type) {
                case 'digit':
                  return () => onDigit(btn.label);
                case 'operation':
                  return () => onOperation(btn.op);
                case 'evaluate':
                  return onEvaluate;
                case 'clear':
                  return onClear;
              }
            })();
            const className = btn.type === 'operation'
              ? 'button operation'
              : btn.type === 'evaluate'
              ? 'button equals'
              : btn.type === 'clear'
              ? 'button clear'
              : btn.label === '0'
              ? 'button zero'
              : 'button';
            return (
              <Button key={btn.label} onClick={handler} className={className}>
                {btn.label}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
