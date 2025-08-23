import { RGBColor, HSLColor, ValidationResult } from "../types";
import { COLOR_LIMITS, ERROR_MESSAGES } from "../config/constants";

/**
 * Converts RGB color to CSS rgb string
 */
export const rgbToString = (color: RGBColor): string => {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
};

/**
 * Converts CSS rgb string to RGB color object
 */
export const stringToRgb = (colorString: string): RGBColor => {
  const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }

  // Handle hex colors
  if (colorString.startsWith("#")) {
    const hex = colorString.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  // Default to white if parsing fails
  return { r: 255, g: 255, b: 255 };
};

/**
 * Converts RGB to HSL
 */
export const rgbToHsl = (rgb: RGBColor): HSLColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Converts HSL to RGB
 */
export const hslToRgb = (hsl: HSLColor): RGBColor => {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

/**
 * Validates RGB color values
 */
export const validateRgbColor = (color: RGBColor): ValidationResult => {
  const errors: string[] = [];

  if (color.r < COLOR_LIMITS.MIN || color.r > COLOR_LIMITS.MAX) {
    errors.push(`Red ${ERROR_MESSAGES.INVALID_COLOR_VALUE}`);
  }
  if (color.g < COLOR_LIMITS.MIN || color.g > COLOR_LIMITS.MAX) {
    errors.push(`Green ${ERROR_MESSAGES.INVALID_COLOR_VALUE}`);
  }
  if (color.b < COLOR_LIMITS.MIN || color.b > COLOR_LIMITS.MAX) {
    errors.push(`Blue ${ERROR_MESSAGES.INVALID_COLOR_VALUE}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Clamps color values to valid range
 */
export const clampColor = (color: RGBColor): RGBColor => {
  return {
    r: Math.max(COLOR_LIMITS.MIN, Math.min(COLOR_LIMITS.MAX, color.r)),
    g: Math.max(COLOR_LIMITS.MIN, Math.min(COLOR_LIMITS.MAX, color.g)),
    b: Math.max(COLOR_LIMITS.MIN, Math.min(COLOR_LIMITS.MAX, color.b)),
  };
};

/**
 * Generates a random color
 */
export const generateRandomColor = (): RGBColor => {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
};

/**
 * Calculates color brightness (0-255)
 */
export const getColorBrightness = (color: RGBColor): number => {
  return Math.round((color.r * 299 + color.g * 587 + color.b * 114) / 1000);
};

/**
 * Determines if a color is light or dark
 */
export const isLightColor = (color: RGBColor): boolean => {
  return getColorBrightness(color) > 127;
};
