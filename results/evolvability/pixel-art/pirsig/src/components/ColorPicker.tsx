import React from 'react';
import { RGB } from '../types';

interface ColorPickerProps {
  selectedColor: RGB;
  onColorChange: (color: RGB) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  const handleColorChange = (channel: keyof RGB, value: number) => {
    onColorChange({ ...selectedColor, [channel]: value });
  };

  return (
    <div className="color-picker">
      <h3>Color Picker</h3>
      <div className="rgb-controls">
        <div className="color-input">
          <label>R:</label>
          <input
            type="range"
            min="0"
            max="255"
            value={selectedColor.r}
            onChange={(e) => handleColorChange('r', parseInt(e.target.value))}
          />
          <span>{selectedColor.r}</span>
        </div>
        <div className="color-input">
          <label>G:</label>
          <input
            type="range"
            min="0"
            max="255"
            value={selectedColor.g}
            onChange={(e) => handleColorChange('g', parseInt(e.target.value))}
          />
          <span>{selectedColor.g}</span>
        </div>
        <div className="color-input">
          <label>B:</label>
          <input
            type="range"
            min="0"
            max="255"
            value={selectedColor.b}
            onChange={(e) => handleColorChange('b', parseInt(e.target.value))}
          />
          <span>{selectedColor.b}</span>
        </div>
      </div>
      <div 
        className="color-preview" 
        style={{ backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` }}
      />
    </div>
  );
};

export default ColorPicker;