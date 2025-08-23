import { GRID_SIZE, PIXEL_SIZE, GRID_STROKE_COLOR } from '../constants';
import { PixelGrid } from '../types';

/**
 * Creates an initial grid of size NxN filled with the default color.
 */
export function createEmptyGrid(defaultColor: string): PixelGrid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => defaultColor)
  );
}

/**
 * Paints the entire canvas based on the 2D pixel array.
 */
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  pixels: PixelGrid
) {
  ctx.clearRect(0, 0, GRID_SIZE * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      ctx.fillStyle = pixels[row][col];
      ctx.fillRect(
        col * PIXEL_SIZE,
        row * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );

      ctx.strokeStyle = GRID_STROKE_COLOR;
      ctx.strokeRect(
        col * PIXEL_SIZE,
        row * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  }
}

/**
 * Extracts a PixelGrid out of ImageData (for loading images).
 */
export function imageDataToGrid(data: ImageData): PixelGrid {
  const grid: PixelGrid = [];
  for (let row = 0; row < data.height; row++) {
    const rowArr: string[] = [];
    for (let col = 0; col < data.width; col++) {
      const idx = (row * data.width + col) * 4;
      const [r, g, b] = [
        data.data[idx],
        data.data[idx + 1],
        data.data[idx + 2],
      ];
      rowArr.push(`rgb(${r}, ${g}, ${b})`);
    }
    grid.push(rowArr);
  }
  return grid;
}
