import { CanvasConfig, RGBColor } from "../types";

// Canvas configuration
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  gridSize: 32,
  pixelSize: 15,
  strokeColor: "#E0E0E0",
  backgroundColor: "#FFFFFF",
};

// Color constants
export const DEFAULT_COLOR: RGBColor = { r: 0, g: 0, b: 0 };
export const WHITE_COLOR: RGBColor = { r: 255, g: 255, b: 255 };
export const BLACK_COLOR: RGBColor = { r: 0, g: 0, b: 0 };

// Color limits
export const COLOR_LIMITS = {
  MIN: 0,
  MAX: 255,
} as const;

// File handling constants
export const SUPPORTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/bmp",
  "image/gif",
  "image/webp",
] as const;

export const DEFAULT_SAVE_OPTIONS = {
  filename: "pixel-art",
  format: "png" as const,
  quality: 1.0,
};

// Error messages
export const ERROR_MESSAGES = {
  CANVAS_NOT_FOUND: "Canvas element not found",
  CONTEXT_NOT_AVAILABLE: "Canvas context not available",
  INVALID_FILE_TYPE: "Invalid file type. Please select an image file.",
  FILE_LOAD_ERROR: "Error loading file",
  INVALID_COLOR_VALUE: "Color value must be between 0 and 255",
  INVALID_COORDINATES: "Invalid coordinates provided",
  SAVE_ERROR: "Error saving file",
} as const;

// Validation constants
export const VALIDATION_RULES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_GRID_SIZE: 8,
  MAX_GRID_SIZE: 128,
  MIN_PIXEL_SIZE: 5,
  MAX_PIXEL_SIZE: 50,
} as const;
