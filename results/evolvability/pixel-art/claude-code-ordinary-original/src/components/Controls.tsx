import React from 'react';
import { PixelGrid } from '../types';
import { savePixelsAsBitmap } from '../utils/fileUtils';

interface ControlsProps {
  pixels: PixelGrid;
  onLoadClick: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ pixels, onLoadClick }) => {
  const handleSave = () => {
    savePixelsAsBitmap(pixels);
  };

  return (
    <div className="controls">
      <button onClick={handleSave}>Save as Bitmap</button>
      <button onClick={onLoadClick}>Load Bitmap</button>
    </div>
  );
};