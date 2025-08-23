import { RGBColor, ColorOperations, ColorString } from "../types";
import { COLOR_CONFIG } from "../config/constants";

/**
 * Color utility class following Single Responsibility Principle
 * Handles all color-related operations and conversions
 */
export class ColorUtility implements ColorOperations {
  /**
   * Converts RGB color object to CSS color string
   */
  rgbToString(color: RGBColor): ColorString {
    const { r, g, b } = color;
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Converts CSS RGB string to RGB color object
   */
  stringToRgb(colorString: ColorString): RGBColor {
    // Handle rgb() format
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
      };
    }

    // Handle hex format
    const hexMatch = colorString.match(/^#([0-9A-F]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16),
      };
    }

    // Default fallback
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Validates if RGB value is within valid range
   */
  isValidRgbValue(value: number): boolean {
    return value >= COLOR_CONFIG.minValue && value <= COLOR_CONFIG.maxValue;
  }

  /**
   * Generates a random RGB color
   */
  generateRandomColor(): RGBColor {
    return {
      r: Math.floor(Math.random() * (COLOR_CONFIG.maxValue + 1)),
      g: Math.floor(Math.random() * (COLOR_CONFIG.maxValue + 1)),
      b: Math.floor(Math.random() * (COLOR_CONFIG.maxValue + 1)),
    };
  }

  /**
   * Clamps RGB value to valid range
   */
  clampRgbValue(value: number): number {
    return Math.max(
      COLOR_CONFIG.minValue,
      Math.min(COLOR_CONFIG.maxValue, value)
    );
  }

  /**
   * Converts RGB to hex format
   */
  rgbToHex(color: RGBColor): string {
    const toHex = (value: number) => {
      const hex = value.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
  }

  /**
   * Creates a copy of RGB color object
   */
  cloneColor(color: RGBColor): RGBColor {
    return { ...color };
  }

  /**
   * Checks if two colors are equal
   */
  areColorsEqual(color1: RGBColor, color2: RGBColor): boolean {
    return (
      color1.r === color2.r && color1.g === color2.g && color1.b === color2.b
    );
  }
}
