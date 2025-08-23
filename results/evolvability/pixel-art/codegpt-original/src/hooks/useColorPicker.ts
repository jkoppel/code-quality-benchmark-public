import { useState, useCallback } from "react";
import { RGBColor, HSLColor } from "../types";
import { DEFAULT_COLOR } from "../config/constants";
import {
  validateRgbColor,
  clampColor,
  rgbToHsl,
  hslToRgb,
} from "../utils/colorUtils";

/**
 * Custom hook for managing color picker state and operations
 * Follows Single Responsibility Principle - only manages color state
 */
export const useColorPicker = (initialColor: RGBColor = DEFAULT_COLOR) => {
  const [selectedColor, setSelectedColor] = useState<RGBColor>(initialColor);
  const [colorHistory, setColorHistory] = useState<RGBColor[]>([initialColor]);

  /**
   * Update the selected color with validation
   */
  const updateColor = useCallback((newColor: Partial<RGBColor>) => {
    setSelectedColor((prevColor) => {
      const updatedColor = { ...prevColor, ...newColor };
      const validation = validateRgbColor(updatedColor);

      if (!validation.isValid) {
        console.warn("Invalid color values:", validation.errors);
        return clampColor(updatedColor);
      }

      return updatedColor;
    });
  }, []);

  /**
   * Set red component
   */
  const setRed = useCallback(
    (r: number) => {
      updateColor({ r });
    },
    [updateColor]
  );

  /**
   * Set green component
   */
  const setGreen = useCallback(
    (g: number) => {
      updateColor({ g });
    },
    [updateColor]
  );

  /**
   * Set blue component
   */
  const setBlue = useCallback(
    (b: number) => {
      updateColor({ b });
    },
    [updateColor]
  );

  /**
   * Set entire color
   */
  const setColor = useCallback((color: RGBColor) => {
    const validation = validateRgbColor(color);
    const finalColor = validation.isValid ? color : clampColor(color);

    setSelectedColor(finalColor);

    // Add to history if it's a new color
    setColorHistory((prevHistory) => {
      const lastColor = prevHistory[prevHistory.length - 1];
      if (
        !lastColor ||
        lastColor.r !== finalColor.r ||
        lastColor.g !== finalColor.g ||
        lastColor.b !== finalColor.b
      ) {
        return [...prevHistory.slice(-9), finalColor]; // Keep last 10 colors
      }
      return prevHistory;
    });
  }, []);

  /**
   * Set color from HSL values
   */
  const setColorFromHSL = useCallback(
    (hsl: HSLColor) => {
      const rgbColor = hslToRgb(hsl);
      setColor(rgbColor);
    },
    [setColor]
  );

  /**
   * Get HSL representation of current color
   */
  const getHSL = useCallback((): HSLColor => {
    return rgbToHsl(selectedColor);
  }, [selectedColor]);

  /**
   * Select a color from history
   */
  const selectFromHistory = useCallback(
    (index: number) => {
      if (index >= 0 && index < colorHistory.length) {
        setSelectedColor(colorHistory[index]);
      }
    },
    [colorHistory]
  );

  /**
   * Reset to default color
   */
  const resetColor = useCallback(() => {
    setColor(DEFAULT_COLOR);
  }, [setColor]);

  /**
   * Generate random color
   */
  const randomColor = useCallback(() => {
    const randomRGB: RGBColor = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
    setColor(randomRGB);
  }, [setColor]);

  /**
   * Invert current color
   */
  const invertColor = useCallback(() => {
    const invertedColor: RGBColor = {
      r: 255 - selectedColor.r,
      g: 255 - selectedColor.g,
      b: 255 - selectedColor.b,
    };
    setColor(invertedColor);
  }, [selectedColor, setColor]);

  /**
   * Adjust brightness of current color
   */
  const adjustBrightness = useCallback(
    (factor: number) => {
      const adjustedColor: RGBColor = {
        r: Math.round(selectedColor.r * factor),
        g: Math.round(selectedColor.g * factor),
        b: Math.round(selectedColor.b * factor),
      };
      setColor(clampColor(adjustedColor));
    },
    [selectedColor, setColor]
  );

  return {
    selectedColor,
    colorHistory,
    setRed,
    setGreen,
    setBlue,
    setColor,
    setColorFromHSL,
    getHSL,
    selectFromHistory,
    resetColor,
    randomColor,
    invertColor,
    adjustBrightness,
    updateColor,
  };
};
