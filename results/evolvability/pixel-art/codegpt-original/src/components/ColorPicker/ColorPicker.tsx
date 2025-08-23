import React from 'react';
import { RGBColor } from '../../types';
import './ColorPicker.css';

interface ColorPickerProps {
  selectedColor: RGBColor;
  onColorChange: (component: keyof RGBColor, value: number) => void;
  onRandomColor: () => void;
  onResetColor: () => void;
}

/**
 * ColorPicker component following Single Responsibility Principle
 * Handles color selection UI and user interactions
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  onRandomColor,
  onResetColor
}) => {
  const colorString = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;

  return (
    <div className=\"color-picker\">
      <h3>Color Picker</h3>
      
      <div className=\"rgb-controls\">
        <div className=\"color-input\">
          <label>R:</label>
          <input
            type=\"range\"
            min=\"0\"
            max=\"255\"
            value={selectedColor.r}
            onChange={(e) => onColorChange('r', parseInt(e.target.value))}
            className=\"color-slider red-slider\"
          />
          <span className=\"color-value\">{selectedColor.r}</span>
        </div>
        
        <div className=\"color-input\">
          <label>G:</label>
          <input
            type=\"range\"
            min=\"0\"
            max=\"255\"
            value={selectedColor.g}
            onChange={(e) => onColorChange('g', parseInt(e.target.value))}
            className=\"color-slider green-slider\"
          />
          <span className=\"color-value\">{selectedColor.g}</span>
        </div>
        
        <div className=\"color-input\">
          <label>B:</label>
          <input
            type=\"range\"
            min=\"0\"
            max=\"255\"
            value={selectedColor.b}
            onChange={(e) => onColorChange('b', parseInt(e.target.value))}
            className=\"color-slider blue-slider\"
          />
          <span className=\"color-value\">{selectedColor.b}</span>
        </div>
      </div>
      
      <div 
        className=\"color-preview\" 
        style={{ backgroundColor: colorString }}
        title={colorString}
      />
      
      <div className=\"color-actions\">
        <button 
          onClick={onRandomColor}
          className=\"action-button random-button\"
          type=\"button\"
        >
          Random Color
        </button>
        <button 
          onClick={onResetColor}
          className=\"action-button reset-button\"
          type=\"button\"
        >
          Reset
        </button>
      </div>
    </div>
  );
};