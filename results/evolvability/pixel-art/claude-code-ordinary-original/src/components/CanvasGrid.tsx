import React, { useRef, useEffect } from 'react';
import { PixelGrid, GridPosition } from '../types';
import { GRID_SIZE, PIXEL_SIZE } from '../constants';
import {
  drawPixelGrid,
  getCoordinatesFromMouseEvent,
  getGridPositionFromCoordinates
} from '../utils/canvasUtils';

interface CanvasGridProps {
  pixels: PixelGrid;
  onPixelClick: (position: GridPosition) => void;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ pixels, onPixelClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPixelGrid(ctx, pixels, canvas.width, canvas.height);
  }, [pixels]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coordinates = getCoordinatesFromMouseEvent(e, canvas);
    const position = getGridPositionFromCoordinates(coordinates.x, coordinates.y);
    onPixelClick(position);
  };

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * PIXEL_SIZE}
      height={GRID_SIZE * PIXEL_SIZE}
      onClick={handleCanvasClick}
      className="drawing-canvas"
    />
  );
};