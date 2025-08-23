import React from 'react';
import { RGB } from '../types';

interface Props {
  color: RGB;
  onChange: (color: RGB) => void;
}

const ColorPicker: React.FC<Props> = ({ color, onChange }) => {
  const handleChange = (channel: keyof RGB) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = parseInt(e.target.value, 10);
    onChange({ ...color, [channel]: val });
  };

  return (
    <div className="color-picker">
      <h3>Color Picker</h3>
      <div className="rgb-controls">
        {(['r', 'g', 'b'] as (keyof RGB)[]).map((ch) => (
          <div key={ch} className="color-input">
            <label>{ch.toUpperCase()}:</label>
            <input
              type="range"
              min="0"
              max="255"
              value={color[ch]}
              onChange={handleChange(ch)}
            />
            <span>{color[ch]}</span>
          </div>
        ))}
      </div>
      <div
        className="color-preview"
        style={{
          backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
        }}
      />
    </div>
  );
};

export default ColorPicker;
