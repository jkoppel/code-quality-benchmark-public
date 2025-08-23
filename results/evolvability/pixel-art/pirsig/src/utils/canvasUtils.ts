import { PixelGrid, GridPosition } from '../types';
import { GRID_SIZE, PIXEL_SIZE, GRID_STROKE_COLOR } from '../constants';

export const drawPixelGrid = (
  canvas: HTMLCanvasElement | null,
  pixels: PixelGrid
): void => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      ctx.fillStyle = pixels[row][col];
      ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      
      ctx.strokeStyle = GRID_STROKE_COLOR;
      ctx.strokeRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
};

export const getGridPosition = (
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): GridPosition | null => {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  const col = Math.floor(x / PIXEL_SIZE);
  const row = Math.floor(y / PIXEL_SIZE);
  
  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    return { row, col };
  }
  
  return null;
};

export const createEmptyGrid = (): PixelGrid => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'));
};

export const updatePixel = (
  pixels: PixelGrid,
  position: GridPosition,
  color: string
): PixelGrid => {
  const newPixels = pixels.map(row => [...row]);
  newPixels[position.row][position.col] = color;
  return newPixels;
};