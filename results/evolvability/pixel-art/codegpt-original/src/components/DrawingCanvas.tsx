import React, { useEffect } from 'react';
import { CanvasProps } from '../types';
import { useCanvas } from '../hooks/useCanvas';
import './DrawingCanvas.css';

/**
 * DrawingCanvas component - handles the drawing canvas UI
 * Follows Single Responsibility Principle - only handles canvas display and interaction
 */
const DrawingCanvas: React.FC<CanvasProps> = ({ 
  pixels, 
  selectedColor, 
  config, 
  onPixelClick 
}) => {
  const { 
    canvasRef, 
    renderGrid, 
    handleCanvasClick, 
    updateConfig 
  } = useCanvas(config);

  // Update canvas configuration when config changes
  useEffect(() => {
    updateConfig(config);
  }, [config, updateConfig]);

  // Render grid when pixels change
  useEffect(() => {
    renderGrid(pixels);
  }, [pixels, renderGrid]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasClick(event, onPixelClick);
  };

  const canvasStyle = {
    width: config.gridSize * config.pixelSize,
    height: config.gridSize * config.pixelSize,
  };

  return (
    <div className=\"canvas-container\">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className=\"drawing-canvas\"
        style={canvasStyle}
        aria-label=\"Pixel art drawing canvas\"
        role=\"img\"
      />
      <div className=\"canvas-info\">
        <span>Grid: {config.gridSize}×{config.gridSize}</span>
        <span>Selected: RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})</span>
      </div>
    </div>
  );
};

export default DrawingCanvas;