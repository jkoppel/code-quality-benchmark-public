import React from 'react';
import { Color } from '../types';

interface ColorPickerProps {
  selectedColor: Color;
  onColorChange: (color: Partial<Color>) => void;
}

interface ColorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const ColorSlider: React.FC<ColorSliderProps> = ({ label, value, onChange }) => (
  <div className="color-input">
    <label>{label}:</label>
    <input
      type="range"
      min="0"
      max="255"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
    />
    <span>{value}</span>
  </div>
);

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  return (
    <div className="color-picker">
      <h3>Color Picker</h3>
      <div className="rgb-controls">
        <ColorSlider
          label="R"
          value={selectedColor.r}
          onChange={(value) => onColorChange({ r: value })}
        />
        <ColorSlider
          label="G"
          value={selectedColor.g}
          onChange={(value) => onColorChange({ g: value })}
        />
        <ColorSlider
          label="B"
          value={selectedColor.b}
          onChange={(value) => onColorChange({ b: value })}
        />
      </div>
      <div
        className="color-preview"
        style={{
          backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`
        }}
      />
    </div>
  );
};