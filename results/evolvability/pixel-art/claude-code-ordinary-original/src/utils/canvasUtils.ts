import { PixelGrid, GridPosition, Coordinates, Color } from '../types';
import { GRID_SIZE, PIXEL_SIZE, GRID_LINE_COLOR } from '../constants';

export const drawPixelGrid = (
  ctx: CanvasRenderingContext2D,
  pixels: PixelGrid,
  width: number,
  height: number
): void => {
  ctx.clearRect(0, 0, width, height);
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      ctx.fillStyle = pixels[row][col];
      ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      
      ctx.strokeStyle = GRID_LINE_COLOR;
      ctx.strokeRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
};

export const getGridPositionFromCoordinates = (
  x: number,
  y: number
): GridPosition => {
  const col = Math.floor(x / PIXEL_SIZE);
  const row = Math.floor(y / PIXEL_SIZE);
  return { row, col };
};

export const isValidGridPosition = (position: GridPosition): boolean => {
  return (
    position.row >= 0 &&
    position.row < GRID_SIZE &&
    position.col >= 0 &&
    position.col < GRID_SIZE
  );
};

export const getCoordinatesFromMouseEvent = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Coordinates => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};

export const colorToRgbString = (color: Color): string => {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
};

export const createPixelCanvas = (pixels: PixelGrid): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = GRID_SIZE;
  canvas.height = GRID_SIZE;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      ctx.fillStyle = pixels[row][col];
      ctx.fillRect(col, row, 1, 1);
    }
  }

  return canvas;
};