export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type PixelGrid = string[][];

export interface CanvasConfig {
  gridSize: number;
  pixelSize: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface GridPosition {
  row: number;
  col: number;
}