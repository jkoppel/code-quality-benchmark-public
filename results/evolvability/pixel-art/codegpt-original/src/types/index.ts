// Color-related types
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

// Grid and canvas types
export type PixelGrid = string[][];

export interface Coordinates {
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
  backgroundColor: string;
}

// File handling types
export interface FileLoadResult {
  success: boolean;
  data?: PixelGrid;
  error?: string;
}

export interface FileSaveOptions {
  filename: string;
  format: "png" | "bmp" | "jpeg";
  quality?: number;
}

// Component props types
export interface ColorPickerProps {
  selectedColor: RGBColor;
  onColorChange: (color: RGBColor) => void;
}

export interface CanvasProps {
  pixels: PixelGrid;
  selectedColor: RGBColor;
  config: CanvasConfig;
  onPixelClick: (position: GridPosition) => void;
}

export interface ControlsProps {
  onSave: () => void;
  onLoad: (file: File) => void;
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

// Error types
export interface PixelArtError {
  code: string;
  message: string;
  details?: any;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
