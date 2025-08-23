// Core types for the Pixel Art Editor

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface CanvasConfig {
  gridSize: number;
  pixelSize: number;
  strokeColor: string;
}

export interface FileHandlerConfig {
  defaultFileName: string;
  acceptedFileTypes: string[];
}

export interface ColorUtilityConfig {
  minValue: number;
  maxValue: number;
}

// Type aliases for better readability
export type PixelGrid = string[][];
export type ColorString = string;
export type EventHandler<T> = (event: T) => void;

// Enums for better type safety
export enum FileFormat {
  BMP = "bmp",
  PNG = "png",
  JPEG = "jpeg",
}

export enum ColorFormat {
  RGB = "rgb",
  HEX = "hex",
  HSL = "hsl",
}

// Interface for canvas operations
export interface CanvasOperations {
  drawPixel: (position: GridPosition, color: ColorString) => void;
  clearCanvas: () => void;
  drawGrid: () => void;
  getPixelColor: (position: GridPosition) => ColorString;
}

// Interface for file operations
export interface FileOperations {
  saveAsImage: (pixels: PixelGrid, format: FileFormat) => void;
  loadFromImage: (file: File) => Promise<PixelGrid>;
}

// Interface for color operations
export interface ColorOperations {
  rgbToString: (color: RGBColor) => ColorString;
  stringToRgb: (colorString: ColorString) => RGBColor;
  isValidRgbValue: (value: number) => boolean;
  generateRandomColor: () => RGBColor;
}
