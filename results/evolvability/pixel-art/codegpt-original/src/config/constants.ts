import {
  CanvasConfig,
  FileHandlerConfig,
  ColorUtilityConfig,
  RGBColor,
} from "../types";

// Canvas configuration
export const CANVAS_CONFIG: CanvasConfig = {
  gridSize: 32,
  pixelSize: 15,
  strokeColor: "#E0E0E0",
};

// File handler configuration
export const FILE_CONFIG: FileHandlerConfig = {
  defaultFileName: "pixel-art",
  acceptedFileTypes: ["image/*"],
};

// Color utility configuration
export const COLOR_CONFIG: ColorUtilityConfig = {
  minValue: 0,
  maxValue: 255,
};

// Default colors
export const DEFAULT_COLORS = {
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  TRANSPARENT: "transparent",
} as const;

// Default RGB color
export const DEFAULT_RGB_COLOR: RGBColor = {
  r: 0,
  g: 0,
  b: 0,
};

// UI Constants
export const UI_CONFIG = {
  colorPreviewHeight: 40,
  borderWidth: 2,
  borderRadius: 4,
  boxShadowBlur: 4,
  transitionDuration: "0.3s",
} as const;

// Grid drawing constants
export const GRID_CONFIG = {
  strokeWidth: 1,
  fillOpacity: 1,
} as const;
