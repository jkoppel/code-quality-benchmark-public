import React from 'react';
import { ColorPickerProps } from '../types';
import { rgbToString } from '../utils/colorUtils';
import './ColorPicker.css';

/**
 * ColorPicker component - handles color selection UI
 * Follows Single Responsibility Principle - only handles color picker UI
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  const handleColorChange = (component: 'r' | 'g' | 'b', value: number) => {
    onColorChange({
      ...selectedColor,
      [component]: value,
    });
  };

  const colorPreviewStyle = {
    backgroundColor: rgbToString(selectedColor),
  };

  return (
    <div className=\"color-picker\">
      <h3>Color Picker</h3>
      <div className=\"rgb-controls\">
        <div className=\"color-input\">
          <label htmlFor=\"red-slider\">R:</label>
          <input
            id=\"red-slider\"
            type=\"range\"
            min=\"0\"
            max=\"255\"
            value={selectedColor.r}
            onChange={(e) => handleColorChange('r', parseInt(e.target.value))}
            aria-label=\"Red component\"
          />
          <span>{selectedColor.r}</span>
        </div>
        <div className=\"color-input\">
          <label htmlFor=\"green-slider\">G:</label>
          <input
            id=\"green-slider\"
            type=\"range\"
            min=\"0\"
            max=\"255\"
            value={selectedColor.g}
            onChange={(e) => handleColorChange('g', parseInt(e.target.value))}
            aria-label=\"Green component\"
          />
          <span>{selectedColor.g}</span>
        </div>
        <div className=\"color-input\">
          <label htmlFor=\"blue-slider\">B:</label>
          <input
            id=\"blue-slider\"
            type=\"range\"
            min=\"0\"
            max=\"255\"
            value={selectedColor.b}
            onChange={(e) => handleColorChange('b', parseInt(e.target.value))}
            aria-label=\"Blue component\"
          />
          <span>{selectedColor.b}</span>
        </div>
      </div>
      <div 
        className=\"color-preview\" 
        style={colorPreviewStyle}
        aria-label={`Selected color: RGB(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`}
      />
    </div>
  );
};

export default ColorPicker;